import * as Tools from '../../platform/tools/index';
import * as Enums from '../../platform/enums/index';
import * as DescConnection from './connection/index';
import * as DescMiddleware from '../../infrastructure/middleware/index';
import { Request } from './request';
import * as Protocol from '../../protocols/connection/protocol.connection';

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
    message = 'message'
}

export class Client extends Tools.EventEmitter {
    
    static STATES = EClientStates;
    static EVENTS = EClientEvents;
    private _logger     : Tools.Logger          = new Tools.Logger('Http.Client');
    private _requests   : Map<string, Request>  = new Map();
    private _parameters : DescConnection.ConnectionParameters;
    private _middleware : DescMiddleware.Middleware;
    private _state      : EClientStates = EClientStates.created;
    private _clientGUID : string = Tools.guid();
    private _token      : string = '';

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

    private _subscribeRequest(request: Request){
        request.subscribe(Request.EVENTS.expired,  this._onExpiredRequest.bind(this, request));
        request.subscribe(Request.EVENTS.error,    this._onErrorRequest.bind(this, request));
        request.subscribe(Request.EVENTS.done,     this._onDoneRequest.bind(this, request));
    }

    private _unsubscribeRequest(request: Request){
        request.unsubscribeAll(Request.EVENTS.expired);
        request.unsubscribeAll(Request.EVENTS.error);
        request.unsubscribeAll(Request.EVENTS.done);
    }

    private _registerRequest(request: Request){
        this._subscribeRequest(request);
        this._requests.set(request.getId(), request);
    }

    private _unregisterRequest(request: Request){
        this._unsubscribeRequest(request);
        this._requests.delete(request.getId());
    }

    private _onExpiredRequest(request: Request, error: Error){
        this._logger.dev(`Request guid: ${request.getId()} is expired due error: ${Tools.inspect(error)}`);
        this._reset();
        this._unregisterRequest(request);
        this._repeat(ERepeatReason.expired);
    }

    private _onErrorRequest(request: Request, error: Error){
        this.emit(EClientEvents.error, {
            message: this._logger.dev(`Request guid: ${request.getId()} is finished with error.`),
            reason: undefined,
            details: error.message
        });
        this._reset();
        this._unsubscribeRequest(request);
        this._repeat(ERepeatReason.error);
    }

    private _onDoneRequest(request: Request, response: any){
        this._logger.dev(`Request guid: ${request.getId()} is finished successfuly: ${Tools.inspect(response)}`);
        this._unsubscribeRequest(request);
        const message = Protocol.extract(response);
        if (message instanceof Error) {
            this.emit(EClientEvents.error, {
                message: this._logger.warn(`Cannot parse response due error: ${message.message}`),
                reason: undefined,
                details: undefined
            });
            return this._repeat(ERepeatReason.done);
        }
        switch(this._getState()){
            case EClientStates.created:
                if (message instanceof Protocol.ResponseHandshake) {
                    if (message.allowed && message.getToken() !== ''){
                        this.emit(EClientEvents.connected);
                        this._setToken(message.getToken());
                        this._setState(EClientStates.listening);
                    } else {
                        this.emit(EClientEvents.error, {
                            message: this._logger.warn(`Fail to authorize request due reason: ${message.reason} ${message.error !== void 0 ? `(${message.error})`: ''}`),
                            reason: message.reason,
                            details: undefined
                        });
                    }
                } else {
                    this.emit(EClientEvents.error, {
                        message: this._logger.warn(`On this state (${this._getState()}) expected authorization confirmation, but gotten: ${Tools.inspect(message)}.`),
                        reason: undefined,
                        details: undefined
                    });
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
                    } else {
                        this.emit(EClientEvents.heartbeat);
                        this._logger.debug(`Heartbeat [${(new Date()).toUTCString()}]...`);
                    }
                }
                break;
            default:
                this.emit(EClientEvents.message);
                break
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
        this._setToken('');
        this._setState(EClientStates.created);
        this._clientGUID = Tools.guid();      
    }

}