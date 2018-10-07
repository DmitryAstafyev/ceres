import * as Tools from '../../platform/tools/index';
import * as DescConnection from './connection/index';
import * as DescMiddleware from '../../infrastructure/middleware/index';
import { Request } from './request';
import * as Protocol from '../../protocols/connection/protocol.connection';
import { ITransportInterface } from '../../platform/interfaces/interface.transport';
import { SubdomainsController } from '../common/subdomains';

const SETTINGS = {
    RECONNECTION_TIMEOUT: 3000 //ms
};

export enum EClientStates {
    created = 'created',
    connecting = 'connecting',
    reconnecting = 'reconnecting',
    connected = 'connected'
}

export enum EClientEvents {
    connected = 'connected',
    disconnected = 'disconnected',
    error = 'error',
    eventSent = 'eventSent',
    eventCome = 'eventCome',
    subscriptionDone = 'subscriptionDone',
    unsubscriptionDone = 'unsubscriptionDone',
    unsubscriptionAllDone = 'unsubscriptionAllDone',
    message = 'message'
}

class Token {

    private _token: string = '';

    /**
     * Set current token
     * @param token {string}
     * @returns {void}
     */
    public set(token: string) {
        this._token = token;
    }

    /**
     * Return current token
     * @returns {string}
     */
    public get(): string {
        return this._token;
    }

    /**
     * Drop current token
     * @returns {void}
     */
    public drop() {
        this.set('');
    }
}

class State {

    private _state: EClientStates = EClientStates.created;

    /**
     * Set current state
     * @param state {string}
     * @returns {void}
     */
    public set(state: EClientStates) {
        this._state = state;
    }

    /**
     * Return current state
     * @returns {EClientStates}
     */
    public get(): EClientStates {
        return this._state;
    }
}

/**
 * @class Hook
 * @desc Class hook never finishs. Hook request shows: is connection alive or not
 */
class Hook {

    private _request: Request | null = null;

    /**
     * Create hook request. This request never finish.
     * @returns {Promise<Error>}
     */
    public create(url: string, clientGUID: string, token: Token): Promise<Protocol.ConnectionError | Protocol.Disconnect>{
        return new Promise((resolve, reject) => {
            if (this._request !== null) {
                return reject(new Error(`Attempt to create hook, even hook is already created.`));
            }
            const instance = new Protocol.Message.Hook.Request({
                clientId: clientGUID,
                token: token.get()
            });
            this._request = new Request(url, instance.stringify());
            const requestId = this._request.getId();
            this._request.send()
                .then((response: string) => {
                    const message = Protocol.parse(response);
                    this._request = null;
                    if (message instanceof Error) {
                        return reject(message);
                    }
                    if (!(message instanceof Protocol.ConnectionError) && !(message instanceof Protocol.Disconnect)) {
                        return reject(new Error(`Unexpected response: ${message.constructor.name}: ${Tools.inspect(message)}`));
                    }
                    resolve(message);
                })
                .catch((error: Error) => {
                    this._request = null;
                    reject(new Error(`Hook request guid "${requestId}" finished within error: ${error.message}`));
                });
        });
    }

    /**
     * Close hook connection.
     * @returns {void}
     */
    public drop(){
        if (this._request === null) {
            return;
        }
        this._request.close();
    }

}

/**
 * @class Pending
 * @desc Connection which pending command from server
 */
class Pending {

    private _request: Request | null = null;
    private _guid: string = Tools.guid();
    private _url: string = '';

    /**
     * Create pending connection
     * @returns {Promise<Protocol.Message.Pending.Response>}
     */
    public create(url: string, clientGUID: string, token: Token): Promise<Protocol.Message.Pending.Response | Protocol.Disconnect>{
        this._url = url;
        return new Promise((resolve, reject) => {
            if (this._request !== null) {
                return reject(new Error(`Attempt to create pending connection, even is already created.`));
            }
            const instance = new Protocol.Message.Pending.Request({
                clientId: clientGUID,
                token: token.get()
            });
            this._request = new Request(url, instance.stringify());
            const requestId = this._request.getId();
            this._request.send()
                .then((response: string) => {
                    this._request = null;
                    const message = Protocol.Message.Pending.Response.parse(response);
                    if (message instanceof Error) {
                        return reject(message);
                    }
                    if (!(message instanceof Protocol.Message.Pending.Response) && !(message instanceof Protocol.Disconnect)) {
                        return reject(new Error(`Unexpected response: ${message.constructor.name}: ${Tools.inspect(message)}`));
                    }
                    resolve(message);
                })
                .catch((error: Error) => {
                    this._request = null;
                    reject(new Error(`Pending request guid "${requestId}" finished within error: ${error.message}`));
                });
        });
    }

    /**
     * Close pending connection.
     * @returns {void}
     */
    public drop(){
        if (this._request === null) {
            return;
        }
        this._request.close();
    }

    /**
     * Returns GUID of request
     * @returns {string}
     */
    public getGUID(): string{
        return this._guid;
    }

    /**
     * Returns URL of request
     * @returns {string}
     */
    public getURL(): string{
        return this._url;
    }

}

class PendingTasks extends Tools.EventEmitter {
    
    static EVENTS = {
        onTask: Symbol(),
        onDisconnect: Symbol(),
        onError: Symbol()
    };

    private _pending: Map<string, Pending> = new Map();
    private _urlGet: Function | undefined;
    private _urlFree: Function | undefined;
    private _clientGUID: string | undefined;
    private _token: Token | undefined;

    constructor() {
        super();
    }

    private _add(){
        if (this._urlGet === undefined || this._urlFree === undefined || this._clientGUID === undefined || this._token === undefined) {
            return;
        }
        const pending = new Pending();
        const guid = pending.getGUID();
        const url = this._urlGet();
        pending.create(url, this._clientGUID, this._token)
            .then((response: Protocol.Message.Pending.Response | Protocol.Disconnect) => {
                (this._urlFree as Function)(url);
                if (response instanceof Protocol.Disconnect) {
                    return this.emit(PendingTasks.EVENTS.onDisconnect, response);
                }
                //Remove current
                this._pending.delete(guid);
                //Add new pending imedeately, while current in process
                this._add();
                //Trigger event
                this.emit(PendingTasks.EVENTS.onTask, response);
            })
            .catch((error: Error) => {
                (this._urlFree as Function)(url);
                return this.emit(PendingTasks.EVENTS.onError, error);
            });
        this._pending.set(guid, pending);
    }

    public start(urlGet: () => string, urlFree: (url: string) => void, clientGUID: string, token: Token): Error | void {
        if (this._pending.size > 0) {
            return new Error(`Pending connections are already exist. Count: ${this._pending.size}`);
        }
        this._urlGet = urlGet;
        this._urlFree = urlFree;
        this._clientGUID = clientGUID;
        this._token = token;
        this._add();
    }

    public stop(){
        this._pending.forEach((pending: Pending) => {
            (this._urlFree as Function)(pending.getURL());
            pending.drop();
        });
        this._pending.clear();
    }

}

class Requests {

    private _requests: Map<string, Request> = new Map();

    public send(url: string, body: string): Promise<Protocol.TProtocolTypes>{
        return new Promise((resolve, reject) => {
            const request = new Request(url, body);
            this._requests.set(request.getId(), request);
            request.send()
                .then((response: string) => {
                    this._requests.delete(request.getId());
                    const message = Protocol.parse(response);
                    if (message instanceof Error) {
                        return reject(message);
                    }
                    resolve(message);
                })
                .catch((error: Error) => {
                    this._requests.delete(request.getId());
                    reject(error);
                });
        });
    }

    public drop(){
        this._requests.forEach((request: Request) => {
            request.close();
        });
        this._requests.clear();
    }

}

export class Client extends Tools.EventEmitter implements ITransportInterface {
    
    static STATES = EClientStates;
    static EVENTS = EClientEvents;

    private _logger         : Tools.Logger          = new Tools.Logger('Http.Client');
    private _token          : Token                 = new Token();
    private _state          : State                 = new State();
    private _hook           : Hook                  = new Hook();
    private _tasks          : PendingTasks          = new PendingTasks();
    private _requests       : Requests              = new Requests();
    private _subscriptions  : Tools.HandlersHolder  = new Tools.HandlersHolder();
    private _clientGUID     : string                = Tools.guid();
    private _protocols      : Tools.ProtocolsHolder = new Tools.ProtocolsHolder();
    private _parameters     : DescConnection.ConnectionParameters;
    private _middleware     : DescMiddleware.Middleware;
    private _subdomains     : SubdomainsController | null;

    constructor(
        parameters: DescConnection.ConnectionParameters,
        middleware?: DescMiddleware.Middleware
    ){
        super();
        if (!(parameters instanceof DescConnection.ConnectionParameters)) {
            if (parameters !== undefined){
                throw new Error(this._logger.warn(`Get wrong parameters of connection. Expected <ConnectionParameters>. Gotten: `, parameters));
            }
            parameters = new DescConnection.ConnectionParameters({});
        }
        if (middleware !== undefined){
            if (!(middleware instanceof DescMiddleware.Middleware)) {
                throw new Error(this._logger.warn(`Get wrong parameters of connection. Expected <Middleware>. Gotten: `, middleware));
            }   
        } else {
            middleware = new DescMiddleware.Middleware({});
        }

        this._parameters = parameters;
        this._middleware = middleware;
        //Check subdomain settings
        const mask = SubdomainsController.getMask(this._parameters.getURL());
        if (mask instanceof Error){
            throw new Error(this._logger.warn(mask.message));
        }
        if (mask !== null) {
            this._subdomains = new SubdomainsController(
                this._parameters.getURL(), 
                mask, 
                this._parameters.broadcast
            );
        } else {
            this._subdomains = null;
        }
        //Bind shared methods
        this._getURL = this._getURL.bind(this);
        this._setUrlFree = this._setUrlFree.bind(this);
        //Subscribe to tasks
        this._onTask = this._onTask.bind(this);
        this._onTaskDisconnect = this._onTaskDisconnect.bind(this);
        this._onTaskError = this._onTaskError.bind(this);
        this._tasks.subscribe(PendingTasks.EVENTS.onTask, this._onTask);
        this._tasks.subscribe(PendingTasks.EVENTS.onDisconnect, this._onTaskDisconnect);
        this._tasks.subscribe(PendingTasks.EVENTS.onError, this._onTaskError);
        //Connect
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

    private _setUrlFree(url: string){
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
                clientId: this._clientGUID
            })).stringify());
            request.send()
                .then((response: string) => {
                    this._setUrlFree(url);
                    this._logger.env(`Request guid: ${request.getId()} is finished successfuly: ${Tools.inspect(response)}`);
                    this._onResponseHandshake(response).then((message: Protocol.Message.Handshake.Response) => {
                        //Set token
                        this._token.set(message.token as string);
                        //Initialize connection
                        this._initialize();
                        //Resolve
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
                token: this._token.get()
            })).stringify());
            request.send()
                .then((response: string) => {
                    this._setUrlFree(url);
                    this._logger.env(`Request guid: ${request.getId()} is finished successfuly: ${Tools.inspect(response)}`);
                    this._onResponseReconnection(response).then((message: Protocol.Message.Reconnection.Response) => {
                        //Initialize connection
                        this._initialize();
                        //Resolve
                        resolve();
                    }).catch((error: Error) =>{
                        reject(this._errorOnConnection(`Fail to proccess reconnection response`, error));
                    });
                })
                .catch((error: Error) => {
                    this._setUrlFree(url);
                    reject(this._errorOnConnection(`Fail to reconnect`, error));
                });
        });
    }

    private _errorOnConnection(message: string, error: Error){
        this.emit(EClientEvents.error, {
            message: this._logger.warn(`Attempt to reconnect to "${this._parameters.getURL()}" was failed (next attempt to connectin in ${SETTINGS.RECONNECTION_TIMEOUT}ms) due error: ${message}`),
            error: error,
            reason: undefined,
            details: undefined
        });
        this._hardReconnection();
        return error;
    }

    /**
     * Made attempt to reconnect softly (without authorization) in defined timeout
     * @returns {void}
     */
    private _softReconnection(){
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
    private _hardReconnection(){
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
                    message: this._logger.warn(`Cannot parse response due error: ${message.message}`),
                    reason: undefined,
                    details: undefined
                });
                return reject(message);
            }
            return resolve(message);
        });
    }

    /**
     * Handle handshake response
     * @param response {string}
     * @returns {void}
     */
    _onResponseHandshake(response: string): Promise<Protocol.Message.Handshake.Response> {
        return new Promise((resolve, reject) => {
            this._getProtocolMessage(response).then((message: Protocol.TProtocolTypes) => {
                if (!(message instanceof Protocol.Message.Handshake.Response)) {
                    const error: Error = new Error(this._logger.warn(`On this state (${this._state.get()}) expected authorization confirmation, but gotten: ${Tools.inspect(message)}.`));
                    this.emit(EClientEvents.error, {
                        message: error.message,
                        reason: undefined,
                        details: undefined
                    });
                    return reject(error);
                }
                if (typeof message.token !== 'string' || message.token.trim() === '') {
                    const error: Error = new Error(this._logger.warn(`Fail to authorize request due reason: ${message.reason} ${message.error !== void 0 ? `(${message.error})`: ''}`));
                    this.emit(EClientEvents.error, {
                        message: error.message,
                        reason: message.reason,
                        details: undefined
                    });
                    return reject(error);
                };
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
    _onResponseReconnection(response: string): Promise<Protocol.Message.Reconnection.Response> {
        return new Promise((resolve, reject) => {
            this._getProtocolMessage(response).then((message: Protocol.TProtocolTypes) => {
                if (message instanceof Protocol.ConnectionError) {
                    const error: Error = new Error(this._logger.warn(`Fail to reconnect request due reason: ${message.reason} ${message.message !== void 0 ? `(${message.message})`: ''}`));
                    this.emit(EClientEvents.error, {
                        message: error.message,
                        reason: message.reason,
                        details: undefined
                    });
                    return reject(error);
                }
                if (!(message instanceof Protocol.Message.Reconnection.Response)) {
                    const error: Error = new Error(this._logger.warn(`On this state (${this._state.get()}) expected authorization confirmation, but gotten: ${Tools.inspect(message)}.`));
                    this.emit(EClientEvents.error, {
                        message: error.message,
                        reason: undefined,
                        details: undefined
                    });
                    return reject(error);
                }
                if (!message.allowed) {
                    const error: Error = new Error(this._logger.env(`Reconnection isn't allowed.`));
                    this.emit(EClientEvents.error, {
                        message: error.message,
                        reason: undefined,
                        details: undefined
                    });
                    return reject(error);
                }
                resolve(message);
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    private _initialize(){
        //Set state
        this._state.set(EClientStates.connected);
        //Create hook
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
                if (error instanceof Error){
                    this._logger.warn(`Hook connection is finished with  error: ${error.message}. Initialize soft reconnection.`);
                    this._softReconnection();
                } else {
                    this._logger.warn(`Server returns unexpected response: ${error.stringify()}. Initialize hard reconnection.`);
                    this._hardReconnection();
                }
            });
        //Create pending
        this._tasks.start(this._getURL, this._setUrlFree, this._clientGUID, this._token);
        //Trigger connection event
        this.emit(EClientEvents.connected);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Tasks 
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _onTask(message: Protocol.Message.Pending.Response){
        if (message.event instanceof Protocol.EventDefinition) {
            //Processing income event
            return this._emitIncomeEvent(message.event);
        }
        //Here processing of request results also
    }

    private _onTaskDisconnect(message: Protocol.Disconnect) {

    }

    private _onTaskError(error: Error) {
        this._logger.warn(`Pending task is finished with error: ${error.message}. Initialize reconnection.`);
        //Note: We should not reconnect here, because hooks care about it
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Events: private
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _emitIncomeEvent(message: Protocol.EventDefinition){
        this._protocols.parse(message.protocol, message.body)
            .then((event: any) => {
                this._subscriptions.emit(message.protocol, event.getSignature(), event);
            })
            .catch((error: Error) => {
                this._logger.env(`Error during emit income event: ${error.message}.`);
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
    public eventEmit(event: any, protocol: any): Promise<Protocol.Message.Event.Response> {
        return new Promise((resolve, reject) => {
            if (this._state.get() !== EClientStates.connected) {
                return reject(new Error(`Cannot do operation: client isn't connected.`));
            }
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error){
                return reject(protocolSignature);
            }
            const eventSignature = this._getEntitySignature(event);
            if (eventSignature instanceof Error){
                return reject(eventSignature);
            }
            const url = this._getURL();
            this._requests.send(url, (new Protocol.Message.Event.Request({
                clientId: this._clientGUID,
                event: new Protocol.EventDefinition({
                    protocol: protocolSignature,
                    body: event.stringify(),
                    event: eventSignature
                }),
                token: this._token.get()
            })).stringify())
                .then((message: Protocol.TProtocolTypes) => {
                    this._setUrlFree(url);
                    if (message instanceof Protocol.ConnectionError) {
                        return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                    }
                    if (!(message instanceof Protocol.Message.Event.Response)){
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
    public subscribeEvent(event: any, protocol: any, handler: Function): Promise<Protocol.Message.Subscribe.Response> {
        //TODO: subscription is already exist. Server doesn't allow subscribe twice. If user need it, he can do it by himself, but server should have only one subscription
        //TODO: restore subscription after reconnection. Server unsubscribe all if client was disconnected
        return new Promise((resolve, reject) => {
            if (this._state.get() !== EClientStates.connected) {
                return reject(new Error(`Cannot do operation: client isn't connected.`));
            }
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error){
                return reject(protocolSignature);
            }
            const eventSignature = this._getEntitySignature(event);
            if (eventSignature instanceof Error){
                return reject(eventSignature);
            }
            this._protocols.add(protocol)
                .then(() => {
                    const subscription = this._subscriptions.subscribe(protocolSignature, eventSignature, handler);
                    if (subscription instanceof Error){
                        return reject(subscription);
                    }
                    const url = this._getURL();
                    this._requests.send(url, (new Protocol.Message.Subscribe.Request({
                        subscription: new Protocol.Subscription({
                            protocol: protocolSignature,
                            event: eventSignature
                        }),
                        clientId: this._clientGUID,
                        token: this._token.get()
                    })).stringify()).then((message: Protocol.TProtocolTypes) => {
                        this._setUrlFree(url);
                        if (message instanceof Protocol.ConnectionError) {
                            return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                        }
                        if (!(message instanceof Protocol.Message.Subscribe.Response)) {
                            this._subscriptions.unsubscribe(protocolSignature, eventSignature);
                            return reject(new Error(`Unexpected server response (expected "EventResponse"): ${message.stringify()}`));
                        }
                        if (!message.status){
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
                .catch((error: Error)=>{
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
            if (protocolSignature instanceof Error){
                return reject(protocolSignature);
            }
            const eventSignature = this._getEntitySignature(event);
            if (eventSignature instanceof Error){
                return reject(eventSignature);
            }
            const url = this._getURL();
            this._requests.send(url, (new Protocol.Message.Unsubscribe.Request({
                clientId: this._clientGUID,
                subscription: new Protocol.Subscription({
                    protocol: protocolSignature,
                    event: eventSignature
                }),
                token: this._token.get()
            })).stringify()).then((message: Protocol.TProtocolTypes) => {
                this._setUrlFree(url);
                if (message instanceof Protocol.ConnectionError) {
                    return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                }
                if (!(message instanceof Protocol.Message.Unsubscribe.Response)) {
                    return reject(new Error(`Unexpected server response (expected "Protocol.Message.Unsubscribe.Response"): ${message.stringify()}`));
                }
                if (!message.status){
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
            if (protocolSignature instanceof Error){
                return reject(protocolSignature);
            }
            const url = this._getURL();
            this._requests.send(url, (new Protocol.Message.UnsubscribeAll.Request({
                clientId: this._clientGUID,
                subscription: new Protocol.Subscription({
                    protocol: protocolSignature
                }),
                token: this._token.get()
            })).stringify()).then((message: Protocol.TProtocolTypes) => {
                this._setUrlFree(url);
                if (message instanceof Protocol.ConnectionError) {
                    return reject(new Error(this._logger.warn(`Connection error. Reason: ${message.reason} (error: ${message.message}). Initialize hard reconnection.`)));
                }
                if (!(message instanceof Protocol.Message.UnsubscribeAll.Response)) {
                    return reject(new Error(`Unexpected server response (expected "Protocol.Message.UnsubscribeAll.Response"): ${message.stringify()}`));
                }
                if (!message.status){
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

    public request(request: any, protocol: any) {
        return new Promise((resolve, reject) => {
            const signature = this._getEntitySignature(protocol);
            if (signature instanceof Error){
                return reject(signature);
            }
            //implementation
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
        if (typeof entity.getSignature !== 'function' || typeof entity.getSignature() !== 'string' || entity.getSignature().trim() === ''){
            return new Error('No sigature of protocol found');
        }
        return entity.getSignature();
    }

}