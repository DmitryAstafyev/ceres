import * as Tools from '../../platform/tools/index';
import * as DescConnection from './connection/index';
import * as DescMiddleware from '../../infrastructure/middleware/index';
import { Request, IRequestError } from './request';
import * as Protocol from '../../protocols/connection/protocol.connection';
import { ITransportInterface } from '../../platform/interfaces/interface.transport';

const SETTINGS = {
    RECONNECTION_TIMEOUT: 3000 //ms
};

export enum EClientStates {
    created = 'created',
    connecting = 'connecting',
    reconnectioning = 'reconnectioning',
    connected = 'connected'
}

export enum EClientEvents {
    connected = 'connected',
    disconnected = 'disconnected',
    error = 'error',
    heartbeat = 'heartbeat',
    eventSent = 'eventSent',
    eventCome = 'eventCome',
    subscriptionDone = 'subscriptionDone',
    unsubscriptionDone = 'unsubscriptionDone',
    unsubscriptionAllDone = 'unsubscriptionAllDone',
    requestSent = 'requestSent',
    requestDone = 'requestDone',    
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
                    if (message instanceof Array) {
                        return reject(new Error(`Cannot parse response due errors:\n ${message.map((error: Error) => { return error.message; }).join('\n')}`));
                    }
                    if (!(message instanceof Protocol.ConnectionError) && !(message instanceof Protocol.Disconnect)) {
                        return reject(new Error(`Unexpected response: ${message.constructor.name}: ${Tools.inspect(message)}`));
                    }
                    resolve(message);
                })
                .catch((error: Tools.ExtError<IRequestError>) => {
                    this._request = null;
                    reject(new Error(`Hook request guid "${requestId}" finished within error: ${error.error.message}`));
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

    /**
     * Create pending connection
     * @returns {Promise<Protocol.Message.Pending.Response>}
     */
    public create(url: string, clientGUID: string, token: Token): Promise<Protocol.Message.Pending.Response | Protocol.Disconnect>{
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
                    if (message instanceof Array) {
                        return reject(new Error(`Cannot parse response due errors:\n ${message.map((error: Error) => { return error.message; }).join('\n')}`));
                    }
                    if (!(message instanceof Protocol.Message.Pending.Response) && !(message instanceof Protocol.Disconnect)) {
                        return reject(new Error(`Unexpected response: ${message.constructor.name}: ${Tools.inspect(message)}`));
                    }
                    resolve(message);
                })
                .catch((error: Tools.ExtError<IRequestError>) => {
                    this._request = null;
                    reject(new Error(`Hook request guid "${requestId}" finished within error: ${error.error.message}`));
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

}

class PendingTasks extends Tools.EventEmitter {
    
    static EVENTS = {
        onTask: Symbol(),
        onDisconnect: Symbol(),
        onError: Symbol()
    };

    private _pending: Map<string, Pending> = new Map();
    private _url: string | undefined;
    private _clientGUID: string | undefined;
    private _token: Token | undefined;

    constructor() {
        super();
    }

    private _add(){
        if (this._url === undefined || this._clientGUID === undefined || this._token === undefined) {
            return;
        }
        const pending = new Pending();
        const guid = pending.getGUID();
        pending.create(this._url, this._clientGUID, this._token)
            .then((response: Protocol.Message.Pending.Response | Protocol.Disconnect) => {
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
                return this.emit(PendingTasks.EVENTS.onError, error);
            });
        this._pending.set(guid, pending);
    }

    public start(url: string, clientGUID: string, token: Token): Error | void {
        if (this._pending.size > 0) {
            return new Error(`Pending connections are already exist. Count: ${this._pending.size}`);
        }
        this._url = url;
        this._clientGUID = clientGUID;
        this._token = token;
        this._add();
    }

    public stop(){
        this._pending.forEach((pending: Pending) => {
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
                    if (message instanceof Array) {
                        return reject(new Error(`Cannot parse response due errors:\n ${message.map((error: Error) => { return error.message; }).join('\n')}`));
                    }
                    resolve(message);
                })
                .catch((error: Tools.ExtError<IRequestError>) => {
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

    private _clientGUID : string                = Tools.guid();
    private _protocols  : Tools.ProtocolsHolder = new Tools.ProtocolsHolder();
    private _parameters : DescConnection.ConnectionParameters;
    private _middleware : DescMiddleware.Middleware;

    constructor(
        parameters: DescConnection.ConnectionParameters,
        middleware?: DescMiddleware.Middleware
    ){
        super();
        if (!(parameters instanceof DescConnection.ConnectionParameters)) {
            if (parameters !== undefined){
                this._logger.warn(`Get wrong parameters of connection. Expected <ConnectionParameters>. Gotten: `, parameters);
            }
            parameters = new DescConnection.ConnectionParameters({});
        }

        if (!(middleware instanceof DescMiddleware.Middleware)) {
            if (middleware !== undefined){
                this._logger.warn(`Get wrong parameters of connection. Expected <Middleware>. Gotten: `, middleware);
            }
            middleware = new DescMiddleware.Middleware({});
        }

        this._parameters = parameters;
        this._middleware = middleware;
        //Subscribe to tasks
        this._onTask = this._onTask.bind(this);
        this._onTaskError = this._onTaskError.bind(this);
        this._tasks.subscribe(PendingTasks.EVENTS.onTask, this._onTask);
        this._tasks.subscribe(PendingTasks.EVENTS.onError, this._onTaskError);
        //Connect
        this._connect();
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
	 * Connection / reconnection 
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    /**
     * Made attempt to connect to server
     * @returns {void}
     */
    private _connect() {
        if (this._state.get() !== EClientStates.created && this._state.get() !== EClientStates.reconnectioning) {
            throw new Error(this._logger.error(`Attempt to connect on state "${this._state.get()}".`));
        }
        this._state.set(EClientStates.connecting);
        const request = new Request(this._parameters.getURL(), (new Protocol.RequestHandshake({
            clientId: this._clientGUID
        })).getStr());
        request.send()
            .then((response: string) => {
                this._logger.env(`Request guid: ${request.getId()} is finished successfuly: ${Tools.inspect(response)}`);
                this._onResponseHandshake(response);
            })
            .catch((error: Tools.ExtError<IRequestError>) => {
                this._logger.warn(`Attempt to connect to "${this._parameters.getURL()}" was failed (next attempt to connectin in ${SETTINGS.RECONNECTION_TIMEOUT}ms) due error: `, error);
                this._hardReconnection();
            });
    }

    /**
     * Made attempt to reconnect to server
     * @returns {void}
     */
    private _reconnect() {
        if (this._state.get() !== EClientStates.created && this._state.get() !== EClientStates.reconnectioning) {
            throw new Error(this._logger.error(`Attempt to reconnect on state "${this._state.get()}".`));
        }
        this._state.set(EClientStates.connecting);
        const request = new Request(this._parameters.getURL(), (new Protocol.RequestReconnection({
            clientId: this._clientGUID
        })).setToken(this._token.get()).getStr());
        request.send()
            .then((response: string) => {
                this._logger.env(`Request guid: ${request.getId()} is finished successfuly: ${Tools.inspect(response)}`);
                this._onResponseReconnection(response);
            })
            .catch((error: Tools.ExtError<IRequestError>) => {
                this._logger.warn(`Attempt to connect to "${this._parameters.getURL()}" was failed (next attempt to connectin in ${SETTINGS.RECONNECTION_TIMEOUT}ms) due error: `, error);
                this._hardReconnection();
            });
    }

    /**
     * Made attempt to reconnect softly (without authorization) in defined timeout
     * @returns {void}
     */
    private _softReconnection(){
        this._state.set(EClientStates.reconnectioning);
        if (this._token.get() === '') {
            this._logger.warn(`Cannot do soft reconnection, because token isn't set. Will do hard reconnection.`);
            return this._hardReconnection();
        }
        this._drop().then(() => {
            setTimeout(() => {
                this._reconnect();
            }, SETTINGS.RECONNECTION_TIMEOUT);
        });
    }

    /**
     * Made attempt to reconnect hardly (with authorization) in defined timeout
     * @returns {void}
     */
    private _hardReconnection(){
        this._state.set(EClientStates.reconnectioning);
        this._drop().then(() => {
            this._token.drop();
            setTimeout(() => {
                this._connect();
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
    private _getProtocolMessage(response: string): Protocol.TProtocolClasses | Error {
        const message = Protocol.extract(response);
        if (message instanceof Error) {
            this.emit(EClientEvents.error, {
                message: this._logger.warn(`Cannot parse response due error: ${message.message}`),
                reason: undefined,
                details: undefined
            });
        }
        return message;
    }

    /**
     * Handle handshake response
     * @param response {string}
     * @returns {void}
     */
    _onResponseHandshake(response: string){
        const message = this._getProtocolMessage(response) as Protocol.ResponseHandshake;
        if (message instanceof Error || !(message instanceof Protocol.ResponseHandshake)) {
            return this.emit(EClientEvents.error, {
                message: this._logger.warn(`On this state (${this._state.get()}) expected authorization confirmation, but gotten: ${Tools.inspect(message)}.`),
                reason: undefined,
                details: undefined
            });   
        }
        if (!message.allowed && message.getToken() === '') {
            return this.emit(EClientEvents.error, {
                message: this._logger.warn(`Fail to authorize request due reason: ${message.reason} ${message.error !== void 0 ? `(${message.error})`: ''}`),
                reason: message.reason,
                details: undefined
            });
        };
        //Set token
        this._token.set(message.getToken());
        //Initialize connection
        this._initialize();
    }

    /**
     * Handle reconnection response
     * @param response {string}
     * @returns {void}
     */
    _onResponseReconnection(response: string){
        const message = this._getProtocolMessage(response) as Protocol.ResponseReconnection;
        if (message instanceof Error) {
            this._hardReconnection();
            return this.emit(EClientEvents.error, {
                message: this._logger.warn(`On this state (${this._state.get()}) expected reconnection confirmation, but request failed due error: ${message.message}.`),
                reason: undefined,
                details: undefined
            });   
        }
        if (message instanceof Protocol.ResponseError) {
            this._hardReconnection();
            return this.emit(EClientEvents.error, {
                message: this._logger.warn(`Fail to reconnect request due reason: ${message.reason} ${message.error !== void 0 ? `(${message.error})`: ''}`),
                reason: message.reason,
                details: undefined
            });
        };
        //Note: If server doesn't returns Protocol.ResponseError, it means - reconnection allowed. Doesn't need addition check response
        //Initialize connection
        this._initialize();
    }

    private _initialize(){
        //Set state
        this._state.set(EClientStates.connected);
        //Create hook
        this._hook.create(this._parameters.getURL(), this._clientGUID, this._token)
            .then((message: Protocol.ResponseError) => {
                this._logger.warn(`Hook connection is finished with reason: ${message.reason} (error: ${message.error}). Initialize hard reconnection.`);
                this._hardReconnection();
            })
            .catch((error: Tools.ExtError<IRequestError> | Protocol.TProtocolClasses) => {
                if (error instanceof Tools.ExtError){
                    this._logger.warn(`Hook connection is finished with  error: ${error.error.message}. Initialize soft reconnection.`);
                    this._softReconnection();
                } else {
                    this._logger.warn(`Server returns unexpected response: ${error.getStr()}. Initialize hard reconnection.`);
                    this._hardReconnection();
                }
            });
        //Create pending
        this._tasks.start(this._parameters.getURL(), this._clientGUID, this._token);
        //Trigger connection event
        this.emit(EClientEvents.connected);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Tasks 
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _onTask(message: Protocol.TProtocolClasses){
        if (message instanceof Protocol.IncomeEvent) {
            this._emitIncomeEvent(message);
        } else if (message instanceof Protocol.RequestResultResponse) {
            this.emit(EClientEvents.requestDone);
            this._logger.debug(`Request result: ${message.body}.`);
        }
    }

    private _onTaskError(error: Error) {
        this._logger.warn(`Pending task is finished with error: ${error.message}. Initialize reconnection.`);
        //Note: We should not reconnect here, because hooks care about it
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Events: private
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _emitIncomeEvent(message: Protocol.IncomeEvent){
        this._protocols.getImplementationFromStr(message.protocol, message.body)
            .then((event) => {
                this._subscriptions.emit(message.protocol, message.signature, event);
            })
            .catch((error: Error) => {
                this._logger.env(`Error during emit income event.`, error);
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
    public eventEmit(event: any, protocol: any): Promise<Protocol.EventResponse> {
        return new Promise((resolve, reject) => {
            const signature = Protocol.extractSignature(protocol);
            if (signature instanceof Error){
                return reject(signature);
            }
            const eventSignature = Protocol.extractSignature(event);
            if (eventSignature instanceof Error){
                return reject(eventSignature);
            }
            if (Tools.getTypeOf(event) === Tools.EPrimitiveTypes.undefined || event === null || Tools.getTypeOf(event.getStr) !== Tools.EPrimitiveTypes.function){
                return reject(new Error(`Invalid instance of event. Please be sure you are using valid protocol.`));
            }
            const instance = new Protocol.EventRequest({
                protocol: signature,
                body: event.getStr(),
                clientId: this._clientGUID,
                signature: eventSignature
            });
            instance.setToken(this._token.get());
            this._requests.send(this._parameters.getURL(), instance.getStr())
                .then((message: Protocol.TProtocolClasses) => {
                    if (!(message instanceof Protocol.EventResponse)){
                        return reject(new Error(`Unexpected server response (expected "EventResponse"): ${message.getStr()}`));
                    }
                    this._logger.env(`For event found ${message.subscribers} subscribers.`);
                    this.emit(EClientEvents.eventSent, message);
                    resolve(message);
                })
                .catch((error: Tools.ExtError<IRequestError>) => {
                    this._logger.env(`Error emit event.`, error);
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
    public subscribeEvent(event: any, protocol: any, handler: Function): Promise<Protocol.SubscribeResponse> {
        //TODO: subscription is already exist. Server doesn't allow subscribe twice. If user need it, he can do it by himself, but server should have only one subscription
        //TODO: restore subscription after reconnection. Server unsubscribe all if client was disconnected
        return new Promise((resolve, reject) => {
            const protocolSignature = Protocol.extractSignature(protocol);
            if (protocolSignature instanceof Error){
                return reject(protocolSignature);
            }
            const eventSignature = Protocol.extractSignature(event);
            if (eventSignature instanceof Error){
                return reject(eventSignature);
            }
            this._protocols.add(protocol)
                .then(() => {
                    const subscription = this._subscriptions.subscribe(protocolSignature, eventSignature, handler);
                    if (subscription instanceof Error){
                        return reject(subscription);
                    }
                    const instance = new Protocol.SubscribeRequest({
                        protocol: protocolSignature,
                        signature: eventSignature,
                        clientId: this._clientGUID
                    });
                    instance.setToken(this._token.get());
                    this._requests.send(this._parameters.getURL(), instance.getStr())
                        .then((message: Protocol.TProtocolClasses) => {
                            if (!(message instanceof Protocol.SubscribeResponse)) {
                                this._subscriptions.unsubscribe(protocolSignature, eventSignature);
                                return reject(new Error(`Unexpected server response (expected "EventResponse"): ${message.getStr()}`));
                            }
                            this._logger.env(`Subscription to protocol ${message.protocol}, event ${message.signature} has status: ${message.status}.`);
                            this.emit(EClientEvents.subscriptionDone, message);
                            resolve(message);
                        })
                        .catch((error: Tools.ExtError<IRequestError>) => {
                            this._logger.env(`Error subscribe event.`, error);
                            this._subscriptions.unsubscribe(protocolSignature, eventSignature);
                            reject(error);
                        });
                })
                .catch((error: Error)=>{
                    this._logger.env(`Error subscribe event.`, error);
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
    public unsubscribeEvent(event: any, protocol: any): Promise<Protocol.UnsubscribeResponse> {
        return new Promise((resolve, reject) => {
            const protocolSignature = Protocol.extractSignature(protocol);
            if (protocolSignature instanceof Error){
                return reject(protocolSignature);
            }
            const eventSignature = Protocol.extractSignature(event);
            if (eventSignature instanceof Error){
                return reject(eventSignature);
            }
            const instance = new Protocol.UnsubscribeRequest({
                protocol: protocolSignature,
                signature: eventSignature,
                clientId: this._clientGUID
            });
            instance.setToken(this._token.get());
            this._requests.send(this._parameters.getURL(), instance.getStr())
                .then((message: Protocol.TProtocolClasses) => {
                    if (!(message instanceof Protocol.UnsubscribeResponse)) {
                        return reject(new Error(`Unexpected server response (expected "UnsubscribeResponse"): ${message.getStr()}`));
                    }
                    this._logger.env(`Unsubscription from protocol ${message.protocol}, event ${message.signature} has status: ${message.status}.`);
                    this._subscriptions.unsubscribe(protocolSignature, eventSignature);
                    resolve(message);
                })
                .catch((error: Tools.ExtError<IRequestError>) => {
                    this._logger.env(`Error unsubscribe event.`, error);
                    reject(error);
                });
        });
    }

    /** 
     * Unsubscribe all handlers from all events in scope of protocol
     * @param protocol {Protocol} implementation of event's protocol
     * @returns Promise
     */
    public unsubscribeAllEvents(protocol: any): Promise<Protocol.UnsubscribeAllResponse> {
        return new Promise((resolve, reject) => {
            const protocolSignature = Protocol.extractSignature(protocol);
            if (protocolSignature instanceof Error){
                return reject(protocolSignature);
            }
            const instance = new Protocol.UnsubscribeAllRequest({
                protocol: protocolSignature,
                clientId: this._clientGUID
            });
            instance.setToken(this._token.get());
            this._requests.send(this._parameters.getURL(), instance.getStr())
                .then((message: Protocol.TProtocolClasses) => {
                    if (!(message instanceof Protocol.UnsubscribeAllResponse)) {
                        return reject(new Error(`Unexpected server response (expected "UnsubscribeAllResponse"): ${message.getStr()}`));
                    }
                    this._logger.env(`Unsubscription from all events in scope of protocol ${message.protocol}  has status: ${message.status}.`);
                    this._subscriptions.unsubscribe(protocolSignature);
                    resolve(message);
                })
                .catch((error: Tools.ExtError<IRequestError>) => {
                    this._logger.env(`Error unsubscribe all.`, error);
                    reject(error);
                });
        });
    }



    public request(request: any, protocol?: any) {
        return new Promise((resolve, reject) => {
            const signature = Protocol.extractSignature(protocol);
            if (signature instanceof Error){
                return reject(signature);
            }
            if (Tools.getTypeOf(request) === Tools.EPrimitiveTypes.undefined || request === null || Tools.getTypeOf(request.getStr) !== Tools.EPrimitiveTypes.function){
                return reject(new Error(`Invalid instance of request. Please be sure you are using valid protocol.`));
            }
            const instance = new Protocol.RequestRequest({
                protocol: signature,
                body: request.getStr(),
                clientId: this._clientGUID
            });
            //implementation
        });
    }

}