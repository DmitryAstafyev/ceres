import * as Tools from '../../platform/tools/index';
import * as Enums from '../../platform/enums/index';
import * as DescConnection from './connection/index';
import * as DescMiddleware from '../../infrastructure/middleware/index';

import { Request } from './request';

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
    authorized = 'authorized',
    listening = 'listening'
}

export class Client {
    
    static STATES = EClientStates;

    private _logger     : Tools.Logger          = new Tools.Logger('Http.Client');
    private _requests   : Map<string, Request>  = new Map();
    private _parameters : DescConnection.ConnectionParameters;
    private _middleware : DescMiddleware.Middleware;
    private _state      : EClientStates = EClientStates.created;
    private _clientGUID : string = Tools.guid();

    constructor(
        parameters: DescConnection.ConnectionParameters,
        middleware?: DescMiddleware.Middleware
    ){
 
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
        switch(this._state){
            case EClientStates.created:
                const request = new Request(this._clientGUID, this._parameters.getURL(), Enums.ERequestTypes.post, {});
                this._registerRequest(request);
                request.send();
                break;
            case EClientStates.authorized:

                break;
            case EClientStates.listening:

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
        this._logger.debug(`Request guid: ${request.getId()} is expired due error: ${Tools.inspect(error)}`);
        this._unregisterRequest(request);
        this._repeat(ERepeatReason.expired);
    }

    private _onErrorRequest(request: Request, error: Error){
        this._logger.debug(`Request guid: ${request.getId()} is finished due error: ${Tools.inspect(error)}`);
        this._unsubscribeRequest(request);
        this._repeat(ERepeatReason.error);
    }

    private _onDoneRequest(request: Request, response: any){
        this._logger.debug(`Request guid: ${request.getId()} is finished successfuly: ${Tools.inspect(response)}`);
        this._unsubscribeRequest(request);
        this._repeat(ERepeatReason.done);
    }

    private _repeat(reason: ERepeatReason){
        if (ERepeatTimeout[reason] !== void 0) {
            ERepeatTimeout[reason] > 0      && setTimeout(this._proceed.bind(this), ERepeatTimeout[reason]);
            ERepeatTimeout[reason] === 0    && this._proceed();
        }
    }

}