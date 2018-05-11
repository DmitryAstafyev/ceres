import * as HTTP from 'http';
import * as Tools from '../../platform/tools/index';

import * as DescConnection from './connection/index';
import * as DescMiddleware from '../../infrastructure/middleware/implementation';

import { Request } from './request';

import * as Protocol from '../../protocols/connection/protocol.connection';

const SETTINGS = {
    POST_REQUEST_MAX_LENGTH: 100000
};

const REQUEST_EVENTS = {
    data    : 'data',
    end     : 'end'
};

interface IRequestCredential {
    token: string,
    clientId: string
}

export class Tokens {

    private _tokens: Map<string, string> = new Map();

    add(clientId: string): string {
        const token = Tools.guid();
        this._tokens.set(clientId, token);
        return token;
    }

    isValid(clientId: string, token: string): boolean {
        if (!this._tokens.has(clientId)){
            return false;
        }
        return this._tokens.get(clientId) === token;
    }
}

export class Server {
 
    private _logger     : Tools.Logger          = new Tools.Logger('Http.Server');
    private _requests   : Map<symbol, Request>  = new Map();
    private _parameters : DescConnection.ConnectionParameters;
    private _middleware : DescMiddleware.Middleware<HTTP.IncomingMessage, HTTP.ServerResponse>;
    private _http       : HTTP.Server;
    private _tokens     : Tokens = new Tokens();

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

    private _validatePost(request: Request, post: any): IRequestCredential | Error {
        const token     = Protocol.getToken(post);
        const clientId  = post.clientId;
        if (Tools.getTypeOf(clientId) !== Tools.EPrimitiveTypes.string || clientId.trim() === ''){
            //Client ID isn't defined at all
            const responseHandshake = new Protocol.ResponseHandshake({
                clientId: '',
                allowed: false,
                reason: Protocol.Reasons.NO_CLIENT_ID_FOUND
            });
            request.send({data: responseHandshake.getStr()});
            return new Error(`Client ID isn't defined.`);
        }
        if (token instanceof Error) {
            //Token isn't defined at all
            const responseHandshake = new Protocol.ResponseHandshake({
                clientId: post.clientId,
                allowed: false,
                reason: Protocol.Reasons.NO_TOKEN_FOUND,
                error: token.message
            });
            request.send({data: responseHandshake.getStr()});
            return new Error(`Cannot detect token.`);
        }
        return {
            token: token,
            clientId: clientId
        };
    }

    private _authClient(request: Request, credential: IRequestCredential, post: any) {
        this._middleware.auth(request.getId(), post)
            .then((auth: boolean) => {
                if (!auth){
                    return;
                }
                //Create a token
                const token = this._tokens.add(credential.clientId);
                //Send token to client
                request.send({ data: (new Protocol.ResponseHandshake({
                    clientId: credential.clientId,
                    allowed: true,
                    token: token
                })).getStr()});
                this._logger.debug(`Client ${credential.clientId} successfuly authorized.`)
            })
            .catch((error: Error) => {
                request.send({ data: (new Protocol.ResponseHandshake({
                    clientId: credential.clientId,
                    allowed: false,
                    reason: Protocol.Reasons.FAIL_AUTH
                })).getStr()});
                this._logger.debug(`Client ${credential.clientId} isn't authorized. Connection is refused.`)
            });
    }

    private _onRequest(request: HTTP.IncomingMessage, response: HTTP.ServerResponse){
        this._getPOSTData(request)
            .then((post: any) => {
                const _request = new Request(Symbol(Tools.guid()), request, response);
                //Validate body of request
                const credential = this._validatePost(_request, post);
                if (credential instanceof Error) {
                    return this._logger.debug(`Cannot processing request due error: ${credential.message}`);
                }
                //Authorization
                if (credential.token === '') {
                    return this._authClient(_request, credential, post);
                }
                //Get message
                const message = Protocol.extract(post);
                if (message instanceof Protocol.Heartbeat){
                        //Add request to storage
                        this._requests.set(_request.getId(), _request);
                        //Subscribe on request's events
                        this._subscribeRequest(_request);
                } else if (message instanceof Error) {
                    this._logger.warn(`Cannot exctract message due error: ${message.message}`);
                } else {
                    this._logger.warn(`Not expected type of message: ${Tools.getTypeOf(message)}. Expected "Heartbeat".`);
                }
            })
            .catch((error: Error) => {
                this._logger.warn(`Cannot exctract request due error: ${error.message}`);
            });
    
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