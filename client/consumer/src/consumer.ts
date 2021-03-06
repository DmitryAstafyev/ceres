import * as Tools from './platform/tools/index';
import * as Protocol from './protocols/connection/protocol.connection';
import ATransport from './transports/transport.abstract';

export { State } from './transports/common/transport.state';
export { Token } from './transports/common/transport.token';
export { ATransport, Tools, Protocol };

export type TClientAlias = { [key: string]: string };

const SETTINGS = {
    RECONNECTION_TIMEOUT: 3000, // ms
};

export type TQuery = { [key: string]: string};
export type THandler = (...args: any[]) => any;

export interface IDemandOptions {
    pending?: boolean;
    scope?: Protocol.Message.Demand.Options.Scope;
}

export default class Consumer {

    public static Events = {
        connected: 'connected',
        demandSent: 'demandSent',
        disconnected: 'disconnected',
        error: 'error',
        eventCome: 'eventCome',
        eventSent: 'eventSent',
        message: 'message',
        referenceAccepted: 'referenceAccepted',
        subscriptionDone: 'subscriptionDone',
        subscriptionToRequestDone: 'subscriptionToRequestDone',
        unsubscriptionAllDone: 'unsubscriptionAllDone',
        unsubscriptionDone: 'unsubscriptionDone',
        unsubscriptionToRequestDone: 'unsubscriptionToRequestDone',
    };

    public static DemandOptions = {
        scope: Protocol.Message.Demand.Options.Scope,
    };

    private _logger:            Tools.Logger            = new Tools.Logger('Consumer');
    private _subscriptions:     Tools.EmittersHolder    = new Tools.EmittersHolder();
    private _protocols:         Tools.ProtocolsHolder   = new Tools.ProtocolsHolder();
    private _aliases:           TClientAlias            = {};
    private _demands:           Tools.HandlersHolder    = new Tools.HandlersHolder();
    private _pendingDemands:    Tools.PromisesHolder    = new Tools.PromisesHolder();
    private _transport:         ATransport<any, any>;
    private _destroyed:         boolean                 = false;
    private _emitter:           Tools.EventEmitter      = new Tools.EventEmitter();

    constructor(transport: ATransport<any, any>) {
        this._transport = transport;
        // Subscribe
        this._onError = this._onError.bind(this);
        this._onMessage = this._onMessage.bind(this);
        this._onConnected = this._onConnected.bind(this);
        this._onDisconnected = this._onDisconnected.bind(this);
        // Connect
        this._connect();
    }

    /**
     * Destroy client
     * @returns {Promise<void>}
     */
    public destroy(): Promise<void> {
        this._destroyed = true;
        return new Promise((resolve) => {
            this._emitter.unsubscribeAll();
            this._drop().then(() => {
                this._clear().then(resolve);
            });
        });
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Consumer events
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    /**
     * Subscribe to consumer event
     * @param event {any} event from Consumer.Events
     * @param handler {Function} handler of event
     * @returns {boolean}
     */
    public on(event: any, handler: (...args: any[]) => any): boolean {
        return this._emitter.subscribe(event, handler);
    }

    /**
     * Unsubscribe from consumer event
     * @param event {any} event from Consumer.Events
     * @param handler {Function} handler of event
     * @returns {boolean}
     */
    public removeListener(event: any, handler: (...args: any[]) => any): boolean {
        return this._emitter.unsubscribe(event, handler);
    }

    /**
     * Remove all handlers for Consumer.Events event
     * @param event {any} event from Consumer.Events
     * @returns {void}
     */
    public removeAllListeners(event?: any): void {
        return this._emitter.unsubscribeAll(event);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Protocol events
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    /**
     * Emit event
     * @param event {any} implementation of event
     * @returns Promise
     */
    public emit(event: any, aliases: TClientAlias = {}): Promise<Protocol.Message.Event.Response> {
        return new Promise((resolve, reject) => {
            if (this._transport.getState() !== ATransport.STATES.connected) {
                return reject(new Error(`Cannot do operation: client isn't connected.`));
            }
            const eventSignature = this._getEntitySignature(event);
            if (eventSignature instanceof Error) {
                return reject(eventSignature);
            }
            const protocolSignature = this._getEntitySignature(event.getProtocol());
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
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
            const eventBody: string | Uint8Array = event.stringify();
            const eventInst: Protocol.EventDefinition = new Protocol.EventDefinition({
                bodyBinary: eventBody instanceof Uint8Array ? Array.from(eventBody) : [],
                bodyStr: typeof eventBody === 'string' ? eventBody : '',
                event: eventSignature,
                protocol: protocolSignature,
            });
            const paketInst = new Protocol.Message.Event.Request({
                aliases: _aliases,
                clientId: this._transport.getClientId(),
                event: eventInst,
                guid: Tools.guid(),
                token: this._transport.getClientToken(),
            });
            this._transport.send(paketInst.stringify()).then((message: any) => {
                if (Protocol.ConnectionError.instanceOf(message)) {
                    return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                }
                if (!Protocol.Message.Event.Response.instanceOf(message)) {
                    return reject(new Error(`Unexpected server response (expected "Protocol.Message.Event.Response"): ${message.stringify()}`));
                }
                this._logger.env(`For event found ${message.subscribers} subscribers.`);
                this._emitter.emit(Consumer.Events.eventSent, message);
                resolve(message);
            }).catch((error: Error) => {
                this._logger.env(`Error emit event: ${error.message}.`);
                reject(error);
            });
        });
    }

    /**
     * Subscribe handler to event
     * @param event {any} implementation of event
     * @param handler {Function} handler
     * @returns Promise
     */
    public subscribe(event: any, handler: (...args: any[]) => any): Promise<Protocol.Message.Subscribe.Response> {
        // TODO: subscription is already exist. Server doesn't allow subscribe twice. If user need it, he can do it by himself, but server should have only one subscription
        // TODO: restore subscription after reconnection. Server unsubscribe all if client was disconnected
        return new Promise((resolve, reject) => {
            if (this._transport.getState() !== ATransport.STATES.connected) {
                return reject(new Error(`Cannot do operation: client isn't connected.`));
            }
            const eventSignature = this._getEntitySignature(event);
            if (eventSignature instanceof Error) {
                return reject(eventSignature);
            }
            const protocol = event.getProtocol();
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }            // Register implementation of protocol
            this._protocols.add(protocol)
                .then(() => {
                    const subscription = this._subscriptions.subscribe(protocolSignature, eventSignature, handler);
                    if (subscription instanceof Error) {
                        return reject(subscription);
                    }
                    this._transport.send((new Protocol.Message.Subscribe.Request({
                        clientId: this._transport.getClientId(),
                        guid: Tools.guid(),
                        subscription: new Protocol.Subscription({
                            event: eventSignature,
                            protocol: protocolSignature,
                        }),
                        token: this._transport.getClientToken(),
                    })).stringify()).then((message: any) => {
                        if (Protocol.ConnectionError.instanceOf(message)) {
                            return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                        }
                        if (!(Protocol.Message.Subscribe.Response.instanceOf(message))) {
                            this._subscriptions.unsubscribe(protocolSignature, eventSignature);
                            return reject(new Error(`Unexpected server response (expected "EventResponse"): ${message.stringify()}`));
                        }
                        if (!message.status) {
                            this._subscriptions.unsubscribe(protocolSignature, eventSignature);
                            return reject(this._logger.env(`Subscription to protocol ${protocolSignature}, event ${eventSignature} wasn't done.`));
                        }
                        this._logger.env(`Subscription from protocol ${protocolSignature}, event ${eventSignature} has status: ${message.status}.`);
                        this._emitter.emit(Consumer.Events.subscriptionDone, message);
                        resolve(message);
                    }).catch((error: Error) => {
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
     * @returns Promise
     */
    public unsubscribe(event: any): Promise<Protocol.Message.Unsubscribe.Response> {
        return new Promise((resolve, reject) => {
            if (this._transport.getState() !== ATransport.STATES.connected) {
                return reject(new Error(`Cannot do operation: client isn't connected.`));
            }
            const eventSignature = this._getEntitySignature(event);
            if (eventSignature instanceof Error) {
                return reject(eventSignature);
            }
            const protocolSignature = this._getEntitySignature(event.getProtocol());
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            this._transport.send((new Protocol.Message.Unsubscribe.Request({
                clientId: this._transport.getClientId(),
                guid: Tools.guid(),
                subscription: new Protocol.Subscription({
                    event: eventSignature,
                    protocol: protocolSignature,
                }),
                token: this._transport.getClientToken(),
            })).stringify()).then((message: any) => {
                if (Protocol.ConnectionError.instanceOf(message)) {
                    return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                }
                if (!(Protocol.Message.Unsubscribe.Response.instanceOf(message))) {
                    return reject(new Error(`Unexpected server response (expected "Protocol.Message.Unsubscribe.Response"): ${message.stringify()}`));
                }
                if (!message.status) {
                    return reject(this._logger.env(`Unsubscription from protocol ${protocolSignature}, event ${eventSignature} wasn't done.`));
                }
                this._logger.env(`Unsubscription from protocol ${protocolSignature}, event ${eventSignature} has status: ${message.status}.`);
                this._subscriptions.unsubscribe(protocolSignature, eventSignature);
                this._emitter.emit(Consumer.Events.unsubscriptionDone, message);
                resolve(message);
            }).catch((error: Error) => {
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
    public unsubscribeAll(protocol: any): Promise<Protocol.Message.UnsubscribeAll.Response> {
        return new Promise((resolve, reject) => {
            if (this._transport.getState() !== ATransport.STATES.connected) {
                return reject(new Error(`Cannot do operation: client isn't connected.`));
            }
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            this._transport.send((new Protocol.Message.UnsubscribeAll.Request({
                clientId: this._transport.getClientId(),
                guid: Tools.guid(),
                subscription: new Protocol.Subscription({
                    protocol: protocolSignature,
                }),
                token: this._transport.getClientToken(),
            })).stringify()).then((message: any) => {
                if (Protocol.ConnectionError.instanceOf(message)) {
                    return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                }
                if (!(Protocol.Message.UnsubscribeAll.Response.instanceOf(message))) {
                    return reject(new Error(`Unexpected server response (expected "Protocol.Message.UnsubscribeAll.Response"): ${message.stringify()}`));
                }
                if (!message.status) {
                    return reject(this._logger.env(`Unsubscription from all events of protocol ${protocolSignature} wasn't done.`));
                }
                this._logger.env(`Unsubscription from all events in scope of protocol ${protocolSignature} has status: ${message.status}.`);
                this._subscriptions.unsubscribe(protocolSignature);
                this._emitter.emit(Consumer.Events.unsubscriptionAllDone, message);
                resolve(message);
            }).catch((error: Error) => {
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
            if (this._transport.getState() !== ATransport.STATES.connected) {
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
            this._transport.send((new Protocol.Message.Registration.Request({
                aliases: _aliases,
                clientId: this._transport.getClientId(),
                guid: Tools.guid(),
                token: this._transport.getClientToken(),
            })).stringify()).then((message: any) => {
                if (Protocol.ConnectionError.instanceOf(message)) {
                    return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                }
                if (!(Protocol.Message.Registration.Response.instanceOf(message))) {
                    return reject(new Error(`Unexpected server response (expected "Protocol.Message.Registration.Response"): ${message.stringify()}`));
                }
                if (!message.status) {
                    return reject(this._logger.env(`Registration of client wasn't done.`));
                }
                this._logger.env(`Registration of client has status: ${message.status}.`);
                this._aliases = Object.assign({}, aliases);
                this._emitter.emit(Consumer.Events.referenceAccepted, aliases);
                resolve(message);
            }).catch((error: Error) => {
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
     * @param demand {any} reference to demand class
     * @param query {TQuery} query, which will used for calls to respondent
     * @param handler {Function} handler to process income request (demand)
     * @returns Promise
     */
    public listenRequest(demand: any, handler: THandler, query: TQuery): Promise<Protocol.Message.Respondent.Bind.Response> {
        return new Promise((resolve, reject) => {
            if (this._transport.getState() !== ATransport.STATES.connected) {
                return reject(new Error(this._logger.verbose(`Cannot do operation: client isn't connected.`)));
            }
            if (Tools.getTypeOf(handler) !== Tools.EPrimitiveTypes.function) {
                return reject(new Error(this._logger.verbose(`As handler can be used only function: Promise<results>.`)));
            }
            const demandSignature = this._getEntitySignature(demand);
            if (demandSignature instanceof Error) {
                return reject(demandSignature);
            }
            const protocol = demand.getProtocol();
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
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
            /*
            if (queryArray.length === 0) {
                return reject(new Error(this._logger.verbose(`Query can not be empty. Define at least one property.`)));
            }
            */
            // Register protocol implementation
            this._protocols.add(protocol).then(() => {
                // Send request to server
                this._transport.send((new Protocol.Message.Respondent.Bind.Request({
                    clientId: this._transport.getClientId(),
                    demand: demandSignature,
                    guid: Tools.guid(),
                    protocol: protocolSignature,
                    query: queryArray,
                    token: this._transport.getClientToken(),
                })).stringify()).then((message: any) => {
                    if (Protocol.ConnectionError.instanceOf(message)) {
                        return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                    }
                    if (!(Protocol.Message.Respondent.Bind.Response.instanceOf(message))) {
                        return reject(new Error(this._logger.verbose(`Unexpected server response (expected "Protocol.Message.Respondent.Bind.Response"): ${message.stringify()}`)));
                    }
                    if (!message.status) {
                        return reject(this._logger.env(`Binding client with "${protocolSignature}/${demandSignature}" wasn't done.`));
                    }
                    this._logger.env(`Registration of client has status: ${message.status}.`);
                    // Save handler
                    this._demands.add(protocolSignature, demandSignature, handler);
                    this._emitter.emit(Consumer.Events.subscriptionToRequestDone, message);
                    resolve(message);
                }).catch((error: Error) => {
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
     * @param demand {any} reference to demand class
     * @returns Promise
     */
    public removeRequestListener(demand: any): Promise<Protocol.Message.Respondent.Unbind.Response | null> {
        return new Promise((resolve, reject) => {
            const demandSignature = this._getEntitySignature(demand);
            if (demandSignature instanceof Error) {
                return reject(demandSignature);
            }
            const protocolSignature = this._getEntitySignature(demand.getProtocol());
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            if (!this._demands.has(protocolSignature, demandSignature)) {
                return reject(new Error(`Protocol and demand "${protocolSignature}/${demandSignature}" is already unbound with handler.`));
            }
            // Remove handler before request to server
            this._demands.remove(protocolSignature, demandSignature);
            // Send request only if we are connected (if we are disconnected request is already unsubscribed by server)
            if (this._transport.getState() !== ATransport.STATES.connected) {
                this._logger.verbose(`Client is disconnected no need to send unsubscribe request, because it's unsubscribed by server`);
                return resolve(null);
            }
            this._transport.send((new Protocol.Message.Respondent.Unbind.Request({
                clientId: this._transport.getClientId(),
                demand: demandSignature,
                guid: Tools.guid(),
                protocol: protocolSignature,
                token: this._transport.getClientToken(),
            })).stringify()).then((message: any) => {
                if (Protocol.ConnectionError.instanceOf(message)) {
                    return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                }
                if (!(Protocol.Message.Respondent.Unbind.Response.instanceOf(message))) {
                    return reject(new Error(`Unexpected server response (expected "Protocol.Message.Respondent.Unbind.Response"): ${message.stringify()}`));
                }
                if (!message.status) {
                    return reject(this._logger.env(`Unbinding client with "${protocolSignature}/${demandSignature}" wasn't done.`));
                }
                this._logger.env(`Registration of client has status: ${message.status}.`);
                this._emitter.emit(Consumer.Events.unsubscriptionToRequestDone, message);
                resolve(message);
            }).catch((error: Error) => {
                if (this._transport.getState() !== ATransport.STATES.connected) {
                    this._logger.verbose(`Client is disconnected no need to send unsubscribe request, because it's unsubscribed by server`);
                    return resolve(null);
                }
                this._logger.env(`Error unbinding of client to demand "${protocolSignature}/${demandSignature}": ${error.message}.`);
                reject(error);
            });
        });
    }

    /**
     * Sends request
     * @param demand {any} instance of demand class
     * @param expected {any} ref to class of expected response
     * @param query {TQuery} query, which will used for calls to respondent
     * @param options {IDemandOptions} options for request
     * @returns Promise
     */
    public request(
        demand: any,
        expected: any,
        query: TQuery = {},
        options: IDemandOptions = {},
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this._transport.getState() !== ATransport.STATES.connected) {
                return reject(new Error(`Cannot do operation: client isn't connected.`));
            }
            const demandSignature = this._getEntitySignature(demand);
            if (demandSignature instanceof Error) {
                return reject(demandSignature);
            }
            const protocol = demand.getProtocol();
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            const expectedSignature = this._getEntitySignature(expected);
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
            /*
            if (queryArray.length === 0) {
                return reject(new Error(this._logger.verbose(`Query can not be empty. Define at least one property.`)));
            }
            */
            // Register protocol implementation
            const demandBody: string | Uint8Array | Error = demand.stringify();
            if (demandBody instanceof Error) {
                return reject(demandBody);
            }
            this._protocols.add(protocol).then(() => {
                const guid = Tools.guid();
                // Send demand's request to server
                this._transport.send((new Protocol.Message.Demand.FromExpectant.Request({
                    clientId: this._transport.getClientId(),
                    demand: (new Protocol.DemandDefinition({
                        bodyBinary: demandBody instanceof Uint8Array ? Array.from(demandBody) : [],
                        bodyStr: typeof demandBody === 'string' ? demandBody : '',
                        demand: demandSignature,
                        expected: expectedSignature,
                        id: '', // ID will be defined by provider
                        pending: typeof options.pending === 'boolean' ? options.pending : false,
                        protocol: protocolSignature,
                    })),
                    guid: guid,
                    options: new Protocol.Message.Demand.Options(options),
                    query: queryArray,
                    token: this._transport.getClientToken(),
                })).stringify()).then((message: any) => {
                    if (Protocol.ConnectionError.instanceOf(message)) {
                        return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                    }
                    if (!(Protocol.Message.Demand.FromExpectant.Response.instanceOf(message))) {
                        return reject(new Error(this._logger.verbose(`Unexpected server response (expected "Protocol.Message.Demand.FromExpectant.Response"): ${message.stringify()}`)));
                    }
                    if ([Protocol.Message.Demand.State.DEMAND_SENT, Protocol.Message.Demand.State.PENDING].indexOf(message.state) === -1) {
                        return reject(this._logger.env(`Fail to send demand's request "${protocolSignature}/${demandSignature}". Server answers: ${message.state}`));
                    }
                    this._logger.env(`Demand's request "${protocolSignature}/${demandSignature}" was sent. Server answers: ${message.state}`);
                    // Save resolver & rejector
                    this._pendingDemands.add(message.id, resolve, reject);
                    this._emitter.emit(Consumer.Events.demandSent, message);
                }).catch((error: Error) => {
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
	 * Connection / reconnection
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    /**
     * Made attempt to connect to server
     * @returns {void}
     */
    private _connect(): void {
        if (this._destroyed) {
            return;
        }
        this._transport.subscribe(ATransport.EVENTS.error, this._onError);
        this._transport.subscribe(ATransport.EVENTS.message, this._onMessage);
        this._transport.subscribe(ATransport.EVENTS.connected, this._onConnected);
        this._transport.subscribe(ATransport.EVENTS.disconnected, this._onDisconnected);
        this._transport.connect().catch((error: Error) => {
            this._logger.warn(`Error of connection on start due error: ${error.message}`);
            this._emitter.emit(Consumer.Events.error, error);
            this._reconnect();
        });
    }

    private _reconnect(): void {
        if (this._destroyed) {
            return;
        }
        this._drop().then(() => {
            this._clear().then(() => {
                setTimeout(() => {
                    this._connect();
                }, SETTINGS.RECONNECTION_TIMEOUT);
            });
        });
    }

    @Tools.EventHandler() private _onConnected() {
        this._emitter.emit(Consumer.Events.connected);
    }

    @Tools.EventHandler() private _onDisconnected(error: Error) {
        this._emitter.emit(Consumer.Events.disconnected, error);
        this._reconnect();
    }

    @Tools.EventHandler() private _onError(error: Error) {
        this._emitter.emit(Consumer.Events.error, error);
        this._reconnect();
    }

    /**
     * Drop all services and requests
     * @returns {Promise<void>}
     */
    private _drop(): Promise<void> {
        return new Promise((resolve) => {
            this._transport.unsubscribeAll();
            this._transport.disconnect();
            resolve();
        });
    }

    /**
     * Clear all data of client
     * @returns {Promise<void>}
     */
    private _clear(): Promise<void> {
        return new Promise((resolve) => {
            this._subscriptions.clear();
            this._demands.clear();
            this._aliases = {};
            this._pendingDemands.clear();
            resolve();
        });
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Income messages
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    @Tools.EventHandler() private _onMessage(message: Protocol.Message.ToConsumer) {
        if (Protocol.EventDefinition.instanceOf(message.event)) {
            // Processing income event
            return this._emitIncomeEvent(message.event as Protocol.EventDefinition);
        }
        if (Protocol.DemandDefinition.instanceOf(message.demand)) {
            // Processing income demand
            const demand = message.demand as Protocol.DemandDefinition;
            this._proccessDemand(message.demand as Protocol.DemandDefinition).then((results: string | Uint8Array) => {
                // Send success message
                this._transport.send((new Protocol.Message.Demand.FromRespondent.Request({
                    clientId: this._transport.getClientId(),
                    demand: new Protocol.DemandDefinition({
                        bodyBinary: results instanceof Uint8Array ? Array.from(results) : [],
                        bodyStr: typeof results === 'string' ? results : '',
                        demand: demand.demand,
                        expected: demand.expected,
                        id: demand.id,
                        protocol: demand.protocol,
                    }),
                    guid: Tools.guid(),
                    id: demand.id,
                    token: this._transport.getClientToken(),
                })).stringify()).then((messageResResponse: any) => {
                    if (Protocol.ConnectionError.instanceOf(messageResResponse)) {
                        return this._logger.warn(`Connection error. Reason: ${messageResResponse.reason} (error: ${messageResResponse.message}). Initialize hard reconnection.`);
                    }
                    if (!(Protocol.Message.Demand.FromRespondent.Response.instanceOf(messageResResponse))) {
                        return this._logger.warn(`Unexpected server response (expected "Protocol.Message.Demand.FromRespondent.Response"): ${messageResResponse.stringify()}`);
                    }
                    if (!messageResResponse.status) {
                        return this._logger.env(`Results for demand ${demand.protocol}/${demand.demand} isn't accepted`);
                    }
                    this._logger.env(`Results for demand ${demand.protocol}/${demand.demand} accepted`);
                }).catch((errorErrResponse: Error) => {
                    this._logger.env(`Fail to send results for demand ${demand.protocol}/${demand.demand} due error: ${errorErrResponse.message}`);
                });
            }).catch((error: Error) => {
                // Send error message
                this._transport.send((new Protocol.Message.Demand.FromRespondent.Request({
                    clientId: this._transport.getClientId(),
                    error: error.message,
                    guid: Tools.guid(),
                    id: demand.id,
                    token: this._transport.getClientToken(),
                })).stringify()).then((messageErrResponse: any) => {
                    if (Protocol.ConnectionError.instanceOf(messageErrResponse)) {
                        return this._logger.warn(`Connection error. Reason: ${messageErrResponse.reason} (error: ${messageErrResponse.message}). Initialize hard reconnection.`);
                    }
                    if (!(Protocol.Message.Demand.FromRespondent.Response.instanceOf(messageErrResponse))) {
                        return this._logger.warn(`Unexpected server response (expected "Protocol.Message.Demand.FromRespondent.Response"): ${messageErrResponse.stringify()}`);
                    }
                    if (!messageErrResponse.status) {
                        return this._logger.env(`Results for demand ${demand.protocol}/${demand.demand} isn't accepted`);
                    }
                    this._logger.env(`Results for demand ${demand.protocol}/${demand.demand} accepted`);
                }).catch((errorErrResponse: Error) => {
                    this._logger.env(`Fail to send results for demand ${demand.protocol}/${demand.demand} due error: ${errorErrResponse.message}`);
                });
            });
        }
        if (Protocol.DemandDefinition.instanceOf(message.return)) {
            const demandReturn: Protocol.DemandDefinition = message.return as Protocol.DemandDefinition;
            // Processing income demand's results
            if (typeof demandReturn.error === 'string' && demandReturn.error.trim() !== '') {
                // Error handled
                this._logger.env(`Demand ${demandReturn.protocol}/${demandReturn.demand} id=${demandReturn.id} is rejected due error: ${demandReturn.error}. `);
                return this._pendingDemands.reject(demandReturn.id, new Error(demandReturn.error));
            }
            // Get instance of protocol
            this._protocols.parse(
                demandReturn.protocol,
                demandReturn.bodyStr === '' ? (new Uint8Array(demandReturn.bodyBinary)) : demandReturn.bodyStr,
            ).then((returnImpl: Protocol.IImplementation) => {
                // Check correction of return
                if (returnImpl.getSignature() !== demandReturn.expected) {
                    return this._pendingDemands.reject(demandReturn.id, new Error(this._logger.env(`Signatures aren't match: expected demand's return "${demandReturn.expected}", but was gotten "${returnImpl.getSignature()}".`)));
                }
                if (!this._pendingDemands.has(demandReturn.id)) {
                    this._logger.warn(`Demand ${demandReturn.protocol}/${demandReturn.demand} id=${demandReturn.id} doesn't have resolver yet. It will be resolved after resolver will be added.`);
                } else {
                    this._logger.env(`Demand ${demandReturn.protocol}/${demandReturn.demand} id=${demandReturn.id} is resolved. `);
                }
                // Return success
                this._pendingDemands.resolve(demandReturn.id, returnImpl);
            }).catch((errorGettingReturn: Error) => {
                this._pendingDemands.reject(demandReturn.id, new Error(this._logger.env(`Error during parsing demand's return: ${errorGettingReturn.message}.`)));
            });
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Events: private
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _emitIncomeEvent(eventDef: Protocol.EventDefinition) {
        this._protocols.parse(
            eventDef.protocol,
            eventDef.bodyStr === '' ? new Uint8Array(eventDef.bodyBinary) : eventDef.bodyStr,
        ).then((eventImpl: any) => {
            this._subscriptions.emit(eventDef.protocol, eventImpl.getSignature(), eventImpl);
        }).catch((error: Error) => {
            this._logger.env(`Error during emit income event: ${error.message}.`);
        });
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Demands: private
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _proccessDemand(demand: Protocol.DemandDefinition): Promise<any> {
        return new Promise((resolve, reject) => {
            this._protocols.parse(
                demand.protocol,
                demand.bodyStr === '' ? (new Uint8Array(demand.bodyBinary)) : demand.bodyStr,
            ).then((demandImpl: any) => {
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
            }).catch((error: Error) => {
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
