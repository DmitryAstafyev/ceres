import * as Tools from '../../platform/tools/index';
import * as Enums from '../../platform/enums/index';
import * as DescConnection from './connection/index';
import * as DescMiddleware from '../../infrastructure/middleware/index';
import { Request } from './request';
import * as Protocol from '../../protocols/connection/protocol.connection';
import { ITransportInterface } from '../../platform/interfaces/interface.transport';

enum ERepeatTimeout {
    error = 1000,
    expired = 5000,
    done = 0
};

enum ERepeatReason {
    error = 'error',
    expired = 'expired',
    done = 'done'
};

export enum EClientStates {
    created = 'created',
    listening = 'listening'
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

export class Client extends Tools.EventEmitter implements ITransportInterface {
    
    static STATES = EClientStates;
    static EVENTS = EClientEvents;
    private _logger     : Tools.Logger          = new Tools.Logger('Http.Client');
    private _requests   : Map<string, Request>  = new Map();
    private _state      : EClientStates         = EClientStates.created;
    private _clientGUID : string                = Tools.guid();
    private _token      : string                = '';
    private _holder     : Tools.HandlersHolder  = new Tools.HandlersHolder();
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
        this._proceed();
    }

    /**
     * Destroy client
     * @returns {Promise<void>}
     */
    public destroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._requests.forEach((request: Request) => {
                request.close();
            });
            resolve();
        });
    }

    private _proceed(){
        let request;
        switch(this._getState()){
            case EClientStates.created:
                request = new Request(this._clientGUID, this._parameters.getURL(), Enums.ERequestTypes.post, new Protocol.RequestHandshake({
                    clientId: this._clientGUID
                }));
                this._registerRequest(request);
                request.send();
                break;
            case EClientStates.listening:
                const requestHeartbeat = new Protocol.RequestHeartbeat({
                    clientId: this._clientGUID,
                });
                requestHeartbeat.setToken(this._getToken());
                request = new Request(this._clientGUID, this._parameters.getURL(), Enums.ERequestTypes.post, requestHeartbeat);
                this._registerRequest(request);
                request.send();
                break;
        }
    }

    private _subscribeRequest(request: Request, resolve?: Function, reject?: Function){
        request.subscribe(Request.EVENTS.expired,  this._onExpiredRequest.bind(this, resolve, reject, request));
        request.subscribe(Request.EVENTS.error,    this._onErrorRequest.bind(this, resolve, reject, request));
        request.subscribe(Request.EVENTS.done,     this._onDoneRequest.bind(this, resolve, reject, request));
    }

    private _unsubscribeRequest(request: Request){
        request.unsubscribeAll(Request.EVENTS.expired);
        request.unsubscribeAll(Request.EVENTS.error);
        request.unsubscribeAll(Request.EVENTS.done);
    }

    private _registerRequest(request: Request, resolve?: Function, reject?: Function){
        this._subscribeRequest(request, resolve, reject);
        this._requests.set(request.getId(), request);
    }

    private _unregisterRequest(request: Request){
        this._unsubscribeRequest(request);
        this._requests.delete(request.getId());
    }

    private _onExpiredRequest(resolve: Function, reject: Function, request: Request, error: Error){
        this._logger.dev(`Request guid: ${request.getId()} is expired due error: ${Tools.inspect(error)}`);
        this._reset();
        this._unregisterRequest(request);
        if (Tools.getTypeOf(reject) !== Tools.EPrimitiveTypes.function) {
            this._repeat(ERepeatReason.expired);
        } else {
            reject(error);
        }
    }

    private _onErrorRequest(resolve: Function, reject: Function, request: Request, error: Error){
        this.emit(EClientEvents.error, {
            message: this._logger.dev(`Request guid: ${request.getId()} is finished with error.`),
            reason: undefined,
            details: error.message
        });
        this._reset();
        this._unsubscribeRequest(request);
        if (Tools.getTypeOf(reject) !== Tools.EPrimitiveTypes.function) {
            this._repeat(ERepeatReason.error);
        } else {
            reject(error);
        }
    }

    private _onDoneRequest(resolve: Function, reject: Function, request: Request, response: any){
        resolve = Tools.getTypeOf(resolve) === Tools.EPrimitiveTypes.function ? resolve : () => {};
        reject = Tools.getTypeOf(reject) === Tools.EPrimitiveTypes.function ? reject : () => {};
        this._logger.dev(`Request guid: ${request.getId()} is finished successfuly: ${Tools.inspect(response)}`);
        this._unsubscribeRequest(request);
        const message = Protocol.extract(response);
        if (message instanceof Error) {
            this.emit(EClientEvents.error, {
                message: this._logger.warn(`Cannot parse response due error: ${message.message}`),
                reason: undefined,
                details: undefined
            });
            if (Tools.getTypeOf(reject) === Tools.EPrimitiveTypes.function) {
                reject(message);
            }
            return this._repeat(ERepeatReason.done);
        }
        switch(this._getState()){
            case EClientStates.created:
                if (message instanceof Protocol.ResponseHandshake) {
                    if (message.allowed && message.getToken() !== ''){
                        this._setToken(message.getToken());
                        this._setState(EClientStates.listening);
                        this.emit(EClientEvents.connected);
                        resolve();
                    } else {
                        this.emit(EClientEvents.error, {
                            message: this._logger.warn(`Fail to authorize request due reason: ${message.reason} ${message.error !== void 0 ? `(${message.error})`: ''}`),
                            reason: message.reason,
                            details: undefined
                        });
                        reject(message);
                    }
                } else {
                    this.emit(EClientEvents.error, {
                        message: this._logger.warn(`On this state (${this._getState()}) expected authorization confirmation, but gotten: ${Tools.inspect(message)}.`),
                        reason: undefined,
                        details: undefined
                    });
                    reject(message);
                }
                break;
            case EClientStates.listening:
                if (message instanceof Protocol.ResponseHeartbeat){
                    if (!message.allowed) {
                        this._reset();
                        this.emit(EClientEvents.error, {
                            message: this._logger.debug(`Token isn't accepted by server. Try reregister...`),
                            reason: undefined,
                            details: undefined
                        });
                        reject(message);
                    } else {
                        this.emit(EClientEvents.heartbeat);
                        resolve();
                        this._logger.debug(`Heartbeat [${(new Date()).toUTCString()}]...`);
                    }
                } else if (message instanceof Protocol.EventResponse) {
                    this.emit(EClientEvents.eventSent, message);
                    this._logger.debug(`Event sent to: ${message.sent}.`);
                    return resolve(message);
                } else if (message instanceof Protocol.IncomeEvent) {
                    this._processIncomeEvent(message);
                    resolve(message);
                } else if (message instanceof Protocol.SubscribeResponse) {
                    this.emit(EClientEvents.subscriptionDone, message);
                    this._logger.debug(`Subscription to protocol ${message.protocol}, event ${message.signature} has status: ${message.status}.`);
                    return resolve(message);
                } else if (message instanceof Protocol.UnsubscribeResponse) {
                    this.emit(EClientEvents.unsubscriptionDone, message);
                    this._logger.debug(`Unsubscription from protocol ${message.protocol}, event ${message.signature} has status: ${message.status}.`);
                    return resolve(message);
                } else if (message instanceof Protocol.UnsubscribeAllResponse) {
                    this.emit(EClientEvents.unsubscriptionAllDone, message);
                    this._logger.debug(`Unsubscription from all events in scope of protocol ${message.protocol}  has status: ${message.status}.`);
                    return resolve(message);
                } else if (message instanceof Protocol.RequestResponse) {
                    this.emit(EClientEvents.requestSent);
                    this._logger.debug(`Request sent: ${message.processing}.`);
                    return resolve(message);
                } else if (message instanceof Protocol.RequestResultResponse) {
                    this.emit(EClientEvents.requestDone);
                    this._logger.debug(`Request result: ${message.body}.`);
                    return resolve(message);
                }
                break;
            default:
                this.emit(EClientEvents.message);
                return resolve(message);
        }
        this._repeat(ERepeatReason.done);
    }

    private _repeat(reason: ERepeatReason){
        if (ERepeatTimeout[reason] !== void 0) {
            ERepeatTimeout[reason] > 0      && setTimeout(this._proceed.bind(this), ERepeatTimeout[reason]);
            ERepeatTimeout[reason] === 0    && this._proceed();
        }
    }

    private _setToken(token: string){
        if (Tools.getTypeOf(token) !== Tools.EPrimitiveTypes.string){
            return this._logger.warn(`Cannot set token. Expected {string}, but has gotten: ${Tools.getTypeOf(token)}.`);
        }
        this._token = token;
    }

    private _getToken(): string {
        return this._token;
    }

    private _setState(state: EClientStates) {
        this._state = state;
    }

    private _getState(): EClientStates {
        return this._state;
    }

    private _reset() {
        this._getState() === EClientStates.listening && this.emit(EClientEvents.disconnected);
        this._setToken('');
        this._setState(EClientStates.created);
        this._clientGUID = Tools.guid();      
    }

    /**
     * Emit event 
     * @param event {any} implementation of event
     * @param protocol {Protocol} implementation of event's protocol
     * @returns Promise
     */
    public eventEmit(event: any, protocol: any): Promise<any> {
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
            instance.setToken(this._getToken());
            const _request = new Request(this._clientGUID, this._parameters.getURL(), Enums.ERequestTypes.post, instance);
            this._registerRequest(_request, resolve, reject);
            _request.send();
        });
    }

    /**
     * Subscribe handler to event 
     * @param event {any} implementation of event
     * @param protocol {Protocol} implementation of event's protocol
     * @param handler {Function} handler
     * @returns Promise
     */
    public subscribeEvent(event: any, protocol: any, handler: Function): Promise<any> {
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
                    const subscription = this._holder.subscribe(protocolSignature, eventSignature, handler);
                    if (subscription instanceof Error){
                        return reject(subscription);
                    }
                    const instance = new Protocol.SubscribeRequest({
                        protocol: protocolSignature,
                        signature: eventSignature,
                        clientId: this._clientGUID
                    });
                    instance.setToken(this._getToken());
                    const _request = new Request(this._clientGUID, this._parameters.getURL(), Enums.ERequestTypes.post, instance);
                    this._registerRequest(_request, resolve, reject);
                    _request.send();
                })
                .catch((e)=>{
                    reject(e);
                });
        });
    }

    /** 
     * Unsubscribe handler from event 
     * @param event {any} implementation of event
     * @param protocol {Protocol} implementation of event's protocol
     * @returns Promise
     */
    public unsubscribeEvent(event: any, protocol: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const protocolSignature = Protocol.extractSignature(protocol);
            if (protocolSignature instanceof Error){
                return reject(protocolSignature);
            }
            const eventSignature = Protocol.extractSignature(event);
            if (eventSignature instanceof Error){
                return reject(eventSignature);
            }
            if (this._holder.unsubscribe(protocolSignature, eventSignature) !== true){
                return resolve(true);
            }
            const instance = new Protocol.UnsubscribeRequest({
                protocol: protocolSignature,
                signature: eventSignature,
                clientId: this._clientGUID
            });
            instance.setToken(this._getToken());
            const _request = new Request(this._clientGUID, this._parameters.getURL(), Enums.ERequestTypes.post, instance);
            this._registerRequest(_request, resolve, reject);
            _request.send();
        });
    }

    /** 
     * Unsubscribe all handlers from all events in scope of protocol
     * @param protocol {Protocol} implementation of event's protocol
     * @returns Promise
     */
    public unsubscribeAllEvents(protocol: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const protocolSignature = Protocol.extractSignature(protocol);
            if (protocolSignature instanceof Error){
                return reject(protocolSignature);
            }

            if (this._holder.unsubscribe(protocolSignature) !== true){
                return resolve(true);
            }
            const instance = new Protocol.UnsubscribeAllRequest({
                protocol: protocolSignature,
                clientId: this._clientGUID
            });
            instance.setToken(this._getToken());
            const _request = new Request(this._clientGUID, this._parameters.getURL(), Enums.ERequestTypes.post, instance);
            this._registerRequest(_request, resolve, reject);
            _request.send();
        });
    }

    private _processIncomeEvent(message: Protocol.IncomeEvent){
        return new Promise((resolve, reject) => {
            this._protocols.getImplementationFromStr(message.protocol, message.body)
                .then((event) => {
                    this._holder.emit(message.protocol, message.signature, event);
                    resolve(event);
                })
                .catch((e) => {
                    reject(e);
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