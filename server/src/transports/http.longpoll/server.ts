import * as HTTP from 'http';
import * as Tools from '../../platform/tools/index';

import * as DescConnection from './connection/index';
import * as DescMiddleware from '../../infrastructure/middleware/implementation';

import { Request } from './request';

const SETTINGS = {
    NOT_AUTH_REQUEST_CLOSE_TIMEOUT: 3000 //ms
};

export class Server {
 
    private _logger     : Tools.Logger          = new Tools.Logger('Http.Server');
    private _requests   : Map<symbol, Request>  = new Map();
    private _parameters : DescConnection.ConnectionParameters;
    private _middleware : DescMiddleware.Middleware<HTTP.IncomingMessage, HTTP.ServerResponse>;
    private _http       : HTTP.Server;
 
    constructor(
        parameters: DescConnection.ConnectionParameters,
        middleware?: DescMiddleware.Middleware<HTTP.IncomingMessage, HTTP.ServerResponse>
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

        this._http = HTTP.createServer(this._onRequest.bind(this)).listen(this._parameters.port); 
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
        const _request  = new Request(Symbol(Tools.guid()), request, response);
        //Authorization of request
        this._middleware.auth(_request.getId(), request)
            .then((auth: boolean) => {
                if (!auth){
                    return this._closeNotAuthRequest(_request);
                }
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

    private _closeNotAuthRequest(request: Request){
        setTimeout(() => {
            if (!(request instanceof Request)) {
                return false;
            }
            request.close();
            this._logger.debug(`Request ${request.getId().toString()} was closed, because athorization was failed on midleware level.`);
        }, SETTINGS.NOT_AUTH_REQUEST_CLOSE_TIMEOUT);
    }

    private _send(message: string){
        this._requests.forEach((request: Request, ID: symbol) => {
            request.send({ data: message });
        });
    }

    private _subscribeRequest(_request: Request){
        _request.on(_request.EVENTS.onClose, this._onCloseRequest.bind(this, _request));
    }

    private _unsubscribeRequest(_request: Request){
        _request.removeAllListeners(_request.EVENTS.onClose);
    }

    private _onCloseRequest(_request: Request){
        this._unsubscribeRequest(_request);
        this._requests.delete(_request.getId());
    }
}