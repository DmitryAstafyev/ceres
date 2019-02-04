import { ATransport, Tools, Protocol, Token } from 'ceres.client.consumer';
import Middleware from './consumer.middleware.implementation';

import * as TransportProtocol from './protocols/protocol.transport.ws';

import { SubdomainsController               } from './subdomains';
import { ConnectionParameters               } from './transport.parameters.implementation';
import { PendingTasks                       } from './transport.pending.storage';
import { Request                            } from './transport.request.connection';

export { ConnectionParameters, Middleware };

export default class LongpollTransport extends ATransport<ConnectionParameters, Middleware> {
    public static Middleware = Middleware;
    public static Parameters = ConnectionParameters;

    private _logger:            Tools.Logger            = new Tools.Logger('Http.LongpollTransport');
    private _subdomains:        SubdomainsController | null;
    private _token:             Token                   = new Token();
    private _clientGUID:        string                  = Tools.guid();
    private _tasks:             PendingTasks            = new PendingTasks();
    private _requests:          Map<string, Request>    = new Map();
    private _socket:            WebSocket | undefined;
    private _wsResolversHolder: Tools.HandlersHolder    = new Tools.HandlersHolder();

    constructor(parameters: ConnectionParameters, middleware?: Middleware) {
        super(parameters);
        if (middleware !== undefined) {
            if (!(middleware instanceof Middleware)) {
                throw new Error(this._logger.warn(`Get wrong parameters of connection. Expected <Middleware>. Gotten: `, middleware));
            }
        } else {
            middleware = new Middleware({});
        }
        this.middleware = middleware;
        // Check subdomain settings
        const mask = SubdomainsController.getMask(this.parameters.getURL());
        if (mask instanceof Error) {
            throw new Error(this._logger.warn(mask.message));
        }
        if (mask !== null) {
            this._subdomains = new SubdomainsController(
                this.parameters.getURL(),
                mask,
                this.parameters.broadcast,
            );
        } else {
            this._subdomains = null;
        }
        // Bind shared methods
        this._getURL = this._getURL.bind(this);
        this._setUrlFree = this._setUrlFree.bind(this);
        // Subscribe to tasks
        this._onTask            = this._onTask.bind(this);
        this._onTaskDisconnect  = this._onTaskDisconnect.bind(this);
        this._onTaskError       = this._onTaskError.bind(this);
        this._onWSMessage       = this._onWSMessage.bind(this);
        this._onWSClose         = this._onWSClose.bind(this);
        this._onWSError         = this._onWSError.bind(this);
        this._tasks.subscribe(PendingTasks.EVENTS.onTask,       this._onTask);
        this._tasks.subscribe(PendingTasks.EVENTS.onDisconnect, this._onTaskDisconnect);
        this._tasks.subscribe(PendingTasks.EVENTS.onError,      this._onTaskError);
    }

    public connect(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.state.set(ATransport.STATES.connecting);
            this._sendViaHTML((new TransportProtocol.Message.Handshake.Request({
                guid: Tools.guid(),
                clientId: this._clientGUID,
            })).stringify(), true).then((message: Protocol.TProtocolTypes | TransportProtocol.TProtocolTypes) => {
                if (!(message instanceof TransportProtocol.Message.Handshake.Response)) {
                    const error: Error = new Error(this._logger.warn(`On this state (${this.state.get()}) expected authorization confirmation, but gotten: ${Tools.inspect(message)}.`));
                    return reject(error);
                }
                if (typeof message.token !== 'string' || message.token.trim() === '') {
                    const error: Error = new Error(this._logger.warn(`Fail to authorize request due reason: ${message.reason} ${message.error !== void 0 ? `(${message.error})` : ''}`));
                    return reject(error);
                }
                // Update clientId
                this._clientGUID = message.clientId;
                // Set token
                this._token.set(message.token as string);
                // Create WS connection
                this._createWSConnection().then((socket: WebSocket) => {
                    // Bind WS handler
                    this._socket = socket;
                    this._socket.addEventListener('message', this._onWSMessage);
                    this._socket.addEventListener('close', this._onWSClose);
                    this._socket.addEventListener('error', this._onWSError);
                    // Create tasks
                    this._createTasks();
                    // Update state
                    this.state.set(ATransport.STATES.connected);
                    // Trigger event
                    this.emit(ATransport.EVENTS.connected);
                    // Resolve
                    resolve();
                }).catch((WSConnectionError) => {
                    reject(WSConnectionError);
                });
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    public disconnect(): Promise<any> {
        return new Promise((resolve) => {
            this._drop().then(() => {
                resolve();
            });
        });
    }

    public send(data: string | Uint8Array): Promise<Protocol.TProtocolTypes | TransportProtocol.TProtocolTypes> {
        return new Promise((resolve, reject) => {
            if ((typeof data !== 'string' || data.trim() === '') && !(data instanceof Uint8Array)) {
                return reject(new Error(this._logger.error(`Only string or Uint8Array can be sent via transport.`)));
            }
            if (data.length < (this.parameters.wsPackageMaxSize as number)) {
                this._sendViaWS(data).then(resolve).catch(reject);
            } else {
                this._sendViaHTML(data).then(resolve).catch(reject);
            }
        });
    }

    public getClientId(): string {
        return this._clientGUID;
    }

    public getClientToken(): string {
        return this._token.get();
    }

    public getInfo(): string {
        return this.parameters.getURL();
    }

    private _drop(): Promise<void> {
        return new Promise((resolve) => {
            if (this._socket) {
                this._socket.close();
                this._socket.removeEventListener('message', this._onWSMessage);
                this._socket = undefined;
            }
            this._tasks.stop();
            this._requests.forEach((request: Request) => {
                request.close();
            });
            this._requests.clear();
            this._token.drop();
            resolve();
        });
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * HTML requests
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _sendViaHTML(data: string | Uint8Array, connecting: boolean = false): Promise<Protocol.TProtocolTypes | TransportProtocol.TProtocolTypes> {
        return new Promise((resolve, reject) => {
            const url = this._getURL();
            // Create request
            const request = new Request(url, data);
            // Save request
            this._requests.set(request.getId(), request);
            // Send request
            request.send().then((response: string | Uint8Array) => {
                const next = new Promise((resolveNext, rejectNext) => {
                    if (connecting) {
                        (this.middleware as Middleware).connecting(request.getXMLHttpRequest(), response).then(() => {
                            resolveNext();
                        }).catch((middlewareError: Error) => {
                            this._logger.error(`Connecting request was rejected on middleware level due error: ${middlewareError.message}`);
                            rejectNext(middlewareError);
                        });
                    } else {
                        resolveNext();
                    }
                });
                next.then(() => {
                    this._requests.delete(request.getId());
                    this._setUrlFree(url);
                    const message = TransportProtocol.parseFrom(response, [TransportProtocol, Protocol]);
                    if (message instanceof Error) {
                        this._logger.warn(`Request guid: ${request.getId()} is finished due error: ${message.message}. Request body: ${Tools.inspect(response)}`);
                        return reject(message);
                    }
                    this._logger.env(`Request guid: ${request.getId()} is finished successfuly. Message: ${message.getSignature()}`);
                    resolve(message);
                }).catch((error: Error) => {
                    this._requests.delete(request.getId());
                    this._setUrlFree(url);
                    reject(error);
                });
            }).catch((error: Error) => {
                this._requests.delete(request.getId());
                this._setUrlFree(url);
                reject(error);
            });
        });
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * WS
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _sendViaWS(data: string | Uint8Array): Promise<Protocol.TProtocolTypes | TransportProtocol.TProtocolTypes> {
        return new Promise((resolve, reject) => {
            if (!this._socket) {
                return reject(new Error(this._logger.error(`WebSocket connection isn't okay.`)));
            }
            const message = TransportProtocol.parseFrom(data, [TransportProtocol, Protocol]);
            if (message instanceof Error) {
                this._logger.warn(`Fail parse outgoing message due error: ${message.message}.`);
                return reject(message);
            }
            if (typeof message.guid !== 'string' || message.guid.trim() === '') {
                return reject(new Error(this._logger.error(`Fail extract guid of outgoing message.`)));
            }
            const guid = message.guid;
            // Store handler
            this._wsResolversHolder.add('ws', guid, resolve);
            this._socket.send(data);
        });
    }

    private _createWSConnection(): Promise<WebSocket> {
        const self = this;
        return new Promise((resolve, reject) => {
            function bind() {
                socket.addEventListener('open', onOpen);
                socket.addEventListener('error', onError);    
            }
            function unbind() {
                socket.removeEventListener('open', onOpen);
                socket.removeEventListener('error', onError);    
            }
            const onOpen = function() {
                unbind();
                resolve(socket);
            }.bind(self);
            const onError = function(event: Event) {
                unbind();
                reject(new Error(self._logger.error(`Connection error`)));
            }.bind(self);
            // Create WebSocket connection.
            const socket = new WebSocket(self.parameters.getWSURL(), self._token.get());
            socket.binaryType = "arraybuffer";
            bind();
        });
    }

    private _onWSMessage(event: MessageEvent) {
        if ((typeof event.data !== 'string' || event.data.trim() === '') && !(event.data instanceof ArrayBuffer)) {
            return this._logger.warn(`Server sent via WS not valid data: ${typeof event.data}.`);
        }
        const response = typeof event.data === 'string' ? event.data : new Uint8Array(event.data);
        const message = TransportProtocol.parseFrom(response, [TransportProtocol, Protocol]);
        if (message instanceof Error) {
            return this._logger.warn(`Server sent invalid data with error: ${message.message}. Response body: ${Tools.inspect(response)}`);
        }
        if (typeof message.guid !== 'string' || message.guid.trim() === '') {
            return this._logger.error(`Server sent data without guid: ${Tools.inspect(message)}.`);
        }
        const guid = message.guid;
        // Check waiting resolvers
        if (this._wsResolversHolder.has('ws', guid)) {
            const resolver = this._wsResolversHolder.get('ws', guid) as (any: any) => any;
            this._wsResolversHolder.remove('ws', guid);
            return resolver(message);
        }
        // This is new message and has to be sent
        this.emit(ATransport.EVENTS.message, message);
    }

    private _onWSClose() {
        this._drop().then(() => {
            this.state.set(ATransport.STATES.disconnected);
            this.emit(ATransport.EVENTS.disconnected, new Error(`Connection is closed.`));
        });
    }

    private _onWSError(event: Event) {
        this._drop().then(() => {
            this.state.set(ATransport.STATES.disconnected);
            this.emit(ATransport.EVENTS.disconnected, new Error(`Connection is closed with error: ${Tools.inspect(event)}`));
        });
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * URL manipulation
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _getURL(): string {
        if (this._subdomains === null) {
            return this.parameters.getURL();
        }
        const url = this._subdomains.get();
        this._subdomains.setBusy(url);
        return url;
    }

    private _setUrlFree(url: string) {
        if (this._subdomains === null) {
            return;
        }
        return this._subdomains.setFree(url);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Tasks
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _createTasks() {
        this._tasks.start(this._getURL, this._setUrlFree, this._clientGUID, this._token);
    }

    private _onTask(message: TransportProtocol.Message.Pending.Response) {
        this.emit(ATransport.EVENTS.message, message);
    }

    private _onTaskDisconnect(message: Protocol.Disconnect) {
        return false;
    }

    private _onTaskError(error: Error) {
        this._logger.warn(`Pending task is finished with error: ${error.message}. Initialize reconnection.`);
        // Note: We should not reconnect here, because hooks care about it
    }
}
