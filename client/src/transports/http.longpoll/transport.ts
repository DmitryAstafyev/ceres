import ATransport from '../transport.abstract';
import Middleware from './consumer.middleware.implementation';

import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import * as TransportProtocol from '../../protocols/connection/protocol.transport.longpoll';

import { SubdomainsController               } from '../common/subdomains';
import { Token                              } from '../common/transport.token';
import { Hook                               } from './transport.hook';
import { ConnectionParameters               } from './transport.parameters.implementation';
import { PendingTasks                       } from './transport.pending.storage';
import { Request                            } from './transport.request.connection';

export default class LongpollTransport extends ATransport<ConnectionParameters, Middleware> {
    public static Middleware = Middleware;
    public static Parameters = ConnectionParameters;

    private _logger:        Tools.Logger            = new Tools.Logger('Http.LongpollTransport');
    private _subdomains:    SubdomainsController | null;
    private _token:         Token                   = new Token();
    private _clientGUID:    string                  = Tools.guid();
    private _hook:          Hook                    = new Hook();
    private _tasks:         PendingTasks            = new PendingTasks();
    private _requests:      Map<string, Request>    = new Map();

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
        this._tasks.subscribe(PendingTasks.EVENTS.onTask,       this._onTask);
        this._tasks.subscribe(PendingTasks.EVENTS.onDisconnect, this._onTaskDisconnect);
        this._tasks.subscribe(PendingTasks.EVENTS.onError,      this._onTaskError);
    }

    public connect(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.state.set(ATransport.STATES.connecting);
            this.send((new TransportProtocol.Message.Handshake.Request({
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
                // Set token
                this._token.set(message.token as string);
                // Create hook
                this._createHook();
                // Create tasks
                this._createTasks();
                // Update state
                this.state.set(ATransport.STATES.connected);
                // Trigger event
                this.emit(ATransport.EVENTS.connected);
                // Resolve
                resolve();
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    public disconnect(): Promise<any> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public send(data: string, connecting: boolean = false): Promise<Protocol.TProtocolTypes | TransportProtocol.TProtocolTypes> {
        return new Promise((resolve, reject) => {
            const url = this._getURL();
            // Create request
            const request = new Request(url, data);
            // Save request
            this._requests.set(request.getId(), request);
            // Send request
            request.send().then((response: string) => {
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
        return new Promise((resolve, reject) => {
            this._hook.drop();
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
	 * Hooks
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    private _createHook() {
        const url = this._getURL();
        this._hook.create(url, this._clientGUID, this._token).then((message: Protocol.ConnectionError | Protocol.Disconnect) => {
            this._setUrlFree(url);
            let error: Error;
            if (message instanceof Protocol.ConnectionError) {
                error = new Error(this._logger.warn(`Hook connection is finished because connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`));
            }
            if (message instanceof Protocol.Disconnect) {
                error = new Error(this._logger.env(`Hook connection is finished because server disconnected. Reason: ${message.reason} (message: ${message.message}). Initialize hard reconnection.`));
            }
            this._drop().then(() => {
                this.state.set(ATransport.STATES.disconnected);
                this.emit(ATransport.EVENTS.disconnected, error);
            });
        }).catch((error: Error | Protocol.TProtocolTypes) => {
            this._setUrlFree(url);
            this._drop().then(() => {
                this.state.set(ATransport.STATES.disconnected);
                this.emit(ATransport.EVENTS.disconnected, error);
            });
        });
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
