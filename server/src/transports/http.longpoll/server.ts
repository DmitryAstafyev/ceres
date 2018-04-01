import * as HTTP from 'http';
import Logger from '../../platform/tools/tools.logger';
import objectValidate from '../../platform/tools/tools.object.validator';

import * as DescConnection from './connection/index';
import * as DescMiddleware from '../../infrastructure/middleware/index';

import { Request } from './request';

export class Server {
 
    private _logger     : Logger                = new Logger('Http.Server');
    private _requests   : Map<symbol, Request>  = new Map();
    private _parameters : DescConnection.Implementation.ConnectionParameters;
    private _middleware : DescMiddleware.Implementation.Middleware;
    private _http       : HTTP.Server;
 
    constructor(
        parameters: DescConnection.Implementation.ConnectionParameters,
        middleware?: DescMiddleware.Implementation.Middleware
    ){
 
        if (!(parameters instanceof DescConnection.Implementation.ConnectionParameters)) {
            if (parameters !== undefined){
                this._logger.warn(`Get wrong parameters of connection. Expected <ConnectionParameters>. Gotten: `, parameters);
            }
            parameters = new DescConnection.Implementation.ConnectionParameters({});
        }

        if (!(middleware instanceof DescMiddleware.Implementation.Middleware)) {
            if (middleware !== undefined){
                this._logger.warn(`Get wrong parameters of connection. Expected <Middleware>. Gotten: `, middleware);
            }
            middleware = new DescMiddleware.Implementation.Middleware({});
        }

        this._parameters = parameters;
        this._middleware = middleware;

        this._http = HTTP.createServer(this._onRequest).listen(this._parameters.port); 
    }

    /**
     * Destroy server
     * @returns {Promise<void>} - Formatted log-string
     */
    public destroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._http.close(resolve);
        });
    }

    private _onRequest(request: HTTP.IncomingMessage, response: HTTP.ServerResponse){
        const _request  = new Request(Symbol(), request, response);
        //Authorization of request
        this._middleware.auth(_request.getId(), request)
            .then(() => {
                //Add request to storage
                this._requests.set(_request.getId(), _request);
                //Subscribe on request's events
                this._subscribeRequest(_request);
            })
            .catch((error: Error) => {
                //Close request immediately 
                _request.close();
            });
    }

    private _send(message: string){
        this._requests.forEach((request: Request, ID: symbol) => {
            request.send({ data: message });
        });
    }

    private _subscribeRequest(_request: Request){
        _request.on(_request.EVENTS.onExpired,  this._onExpiredRequest.bind(this, _request));
        _request.on(_request.EVENTS.onEnd,      this._onEndRequest.bind(this, _request));
    }

    private _unsubscribeRequest(_request: Request){
        _request.removeAllListeners(_request.EVENTS.onExpired);
        _request.removeAllListeners(_request.EVENTS.onEnd);
    }

    private _onExpiredRequest(_request: Request){
        this._unsubscribeRequest(_request);
        this._requests.delete(_request.getId());
    }

    private _onEndRequest(_request: Request){
        this._unsubscribeRequest(_request);
        this._requests.delete(_request.getId());
    }
}