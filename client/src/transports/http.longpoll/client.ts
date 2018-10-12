import * as DescMiddleware from '../../infrastructure/middleware/index';
import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import * as DescConnection from './connection/index';

import { ITransportInterface, TClientAlias } from '../../platform/interfaces/interface.transport';
import { SubdomainsController } from '../common/subdomains';
import { Hook } from './client.hook';
import { PendingTasks } from './client.pending.storage';
import { Pending } from './client.pending.task';
import { Request } from './client.request.connection';
import { Requests } from './client.request.storage';
import { EClientStates, State } from './client.state';
import { Token } from './client.token';

export { EClientStates };

const SETTINGS = {
    RECONNECTION_TIMEOUT: 3000, // ms
};

export enum EClientEvents {
    connected = 'connected',
    disconnected = 'disconnected',
    error = 'error',
    eventSent = 'eventSent',
    eventCome = 'eventCome',
    subscriptionDone = 'subscriptionDone',
    unsubscriptionDone = 'unsubscriptionDone',
    unsubscriptionAllDone = 'unsubscriptionAllDone',
    message = 'message',
}

export class Client extends Tools.EventEmitter implements ITransportInterface {

    public static STATES = EClientStates;
    public static EVENTS = EClientEvents;

    private _logger: Tools.Logger          = new Tools.Logger('Http.Client');
    private _token: Token                 = new Token();
    private _state: State                 = new State();
    private _hook: Hook                  = new Hook();
    private _tasks: PendingTasks          = new PendingTasks();
    private _requests: Requests              = new Requests();
    private _subscriptions: Tools.HandlersHolder  = new Tools.HandlersHolder();
    private _clientGUID: string                = Tools.guid();
    private _protocols: Tools.ProtocolsHolder = new Tools.ProtocolsHolder();
    private _parameters: DescConnection.ConnectionParameters;
    private _middleware: DescMiddleware.Middleware;
    private _subdomains: SubdomainsController | null;
    private _aliases: TClientAlias = {};

    constructor(
        parameters: DescConnection.ConnectionParameters,
        middleware?: DescMiddleware.Middleware,
    ) {
        super();
        if (!(parameters instanceof DescConnection.ConnectionParameters)) {
            if (parameters !== undefined) {
                throw new Error(this._logger.warn(`Get wrong parameters of connection. Expected <ConnectionParameters>. Gotten: `, parameters));
            }
            parameters = new DescConnection.ConnectionParameters({});
        }
        if (middleware !== undefined) {
            if (!(middleware instanceof DescMiddleware.Middleware)) {
                throw new Error(this._logger.warn(`Get wrong parameters of connection. Expected <Middleware>. Gotten: `, middleware));
            }
        } else {
            middleware = new DescMiddleware.Middleware({});
        }

        this._parameters = parameters;
        this._middleware = middleware;
        // Check subdomain settings
        const mask = SubdomainsController.getMask(this._parameters.getURL());
        if (mask instanceof Error) {
            throw new Error(this._logger.warn(mask.message));
        }
        if (mask !== null) {
            this._subdomains = new SubdomainsController(
                this._parameters.getURL(),
                mask,
                this._parameters.broadcast,
            );
        } else {
            this._subdomains = null;
        }
        // Bind shared methods
        this._getURL = this._getURL.bind(this);
        this._setUrlFree = this._setUrlFree.bind(this);
        // Subscribe to tasks
        this._onTask = this._onTask.bind(this);
        this._onTaskDisconnect = this._onTaskDisconnect.bind(this);
        this._onTaskError = this._onTaskError.bind(this);
        this._tasks.subscribe(PendingTasks.EVENTS.onTask, this._onTask);
        this._tasks.subscribe(PendingTasks.EVENTS.onDisconnect, this._onTaskDisconnect);
        this._tasks.subscribe(PendingTasks.EVENTS.onError, this._onTaskError);
        // Connect
        this._connect().catch((error: Error) => {
            this._logger.warn(`Error of connection on start due error: ${error.message}`);
        });
    }

    /**
     * Destroy client
     * @returns {Promise<void>}
     */
    public destroy(): Promise<void> {
        return this._drop().then(() => {
            this._token.drop();
            this._subscriptions.clear();
        });
    }

    /**
     * Handle handshake response
     * @param response {string}
     * @returns {void}
     */
    public _onResponseHandshake(response: string): Promise<Protocol.Message.Handshake.Response> {
        return new Promise((resolve, reject) => {
            this._getProtocolMessage(response).then((message: Protocol.TProtocolTypes) => {
                if (!(message instanceof Protocol.Message.Handshake.Response)) {
                    const error: Error = new Error(this._logger.warn(`On this state (${this._state.get()}) expected authorization confirmation, but gotten: ${Tools.inspect(message)}.`));
                    this.emit(EClientEvents.error, {
                        details: undefined,
                        message: error.message,
                        reason: undefined,
                    });
                    return reject(error);
                }
                if (typeof message.token !== 'string' || message.token.trim() === '') {
                    const error: Error = new Error(this._logger.warn(`Fail to authorize request due reason: ${message.reason} ${message.error !== void 0 ? `(${message.error})` : ''}`));
                    this.emit(EClientEvents.error, {
                        details: undefined,
                        message: error.message,
                        reason: message.reason,
                    });
                    return reject(error);
                }
                resolve(message);
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    /**
     * Handle reconnection response
     * @param response {string}
     * @returns {void}
     */
    public _onResponseReconnection(response: string): Promise<Protocol.Message.Reconnection.Response> {
        return new Promise((resolve, reject) => {
            this._getProtocolMessage(response).then((message: Protocol.TProtocolTypes) => {
                if (message instanceof Protocol.ConnectionError) {
                    const error: Error = new Error(this._logger.warn(`Fail to reconnect request due reason: ${message.reason} ${message.message !== void 0 ? `(${message.message})` : ''}`));
                    this.emit(EClientEvents.error, {
                        details: undefined,
                        message: error.message,
                        reason: message.reason,
                    });
                    return reject(error);
                }
                if (!(message instanceof Protocol.Message.Reconnection.Response)) {
                    const error: Error = new Error(this._logger.warn(`On this state (${this._state.get()}) expected authorization confirmation, but gotten: ${Tools.inspect(message)}.`));
                    this.emit(EClientEvents.error, {
                        details: undefined,
                        message: error.message,
                        reason: undefined,
                    });
                    return reject(error);
                }
                if (!message.allowed) {
                    const error: Error = new Error(this._logger.env(`Reconnection isn't allowed.`));
                    this.emit(EClientEvents.error, {
                        details: undefined,
                        message: error.message,
                        reason: undefined,
                    });
                    return reject(error);
                }
                resolve(message);
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Events: Public
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    /**
     * Emit event
     * @param event {any} implementation of event
     * @param protocol {Protocol} implementation of event's protocol
     * @returns Promise
     */
    public eventEmit(event: any, protocol: any, aliases: TClientAlias = {}): Promise<Protocol.Message.Event.Response> {
        return new Promise((resolve, reject) => {
            if (this._state.get() !== EClientStates.connected) {
                return reject(new Error(`Cannot do operation: client isn't connected.`));
            }
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            const eventSignature = this._getEntitySignature(event);
            if (eventSignature instanceof Error) {
                return reject(eventSignature);
            }
            const url = this._getURL();
            const _aliases: Protocol.KeyValue[] = [];
            try {
                if (typeof aliases !== 'object' || aliases === null) {
                    throw new Error(`As aliases can be provided an object { [key: string]: string }.`);
                }
                Object.keys(aliases).forEach((key: string) => {
                    if (typeof aliases[key] !== 'string' || aliases[key].trim() === '') {
                        throw new Error(`Alias with key = "${key}" is defined incorrectly. It should be not empty {string}.`);
                    }
                    _aliases.push(new Protocol.KeyValue({
                        key: key,
                        value: aliases[key],
                    }));
                });
            } catch (error) {
                return reject(error);
            }
            this._requests.send(url, (new Protocol.Message.Event.Request({
                aliases: _aliases,
                clientId: this._clientGUID,
                event: new Protocol.EventDefinition({
                    body: event.stringify(),
                    event: eventSignature,
                    protocol: protocolSignature,
                }),
                token: this._token.get(),
            })).stringify())
                .then((message: Protocol.TProtocolTypes) => {
                    this._setUrlFree(url);
                    if (message instanceof Protocol.ConnectionError) {
                        return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                    }
                    if (!(message instanceof Protocol.Message.Event.Response)) {
                        return reject(new Error(`Unexpected server response (expected "Protocol.Message.Event.Response"): ${message.stringify()}`));
                    }
                    this._logger.env(`For event found ${message.subscribers} subscribers.`);
                    this.emit(EClientEvents.eventSent, message);
                    resolve(message);
                })
                .catch((error: Error) => {
                    this._setUrlFree(url);
                    this._logger.env(`Error emit event: ${error.message}.`);
                    reject(error);
                });
        });
    }

    /**
     * Subscribe handler to event
     * @param event {any} implementation of event
     * @param protocol {Protocol} implementation of event's protocol
     * @param handler {Function} handler
     * @returns Promise
     */
    public subscribeEvent(event: any, protocol: any, handler: (...args: any[]) => any): Promise<Protocol.Message.Subscribe.Response> {
        // TODO: subscription is already exist. Server doesn't allow subscribe twice. If user need it, he can do it by himself, but server should have only one subscription
        // TODO: restore subscription after reconnection. Server unsubscribe all if client was disconnected
        return new Promise((resolve, reject) => {
            if (this._state.get() !== EClientStates.connected) {
                return reject(new Error(`Cannot do operation: client isn't connected.`));
            }
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            const eventSignature = this._getEntitySignature(event);
            if (eventSignature instanceof Error) {
                return reject(eventSignature);
            }
            this._protocols.add(protocol)
                .then(() => {
                    const subscription = this._subscriptions.subscribe(protocolSignature, eventSignature, handler);
                    if (subscription instanceof Error) {
                        return reject(subscription);
                    }
                    const url = this._getURL();
                    this._requests.send(url, (new Protocol.Message.Subscribe.Request({
                        clientId: this._clientGUID,
                        subscription: new Protocol.Subscription({
                            event: eventSignature,
                            protocol: protocolSignature,
                        }),
                        token: this._token.get(),
                    })).stringify()).then((message: Protocol.TProtocolTypes) => {
                        this._setUrlFree(url);
                        if (message instanceof Protocol.ConnectionError) {
                            return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                        }
                        if (!(message instanceof Protocol.Message.Subscribe.Response)) {
                            this._subscriptions.unsubscribe(protocolSignature, eventSignature);
                            return reject(new Error(`Unexpected server response (expected "EventResponse"): ${message.stringify()}`));
                        }
                        if (!message.status) {
                            this._subscriptions.unsubscribe(protocolSignature, eventSignature);
                            return reject(this._logger.env(`Subscription to protocol ${protocolSignature}, event ${eventSignature} wasn't done.`));
                        }
                        this._logger.env(`Subscription from protocol ${protocolSignature}, event ${eventSignature} has status: ${message.status}.`);
                        this.emit(EClientEvents.subscriptionDone, message);
                        resolve(message);
                    }).catch((error: Error) => {
                        this._setUrlFree(url);
                        this._logger.env(`Error subscribe event: ${error.message}`);
                        this._subscriptions.unsubscribe(protocolSignature, eventSignature);
                        reject(error);
                    });
                })
                .catch((error: Error) => {
                    this._logger.env(`Error subscribe event: ${error.message}`);
                    reject(error);
                });
        });
    }

    /**
     * Unsubscribe from event
     * @param event {any} implementation of event
     * @param protocol {Protocol} implementation of event's protocol
     * @returns Promise
     */
    public unsubscribeEvent(event: any, protocol: any): Promise<Protocol.Message.Unsubscribe.Response> {
        return new Promise((resolve, reject) => {
            if (this._state.get() !== EClientStates.connected) {
                return reject(new Error(`Cannot do operation: client isn't connected.`));
            }
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            const eventSignature = this._getEntitySignature(event);
            if (eventSignature instanceof Error) {
                return reject(eventSignature);
            }
            const url = this._getURL();
            this._requests.send(url, (new Protocol.Message.Unsubscribe.Request({
                clientId: this._clientGUID,
                subscription: new Protocol.Subscription({
                    event: eventSignature,
                    protocol: protocolSignature,
                }),
                token: this._token.get(),
            })).stringify()).then((message: Protocol.TProtocolTypes) => {
                this._setUrlFree(url);
                if (message instanceof Protocol.ConnectionError) {
                    return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                }
                if (!(message instanceof Protocol.Message.Unsubscribe.Response)) {
                    return reject(new Error(`Unexpected server response (expected "Protocol.Message.Unsubscribe.Response"): ${message.stringify()}`));
                }
                if (!message.status) {
                    return reject(this._logger.env(`Unsubscription from protocol ${protocolSignature}, event ${eventSignature} wasn't done.`));
                }
                this._logger.env(`Unsubscription from protocol ${protocolSignature}, event ${eventSignature} has status: ${message.status}.`);
                this._subscriptions.unsubscribe(protocolSignature, eventSignature);
                this.emit(EClientEvents.unsubscriptionDone, message);
                resolve(message);
            }).catch((error: Error) => {
                this._setUrlFree(url);
                this._logger.env(`Error unsubscribe event: ${error.message}`);
                reject(error);
            });
        });
    }

    /**
     * Unsubscribe all handlers from all events in scope of protocol
     * @param protocol {Protocol} implementation of event's protocol
     * @returns Promise
     */
    public unsubscribeAllEvents(protocol: any): Promise<Protocol.Message.UnsubscribeAll.Response> {
        return new Promise((resolve, reject) => {
            if (this._state.get() !== EClientStates.connected) {
                return reject(new Error(`Cannot do operation: client isn't connected.`));
            }
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            const url = this._getURL();
            this._requests.send(url, (new Protocol.Message.UnsubscribeAll.Request({
                clientId: this._clientGUID,
                subscription: new Protocol.Subscription({
                    protocol: protocolSignature,
                }),
                token: this._token.get(),
            })).stringify()).then((message: Protocol.TProtocolTypes) => {
                this._setUrlFree(url);
                if (message instanceof Protocol.ConnectionError) {
                    return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                }
                if (!(message instanceof Protocol.Message.UnsubscribeAll.Response)) {
                    return reject(new Error(`Unexpected server response (expected "Protocol.Message.UnsubscribeAll.Response"): ${message.stringify()}`));
                }
                if (!message.status) {
                    return reject(this._logger.env(`Unsubscription from all events of protocol ${protocolSignature} wasn't done.`));
                }
                this._logger.env(`Unsubscription from all events in scope of protocol ${protocolSignature} has status: ${message.status}.`);
                this._subscriptions.unsubscribe(protocolSignature);
                this.emit(EClientEvents.unsubscriptionAllDone, message);
                resolve(message);
            }).catch((error: Error) => {
                this._setUrlFree(url);
                this._logger.env(`Error unsubscribe all: ${error.message}.`);
                reject(error);
            });
        });
    }

    /**
     * Bind client with aliases
     * @param aliases {TClientAlias} object with aliases definition
     * @returns Promise
     */
    public ref(aliases: TClientAlias): Promise<Protocol.Message.Registration.Response> {
        return new Promise((resolve, reject) => {
            if (this._state.get() !== EClientStates.connected) {
                return reject(new Error(`Cannot do operation: client isn't connected.`));
            }
            if (typeof aliases !== 'object' || aliases === null) {
                return reject(new Error(`As aliases can be used only object { [key: string]: string }.`));
            }
            const _aliases: Protocol.KeyValue[] = [];
            let valid: boolean = true;
            Object.keys(aliases).forEach((key: string) => {
                if (typeof aliases[key] !== 'string') {
                    valid = false;
                }
                if (!valid) {
                    return;
                }
                _aliases.push(new Protocol.KeyValue({ key: key, value: aliases[key]}));
            });
            if (!valid) {
                return reject(new Error(`As aliases can be used only object { [key: string]: string }. Some of values of target isn't a {string}.`));
            }
            const url = this._getURL();
            this._requests.send(url, (new Protocol.Message.Registration.Request({
                aliases: _aliases,
                clientId: this._clientGUID,
                token: this._token.get(),
            })).stringify()).then((message: Protocol.TProtocolTypes) => {
                this._setUrlFree(url);
                if (message instanceof Protocol.ConnectionError) {
                    return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                }
                if (!(message instanceof Protocol.Message.Registration.Response)) {
                    return reject(new Error(`Unexpected server response (expected "Protocol.Message.Registration.Response"): ${message.stringify()}`));
                }
                if (!message.status) {
                    return reject(this._logger.env(`Registration of client wasn't done.`));
                }
                this._logger.env(`Registration of client has status: ${message.status}.`);
                this._aliases = Object.assign({}, aliases);
                resolve(message);
            }).catch((error: Error) => {
                this._setUrlFree(url);
                this._logger.env(`Error registration of client: ${error.message}.`);
                reject(error);
            });
        });
    }

    public request(request: any, protocol: any) {
        return new Promise((resolve, reject) => {
            const signature = this._getEntitySignature(protocol);
            if (signature instanceof Error) {
                return reject(signature);
            }
            // implementation
        });
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * URL manipulation
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _getURL(): string {
        if (this._subdomains === null) {
            return this._parameters.getURL();
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
	 * Connection / reconnection
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    /**
     * Made attempt to connect to server
     * @returns {void}
     */
    private _connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._state.get() !== EClientStates.created && this._state.get() !== EClientStates.reconnecting) {
                return reject(new Error(this._logger.error(`Attempt to connect on state "${this._state.get()}".`)));
            }
            this._state.set(EClientStates.connecting);
            const url = this._getURL();
            const request = new Request(url, (new Protocol.Message.Handshake.Request({
                clientId: this._clientGUID,
            })).stringify());
            request.send()
                .then((response: string) => {
                    this._setUrlFree(url);
                    this._logger.env(`Request guid: ${request.getId()} is finished successfuly: ${Tools.inspect(response)}`);
                    this._onResponseHandshake(response).then((message: Protocol.Message.Handshake.Response) => {
                        // Set token
                        this._token.set(message.token as string);
                        // Initialize connection
                        this._initialize();
                        // Resolve
                        resolve();
                    }).catch((error: Error) => {
                        this._setUrlFree(url);
                        reject(this._errorOnConnection(`Fail to proccess connection response`, error));
                    });
                })
                .catch((error: Error) => {
                    this._setUrlFree(url);
                    reject(this._errorOnConnection(`Fail to connect`, error));
                });
        });
    }

    /**
     * Made attempt to reconnect to server
     * @returns {void}
     */
    private _reconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._state.get() !== EClientStates.created && this._state.get() !== EClientStates.reconnecting) {
                return reject(new Error(this._logger.error(`Attempt to reconnect on state "${this._state.get()}".`)));
            }
            this._state.set(EClientStates.connecting);
            const url = this._getURL();
            const request = new Request(url, (new Protocol.Message.Reconnection.Request({
                clientId: this._clientGUID,
                token: this._token.get(),
            })).stringify());
            request.send()
                .then((response: string) => {
                    this._setUrlFree(url);
                    this._logger.env(`Request guid: ${request.getId()} is finished successfuly: ${Tools.inspect(response)}`);
                    this._onResponseReconnection(response).then((message: Protocol.Message.Reconnection.Response) => {
                        // Initialize connection
                        this._initialize();
                        // Resolve
                        resolve();
                    }).catch((error: Error) => {
                        reject(this._errorOnConnection(`Fail to proccess reconnection response`, error));
                    });
                })
                .catch((error: Error) => {
                    this._setUrlFree(url);
                    reject(this._errorOnConnection(`Fail to reconnect`, error));
                });
        });
    }

    private _errorOnConnection(message: string, error: Error) {
        this.emit(EClientEvents.error, {
            details: undefined,
            error: error,
            message: this._logger.warn(`Attempt to reconnect to "${this._parameters.getURL()}" was failed (next attempt to connectin in ${SETTINGS.RECONNECTION_TIMEOUT}ms) due error: ${message}`),
            reason: undefined,
        });
        this._hardReconnection();
        return error;
    }

    /**
     * Made attempt to reconnect softly (without authorization) in defined timeout
     * @returns {void}
     */
    private _softReconnection() {
        this._state.set(EClientStates.reconnecting);
        if (this._token.get() === '') {
            this._logger.warn(`Cannot do soft reconnection, because token isn't set. Will do hard reconnection.`);
            return this._hardReconnection();
        }
        this._drop().then(() => {
            setTimeout(() => {
                this._reconnect().catch((error: Error) => {
                    this._logger.warn(`Error of soft reconnection on start due error: ${error.message}`);
                });
            }, SETTINGS.RECONNECTION_TIMEOUT);
        });
    }

    /**
     * Made attempt to reconnect hardly (with authorization) in defined timeout
     * @returns {void}
     */
    private _hardReconnection() {
        this._state.set(EClientStates.reconnecting);
        this._drop().then(() => {
            this._token.drop();
            setTimeout(() => {
                this._connect().catch((error: Error) => {
                    this._logger.warn(`Error of hard reconnectionn on start due error: ${error.message}`);
                });
            }, SETTINGS.RECONNECTION_TIMEOUT);
        });
    }

    /**
     * Drop all services and requests
     * @returns {Promise<void>}
     */
    private _drop(): Promise<void> {
        return new Promise((resolve) => {
            this._hook.drop();
            this._tasks.stop();
            this._requests.drop();
            resolve();
        });
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Responses
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    /**
     * Extract connection protocol message
     * @param response {string}
     * @returns {void}
     */
    private _getProtocolMessage(response: string): Promise<Protocol.TProtocolTypes> {
        return new Promise((resolve, reject) => {
            const message = Protocol.parse(response);
            if (message instanceof Error) {
                this.emit(EClientEvents.error, {
                    details: undefined,
                    message: this._logger.warn(`Cannot parse response due error: ${message.message}`),
                    reason: undefined,
                });
                return reject(message);
            }
            return resolve(message);
        });
    }

    private _initialize() {
        // Set state
        this._state.set(EClientStates.connected);
        // Create hook
        const url = this._getURL();
        this._hook.create(url, this._clientGUID, this._token)
            .then((message: Protocol.ConnectionError | Protocol.Disconnect) => {
                this._setUrlFree(url);
                if (message instanceof Protocol.ConnectionError) {
                    this._logger.warn(`Hook connection is finished because connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`);
                }
                if (message instanceof Protocol.Disconnect) {
                    this._logger.env(`Hook connection is finished because server disconnected. Reason: ${message.reason} (message: ${message.message}). Initialize hard reconnection.`);
                }
                this._hardReconnection();
            })
            .catch((error: Error | Protocol.TProtocolTypes) => {
                this._setUrlFree(url);
                this.emit(EClientEvents.disconnected, error);
                if (error instanceof Error) {
                    this._logger.warn(`Hook connection is finished with  error: ${error.message}. Initialize soft reconnection.`);
                    this._softReconnection();
                } else {
                    this._logger.warn(`Server returns unexpected response: ${error.stringify()}. Initialize hard reconnection.`);
                    this._hardReconnection();
                }
            });
        // Create pending
        this._tasks.start(this._getURL, this._setUrlFree, this._clientGUID, this._token);
        // Trigger connection event
        this.emit(EClientEvents.connected);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Tasks
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _onTask(message: Protocol.Message.Pending.Response) {
        if (message.event instanceof Protocol.EventDefinition) {
            // Processing income event
            return this._emitIncomeEvent(message.event);
        }
        // Here processing of request results also
    }

    private _onTaskDisconnect(message: Protocol.Disconnect) {
        return false;
    }

    private _onTaskError(error: Error) {
        this._logger.warn(`Pending task is finished with error: ${error.message}. Initialize reconnection.`);
        // Note: We should not reconnect here, because hooks care about it
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Events: private
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _emitIncomeEvent(message: Protocol.EventDefinition) {
        this._protocols.parse(message.protocol, message.body)
            .then((event: any) => {
                this._subscriptions.emit(message.protocol, event.getSignature(), event);
            })
            .catch((error: Error) => {
                this._logger.env(`Error during emit income event: ${error.message}.`);
            });
    }

    /**
     * Gets entity's signature
     * @param protocol {Protocol} implementation of protocol
     * @returns {string | Error}
     */
    private _getEntitySignature(entity: any): string | Error {
        if ((typeof entity !== 'object' || entity === null) && typeof entity !== 'function') {
            return new Error('No protocol found. As protocol expecting: constructor or instance of protocol.');
        }
        if (typeof entity.getSignature !== 'function' || typeof entity.getSignature() !== 'string' || entity.getSignature().trim() === '') {
            return new Error('No sigature of protocol found');
        }
        return entity.getSignature();
    }

}
