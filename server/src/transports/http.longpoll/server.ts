import * as HTTP from 'http';
import * as Tools from '../../platform/tools/index';

import * as DescConnection from './connection/index';
import * as DescMiddleware from '../../infrastructure/middleware/implementation';

import { Request } from './request';

import * as Protocol from '../../protocols/connection/protocol.connection';

const SETTINGS = {
    POST_REQUEST_MAX_LENGTH: 100000,
    TOKENS_CLEANUP_TIMEOUT: 30000,
};

const REQUEST_EVENTS = {
    data    : 'data',
    end     : 'end'
};

const HTTP_INCOME_MESSAGE_EVENTS = {
    close: 'close',
    aborted: 'aborted'
};

interface IRequestCredential {
    token: string,
    clientId: string
}

export class Tokens {

    private _tokens : Map<string, { token: string, timestamp: number }> = new Map();
    private _timer  : NodeJS.Timer | null = null;
    
    constructor(){
        this.cleanup();
    }

    add(clientId: string): string {
        const token = Tools.guid();
        this._tokens.set(clientId, {
            token: token,
            timestamp: (new Date()).getTime()
        });
        return token;
    }

    isValid(clientId: string, token: string): boolean {
        if (!this.isRegistred(token)){
            return false;
        }
        const data = this._tokens.get(clientId);
        return data !== void 0 ? (data.token === token ? true : false) : false;
    }

    isRegistred(clientId: string): boolean {
        return this._tokens.has(clientId);
    }

    refresh(clientId: string) {
        const data = this._tokens.get(clientId);
        if (data === void 0) {
            return;
        }
        this._tokens.set(clientId, {
            token: data.token,
            timestamp: (new Date()).getTime()
        });
    }

    remove(clientId: string) {
        this._tokens.delete(clientId);
        console.log('removed token of ' + clientId);
    }

    destroy() {
		if (this._timer === null) {
			return false;
		}
		if (this._timer !== null) {
			this._timer.unref();
			this._timer = null;
		}
    }

    private cleanup() {
        this._timer = setTimeout(() => {
            const timestamp: number = (new Date()).getTime();
            const removed: Array<string> = [];
            this._tokens.forEach((value, clientId: string) => {
                if (timestamp - value.timestamp > SETTINGS.TOKENS_CLEANUP_TIMEOUT) {
                    removed.push(clientId);
                }
            });
            removed.forEach((clientId: string) => {
                this._tokens.delete(clientId);
            });
            this.cleanup();
            console.log('cleanup is done. removed: ' + removed.length + ' from ' + this._tokens.size);
        }, SETTINGS.TOKENS_CLEANUP_TIMEOUT);
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
            this._tokens.destroy();
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
            request.send({data: responseHandshake.getStr(), safely: true});
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
            request.send({data: responseHandshake.getStr(), safely: true});
            return new Error(`Cannot detect token. Client ID: ${clientId}.`);
        }
        if (token === '' && this._tokens.isRegistred(clientId)) {
            //Client is already registred
            const responseHandshake = new Protocol.ResponseHandshake({
                clientId: post.clientId,
                allowed: false,
                reason: Protocol.Reasons.NO_TOKEN_PROVIDED
            });
            request.send({data: responseHandshake.getStr(), safely: true});
            return new Error(`Token isn't provided, even client is already registred. Client ID: ${clientId}.`);
        }
        if (token !== '' && !this._tokens.isRegistred(clientId)) {
            //Client doesn't have registred token
            const responseHandshake = new Protocol.ResponseHeartbeat({
                clientId: post.clientId,
                allowed: false,
                reason: Protocol.Reasons.TOKEN_IS_WRONG
            });
            request.send({data: responseHandshake.getStr(), safely: true});
            return new Error(`Token provided by client isn't registred. Client ID: ${clientId}.`);
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
                const responseHandshake = new Protocol.ResponseHandshake({
                    clientId: credential.clientId,
                    allowed: true
                });
                responseHandshake.setToken(token);
                request.send({ data: responseHandshake.getStr()});
                this._logger.debug(`Client ${credential.clientId} successfuly authorized.`);
            })
            .catch((error: Error) => {
                request.send({ data: (new Protocol.ResponseHandshake({
                    clientId: credential.clientId,
                    allowed: false,
                    reason: Protocol.Reasons.FAIL_AUTH
                })).getStr()});
                this._logger.debug(`Client ${credential.clientId} isn't authorized. Connection is refused.`);
            });
    }

    private _subscribeIncomeMessage(request: HTTP.IncomingMessage, clientId: string){
        request.on(HTTP_INCOME_MESSAGE_EVENTS.aborted, () => {
            this._tokens.remove(clientId);
        });
    }

    private _onRequest(request: HTTP.IncomingMessage, response: HTTP.ServerResponse){
        this._getPOSTData(request)
            .then((post: any) => {
                const _request = new Request(Symbol(Tools.guid()), request, response);
                //Validate body of request
                const credential: IRequestCredential | Error = this._validatePost(_request, post);
                if (credential instanceof Error) {
                    return this._logger.debug(`Cannot processing request due error: ${credential.message}`);
                }
                //Subscribe HTTP.IncomingMessage events
                this._subscribeIncomeMessage(request, credential.clientId);
                //Authorization: not authorized
                if (credential.token === '') {
                    return this._authClient(_request, credential, post);
                }
                //Get message
                const message = Protocol.extract(post);
                if (message instanceof Protocol.RequestHeartbeat) {
                    //Add request to storage
                    this._requests.set(_request.getId(), _request);
                    //Subscribe on request's events
                    this._subscribeRequest(_request);
                    //Set expired response
                    _request.setExpiredResponse(this._getExpiredResponse(credential));
                    //Update token date
                    this._tokens.refresh(credential.clientId);
                } else if (message instanceof Error) {
                    this._logger.warn(`Cannot exctract message due error: ${message.message}`);
                } else {
                    this._logger.warn(`Not expected type of message: ${Tools.getTypeOf(message)}. Expected "${Protocol.RequestHeartbeat.name}".`);
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

    private _getExpiredResponse(credential: IRequestCredential): string {
        const responseHeartbeat = new Protocol.ResponseHeartbeat({
            clientId: credential.clientId,
            allowed: true
        });
        responseHeartbeat.setToken(credential.token);
        return responseHeartbeat.getStr();
    }
}