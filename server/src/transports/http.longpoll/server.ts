import * as HTTP from 'http';
import * as Tools from '../../platform/tools/index';

import * as DescConnection from './connection/index';
import * as DescMiddleware from '../../infrastructure/middleware/implementation';

import { Request } from './request';

import * as Protocol from '../../protocols/connection/protocol.connection';

const SETTINGS = {
    NOT_AUTH_REQUEST_CLOSE_TIMEOUT: 3000, //ms
    POST_REQUEST_MAX_LENGTH: 100000
};

const REQUEST_EVENTS = {
    data    : 'data',
    end     : 'end'
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

    private _getPOSTData(request: HTTP.IncomingMessage): Promise<any> {
        const querystring = require('querystring');
        let str = '';
        let error: Error | null = null;
        return new Promise((resolve: (request: any) => any, reject: (error: Error) => any) => {
            request.on(REQUEST_EVENTS.data, (data) => {
                if (error !== null) {
                    return;
                }
                str += data;
                if (str.length > SETTINGS.POST_REQUEST_MAX_LENGTH) {
                    error = new Error(this._logger.warn(`Length of request to big. Maximum length of request is: ${SETTINGS.POST_REQUEST_MAX_LENGTH} bytes`))
                    reject(error);
                }                
            });
    
            request.on(REQUEST_EVENTS.end, () => {
                if (error !== null) {
                    return;
                }
                try {
                    let post = querystring.parse(str);
                    if (Tools.getTypeOf(post) !== Tools.EPrimitiveTypes.object){
                        return reject(new Error(this._logger.warn(`As post data expecting only {object}.`)));
                    }
                    resolve(post);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    private _onRequest(request: HTTP.IncomingMessage, response: HTTP.ServerResponse){
        this._getPOSTData(request)
            .then((post: any) => {
                const _request = new Request(Symbol(Tools.guid()), request, response);
                const token = Protocol.getToken(post);
                if (token instanceof Error) {
                    const responseHandshake = new Protocol.ResponseHandshake({
                        clientId: post.clientId,
                        allowed: false,
                        reason: Protocol.Reasons.NO_TOKEN_FOUND,
                        error: token.message
                    });
                    _request.send({data: responseHandshake});
                    return;
                }
                //Get message
                const message = Protocol.extract(post);
                if (token === '') {
                    //Case: not authorized request

                }
                console.log(message);
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
            })
            .catch((error: Error) => {
                this._logger.warn(`Cannot exctract request due error: ${error.message}`);
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