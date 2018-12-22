import * as DescMiddleware from '../../infrastructure/middleware/index';
import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import * as DescConnection from './connection/index';

import { ITransportInterface, TClientAlias  } from '../../platform/interfaces/interface.transport';
import { SubdomainsController               } from '../common/subdomains';
import { Hook                               } from './client.hook';
import { PendingTasks                       } from './client.pending.storage';
import { Request                            } from './client.request.connection';
import { Requests                           } from './client.request.storage';
import { EClientStates, State               } from './client.state';
import { Token                              } from './client.token';

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

type TQuery             = { [key: string]: string};
type THandler           = (...args: any[]) => any;

export interface IDemandOptions {
    pending?: boolean;
    scope?: Protocol.Message.Demand.Options.Scope;
}

export class Client extends Tools.EventEmitter implements ITransportInterface {

    public static STATES = EClientStates;
    public static EVENTS = EClientEvents;
    public static DemandOptions = {
        scope: Protocol.Message.Demand.Options.Scope,
    };

    private _logger:            Tools.Logger            = new Tools.Logger('Http.Client');
    private _token:             Token                   = new Token();
    private _state:             State                   = new State();
    private _hook:              Hook                    = new Hook();
    private _tasks:             PendingTasks            = new PendingTasks();
    private _requests:          Requests                = new Requests();
    private _subscriptions:     Tools.EmittersHolder    = new Tools.EmittersHolder();
    private _clientGUID:        string                  = Tools.guid();
    private _protocols:         Tools.ProtocolsHolder   = new Tools.ProtocolsHolder();
    private _aliases:           TClientAlias            = {};
    private _demands:           Tools.HandlersHolder    = new Tools.HandlersHolder();
    private _pendingDemands:    Tools.PromisesHolder    = new Tools.PromisesHolder();
    private _parameters:        DescConnection.ConnectionParameters;
    private _middleware:        DescMiddleware.Middleware;
    private _subdomains:        SubdomainsController | null;

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
        this._getURL            = this._getURL.bind(this);
        this._setUrlFree        = this._setUrlFree.bind(this);
        // Subscribe to tasks
        this._onTask            = this._onTask.bind(this);
        this._onTaskDisconnect  = this._onTaskDisconnect.bind(this);
        this._onTaskError       = this._onTaskError.bind(this);
        this._tasks.subscribe(PendingTasks.EVENTS.onTask,       this._onTask);
        this._tasks.subscribe(PendingTasks.EVENTS.onDisconnect, this._onTaskDisconnect);
        this._tasks.subscribe(PendingTasks.EVENTS.onError,      this._onTaskError);
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
        return new Promise((resolve) => {
            this._drop().then(() => {
                this._clear().then(resolve);
            });
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
            // Register implementation of protocol
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

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Requests: Public
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    /**
     * Register as respondent: bind handler with protocol / demand (request)
     * @param protocol {Protocol} implementation of demand's protocol
     * @param demand {Demand | string} reference to demand class or signature of demand class
     * @param query {TQuery} query, which will used for calls to respondent
     * @param handler {Function} handler to process income request (demand)
     * @returns Promise
     */
    public subscribeToRequest(protocol: any, demand: Protocol.IClass | string, query: TQuery, handler: THandler): Promise<Protocol.Message.Respondent.Bind.Response> {
        return new Promise((resolve, reject) => {
            protocol = protocol as Protocol.IImplementation;
            if (this._state.get() !== EClientStates.connected) {
                return reject(new Error(this._logger.verbose(`Cannot do operation: client isn't connected.`)));
            }
            if (Tools.getTypeOf(handler) !== Tools.EPrimitiveTypes.function) {
                return reject(new Error(this._logger.verbose(`As handler can be used only function: Promise<results>.`)));
            }
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            const demandSignature = typeof demand === 'string' ? demand : this._getEntitySignature(demand);
            if (demandSignature instanceof Error) {
                return reject(demandSignature);
            }
            if (this._demands.has(protocolSignature, demandSignature)) {
                return reject(new Error(this._logger.verbose(`Protocol and demand "${protocolSignature}/${demandSignature}" is already bound with handler.`)));
            }
            if (typeof query !== 'object' || query === null) {
                return reject(new Error(this._logger.verbose(`As query can be used only object { [key: string]: string }.`)));
            }
            const queryArray: Protocol.KeyValue[] = [];
            let valid: boolean = true;
            Object.keys(query).forEach((key: string) => {
                if (typeof query[key] !== 'string') {
                    valid = false;
                }
                if (!valid) {
                    return;
                }
                queryArray.push(new Protocol.KeyValue({ key: key, value: query[key]}));
            });
            if (!valid) {
                return reject(new Error(this._logger.verbose(`As query can be used only object { [key: string]: string }. Some of values of target isn't a {string}.`)));
            }
            if (queryArray.length === 0) {
                return reject(new Error(this._logger.verbose(`Query can not be empty. Define at least one property.`)));
            }
            // Register protocol implementation
            this._protocols.add(protocol).then(() => {
                // Send request to server
                const url = this._getURL();
                this._requests.send(url, (new Protocol.Message.Respondent.Bind.Request({
                    clientId: this._clientGUID,
                    demand: demandSignature,
                    protocol: protocolSignature,
                    query: queryArray,
                    token: this._token.get(),
                })).stringify()).then((message: Protocol.TProtocolTypes) => {
                    this._setUrlFree(url);
                    if (message instanceof Protocol.ConnectionError) {
                        return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                    }
                    if (!(message instanceof Protocol.Message.Respondent.Bind.Response)) {
                        return reject(new Error(this._logger.verbose(`Unexpected server response (expected "Protocol.Message.Respondent.Bind.Response"): ${message.stringify()}`)));
                    }
                    if (!message.status) {
                        return reject(this._logger.env(`Binding client with "${protocolSignature}/${demandSignature}" wasn't done.`));
                    }
                    this._logger.env(`Registration of client has status: ${message.status}.`);
                    // Save handler
                    this._demands.add(protocolSignature, demandSignature, handler);
                    resolve(message);
                }).catch((error: Error) => {
                    this._setUrlFree(url);
                    this._logger.env(`Error binding of client to demand "${protocolSignature}/${demandSignature}": ${error.message}.`);
                    reject(error);
                });
            }).catch((protocolError: Error) => {
                this._logger.env(`Error subscribe demand (request): ${protocolError.message}`);
                reject(protocolError);
            });
        });
    }

    /**
     * Unregister as respondent: unbind handler with protocol / demand (request)
     * @param protocol {Protocol} implementation of demand's protocol
     * @param demand {Demand | string} reference to demand class or signature of demand class
     * @param query {TQuery} query, which will used for calls to respondent
     * @param handler {Function} handler to process income request (demand)
     * @returns Promise
     */
    public unsubscribeToRequest(protocol: any, demand: Protocol.IClass | string): Promise<Protocol.Message.Respondent.Unbind.Response | null> {
        return new Promise((resolve, reject) => {
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            const demandSignature = typeof demand === 'string' ? demand : this._getEntitySignature(demand);
            if (demandSignature instanceof Error) {
                return reject(demandSignature);
            }
            if (!this._demands.has(protocolSignature, demandSignature)) {
                return reject(new Error(`Protocol and demand "${protocolSignature}/${demandSignature}" is already unbound with handler.`));
            }
            // Remove handler before request to server
            this._demands.remove(protocolSignature, demandSignature);
            // Send request only if we are connected (if we are disconnected request is already unsubscribed by server)
            if (this._state.get() !== EClientStates.connected) {
                this._logger.verbose(`Client is disconnected no need to send unsubscribe request, because it's unsubscribed by server`);
                return resolve(null);
            }
            const url = this._getURL();
            this._requests.send(url, (new Protocol.Message.Respondent.Unbind.Request({
                clientId: this._clientGUID,
                demand: demandSignature,
                protocol: protocolSignature,
                token: this._token.get(),
            })).stringify()).then((message: Protocol.TProtocolTypes) => {
                this._setUrlFree(url);
                if (message instanceof Protocol.ConnectionError) {
                    return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                }
                if (!(message instanceof Protocol.Message.Respondent.Unbind.Response)) {
                    return reject(new Error(`Unexpected server response (expected "Protocol.Message.Respondent.Unbind.Response"): ${message.stringify()}`));
                }
                if (!message.status) {
                    return reject(this._logger.env(`Unbinding client with "${protocolSignature}/${demandSignature}" wasn't done.`));
                }
                this._logger.env(`Registration of client has status: ${message.status}.`);
                resolve(message);
            }).catch((error: Error) => {
                if (this._state.get() !== EClientStates.connected) {
                    this._logger.verbose(`Client is disconnected no need to send unsubscribe request, because it's unsubscribed by server`);
                    return resolve(null);
                }
                this._setUrlFree(url);
                this._logger.env(`Error unbinding of client to demand "${protocolSignature}/${demandSignature}": ${error.message}.`);
                reject(error);
            });
        });
    }

    public demand(
        protocol: any,
        demand: Protocol.IImplementation,
        expected: Protocol.IClass | string,
        query: TQuery,
        options: IDemandOptions = {},
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            protocol = protocol as Protocol.IImplementation;
            if (this._state.get() !== EClientStates.connected) {
                return reject(new Error(`Cannot do operation: client isn't connected.`));
            }
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            const demandSignature = this._getEntitySignature(demand);
            if (demandSignature instanceof Error) {
                return reject(demandSignature);
            }
            const expectedSignature = typeof expected === 'string' ? expected : this._getEntitySignature(expected);
            if (expectedSignature instanceof Error) {
                return reject(demandSignature);
            }
            options = typeof options === 'object' ? (options !== null ? options : {}) : {};
            if (typeof query !== 'object' || query === null) {
                return reject(new Error(this._logger.verbose(`As query can be used only object { [key: string]: string }.`)));
            }
            const queryArray: Protocol.KeyValue[] = [];
            let valid: boolean = true;
            Object.keys(query).forEach((key: string) => {
                if (typeof query[key] !== 'string') {
                    valid = false;
                }
                if (!valid) {
                    return;
                }
                queryArray.push(new Protocol.KeyValue({ key: key, value: query[key]}));
            });
            if (!valid) {
                return reject(new Error(this._logger.verbose(`As query can be used only object { [key: string]: string }. Some of values of target isn't a {string}.`)));
            }
            if (queryArray.length === 0) {
                return reject(new Error(this._logger.verbose(`Query can not be empty. Define at least one property.`)));
            }
            // Register protocol implementation
            this._protocols.add(protocol).then(() => {
                // Send demand's request to server
                const url = this._getURL();
                this._requests.send(url, (new Protocol.Message.Demand.FromExpectant.Request({
                    clientId: this._clientGUID,
                    demand: (new Protocol.DemandDefinition({
                        body: demand.stringify(),
                        demand: demandSignature,
                        expected: expectedSignature,
                        id: '',                                                                 // ID will be defined on server
                        pending: typeof options.pending === 'boolean' ? options.pending : false,
                        protocol: protocolSignature,
                    })),
                    options: new Protocol.Message.Demand.Options(options),
                    query: queryArray,
                    token: this._token.get(),
                })).stringify()).then((message: Protocol.TProtocolTypes) => {
                    this._setUrlFree(url);
                    if (message instanceof Protocol.ConnectionError) {
                        return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                    }
                    if (!(message instanceof Protocol.Message.Demand.FromExpectant.Response)) {
                        return reject(new Error(this._logger.verbose(`Unexpected server response (expected "Protocol.Message.Demand.FromExpectant.Response"): ${message.stringify()}`)));
                    }
                    if ([Protocol.Message.Demand.State.DEMAND_SENT, Protocol.Message.Demand.State.PENDING].indexOf(message.state) === -1) {
                        return reject(this._logger.env(`Fail to send demand's request "${protocolSignature}/${demandSignature}". Server answers: ${message.state}`));
                    }
                    this._logger.env(`Demand's request "${protocolSignature}/${demandSignature}" was sent. Server answers: ${message.state}`);
                    // Save resolver & rejector
                    this._pendingDemands.add(message.id, resolve, reject);
                }).catch((error: Error) => {
                    this._setUrlFree(url);
                    this._logger.env(`Error with sending demand's request "${protocolSignature}/${demandSignature}": ${error.message}.`);
                    reject(error);
                });
            }).catch((protocolError: Error) => {
                this._logger.env(`Error with sending demand's request "${protocolSignature}/${demandSignature}": ${protocolError.message}`);
                reject(protocolError);
            });
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
            this._clear().then(() => {
                setTimeout(() => {
                    this._connect().catch((error: Error) => {
                        this._logger.warn(`Error of hard reconnectionn on start due error: ${error.message}`);
                    });
                }, SETTINGS.RECONNECTION_TIMEOUT);
            });
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

    /**
     * Clear all data of client
     * @returns {Promise<void>}
     */
    private _clear(): Promise<void> {
        return new Promise((resolve) => {
            this._token.drop();
            this._subscriptions.clear();
            this._demands.clear();
            this._aliases = {};
            this._pendingDemands.clear();
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
        if (message.demand instanceof Protocol.DemandDefinition) {
            // Processing income demand
            const demand = message.demand as Protocol.DemandDefinition;
            this._proccessDemand(message.demand).then((results: string) => {
                // Send success message
                const url = this._getURL();
                this._requests.send(url, (new Protocol.Message.Demand.FromRespondent.Request({
                    clientId: this._clientGUID,
                    demand: new Protocol.DemandDefinition({
                        body: results,
                        demand: demand.demand,
                        expected: demand.expected,
                        id: demand.id,
                        protocol: demand.protocol,
                    }),
                    id: demand.id,
                    token: this._token.get(),
                })).stringify()).then((messageResResponse: Protocol.TProtocolTypes) => {
                    this._setUrlFree(url);
                    if (messageResResponse instanceof Protocol.ConnectionError) {
                        return this._logger.warn(`Connection error. Reason: ${messageResResponse.reason} (error: ${messageResResponse.message}). Initialize hard reconnection.`);
                    }
                    if (!(messageResResponse instanceof Protocol.Message.Demand.FromRespondent.Response)) {
                        return this._logger.warn(`Unexpected server response (expected "Protocol.Message.Demand.FromRespondent.Response"): ${messageResResponse.stringify()}`);
                    }
                    if (!messageResResponse.status) {
                        return this._logger.env(`Results for demand ${demand.protocol}/${demand.demand} isn't accepted`);
                    }
                    this._logger.env(`Results for demand ${demand.protocol}/${demand.demand} accepted`);
                }).catch((errorErrResponse: Error) => {
                    this._setUrlFree(url);
                    this._logger.env(`Fail to send results for demand ${demand.protocol}/${demand.demand} due error: ${errorErrResponse.message}`);
                });
            }).catch((error: Error) => {
                // Send error message
                const url = this._getURL();
                this._requests.send(url, (new Protocol.Message.Demand.FromRespondent.Request({
                    clientId: this._clientGUID,
                    error: error.message,
                    id: demand.id,
                    token: this._token.get(),
                })).stringify()).then((messageErrResponse: Protocol.TProtocolTypes) => {
                    this._setUrlFree(url);
                    if (messageErrResponse instanceof Protocol.ConnectionError) {
                        return this._logger.warn(`Connection error. Reason: ${messageErrResponse.reason} (error: ${messageErrResponse.message}). Initialize hard reconnection.`);
                    }
                    if (!(messageErrResponse instanceof Protocol.Message.Demand.FromRespondent.Response)) {
                        return this._logger.warn(`Unexpected server response (expected "Protocol.Message.Demand.FromRespondent.Response"): ${messageErrResponse.stringify()}`);
                    }
                    if (!messageErrResponse.status) {
                        return this._logger.env(`Results for demand ${demand.protocol}/${demand.demand} isn't accepted`);
                    }
                    this._logger.env(`Results for demand ${demand.protocol}/${demand.demand} accepted`);
                }).catch((errorErrResponse: Error) => {
                    this._setUrlFree(url);
                    this._logger.env(`Fail to send results for demand ${demand.protocol}/${demand.demand} due error: ${errorErrResponse.message}`);
                });
            });
        }
        if (message.return instanceof Protocol.DemandDefinition) {
            const demandReturn: Protocol.DemandDefinition = message.return;
            // Processing income demand's results
            if (typeof demandReturn.error === 'string' && demandReturn.error.trim() !== '') {
                // Error handled
                this._logger.env(`Demand ${demandReturn.protocol}/${demandReturn.demand} id=${demandReturn.id} is rejected due error: ${demandReturn.error}. `);
                return this._pendingDemands.reject(demandReturn.id, new Error(demandReturn.error));
            }
            // Get instance of protocol
            this._protocols.parse(demandReturn.protocol, demandReturn.body).then((returnImpl: Protocol.IImplementation) => {
                // Check correction of return
                if (returnImpl.getSignature() !== demandReturn.expected) {
                    return this._pendingDemands.reject(demandReturn.id, new Error(this._logger.env(`Signatures aren't match: expected demand's return "${demandReturn.expected}", but was gotten "${returnImpl.getSignature()}".`)));
                }
                // Return success
                this._logger.env(`Demand ${demandReturn.protocol}/${demandReturn.demand} id=${demandReturn.id} is resolved. `);
                this._pendingDemands.resolve(demandReturn.id, returnImpl);
            }).catch((errorGettingReturn: Error) => {
                this._pendingDemands.reject(demandReturn.id, new Error(this._logger.env(`Error during parsing demand's return: ${errorGettingReturn.message}.`)));
            });

        }
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
    private _emitIncomeEvent(eventDef: Protocol.EventDefinition) {
        this._protocols.parse(eventDef.protocol, eventDef.body)
            .then((eventImpl: any) => {
                this._subscriptions.emit(eventDef.protocol, eventImpl.getSignature(), eventImpl);
            })
            .catch((error: Error) => {
                this._logger.env(`Error during emit income event: ${error.message}.`);
            });
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Demands: private
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _proccessDemand(demand: Protocol.DemandDefinition): Promise<any> {
        return new Promise((resolve, reject) => {
            this._protocols.parse(demand.protocol, demand.body)
            .then((demandImpl: any) => {
                // Check signature
                if (demandImpl.getSignature() !== demand.demand) {
                    return reject(new Error(this._logger.env(`Implementation demand mismatch with demand name in request. Implemented: "${demandImpl.getSignature()}"; defined in request: ${demand.demand}.`)));
                }
                // Get handler
                const handler: THandler | Map<string, THandler> | undefined = this._demands.get(demand.protocol, demand.demand);
                if (handler === undefined || handler instanceof Map) {
                    return reject(new Error(this._logger.env(`Cannot find handler for processing demand ${demand.demand} on protocol ${demand.protocol}.`)));
                }
                // Try to get results
                const output: any = handler(demandImpl, (error: Error, results: any) => {
                    if (error instanceof Error) {
                        return reject(error);
                    }
                    if (typeof results !== 'object' || results === null) {
                        return reject(new Error(this._logger.env(`Expected results of demand will be an object.`)));
                    }
                    if (typeof results.getSignature !== 'function' || typeof results.stringify !== 'function') {
                        return reject(new Error(this._logger.env(`Expected results will be an instance of protocol implementation.`)));
                    }
                    if (results.getSignature() !== demand.expected) {
                        return reject(new Error(this._logger.env(`Expected results as implementation of ${demand.expected}, but gotten ${results.getSignature()}.`)));
                    }
                    resolve(results.stringify());
                });
            })
            .catch((error: Error) => {
                this._logger.env(`Error during processing demand: ${error.message}.`);
                reject(error);
            });
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
