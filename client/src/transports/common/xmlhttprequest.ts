import * as Tools from '../../platform/tools/index';
import { TTransportEvents } from '../../infrastructure/transport.events';
import { TRequestType, ERequestTypes } from '../../platform/enums/enum.http.request.types';


const HEADERS = {
    CONTENT_TYPE    : 'Content-Type',
    ACCEPT          : 'Accept'
};

const EVENTS = {
    headers : Symbol('headers'),
    change  : Symbol('change'),
    done    : Symbol('done'),
    error   : Symbol('error'),
    timeout : Symbol('timeout'),
    fail    : Symbol('fail')
};

const ATTEMPTS = {
    MIN: 1,
    MAX: 99
};

const logger = new Tools.Logger('ImpXMLHTTPRequest');

type TRequestHeaders = {[key:string]: string};

export default class ImpXMLHTTPRequest extends Tools.EventEmitter {

    static EVENTS   = EVENTS;
    static METHODS  = ERequestTypes;

    private _httpRequest        : XMLHttpRequest;
    private _method             : TRequestType      = ERequestTypes.post;
    private _url                : string            = '';
    private _responseHeaders    : TRequestHeaders   = {};
    private _responseText       : string            = '';
    private _validator          : Function          = () => {};
    private _parser             : Function          = () => {};
    private _attempts           : number            = 0;
    private _requestHeaders     : TRequestHeaders   = {};
    private _requestPost        : Object            = {};
    private _requestPostParsed  : string            = '';
    private _resolve            : Function          = () => {};
    private _reject             : Function          = () => {};
    private _callback           : Function          = () => {};
    private _error              : Error | null      = null;

    constructor({
                   url          = '',
                   method       = ERequestTypes.post,
                   attempts     = 0,
                   validator    = {},
                   headers      = {},
                   post         = {},
                   parser       = {}
                } = {}
    ){
        super();
        if (typeof url === 'string' && url !== ''){
            if (~(<any>Object).values(ERequestTypes).indexOf(method)){
                this._httpRequest                    = new XMLHttpRequest();
                this._url                            = url;
                this._method                         = method;
                this._validator                      = this._defaultValidator(validator);
                this._parser                         = this._defaultParser(parser);
                this._attempts                       = attempts < ATTEMPTS.MIN ? ATTEMPTS.MIN : (attempts > ATTEMPTS.MAX ? ATTEMPTS.MAX : attempts);
                this._requestHeaders                 = this._parseRequestHeaders(this._defaultRequestHeaders(headers));
                this._requestPost                    = post;
                this._requestPostParsed              = this._parseRequestPost(post);
                this._httpRequest.onreadystatechange = this._onreadystatechange.bind(this);
                this._httpRequest.ontimeout          = this._ontimeout.bind(this);
                this._httpRequest.onerror            = this._onerror.bind(this);
            } else {
                throw new Error(logger.error(`Method should be defined as value of: ${(<any>Object).values(ERequestTypes).join(', ')}`));
            }
        } else {
            throw new Error(logger.error('URL should be defined as STRING.'));
        }
    }

    send(callback?: Function): Promise<void> {
        return new Promise((resolve: Function, reject: Function) => {
            this._resolve = resolve;
            this._reject = reject;
            this._callback = typeof callback === 'function' ? callback : () => {};
            this._httpRequest.open(this._method, this._url, true);
            this._setRequestHeaders();
            this._httpRequest.send(this._requestPostParsed);
        });

    }

    close(){
        this._httpRequest.abort();
    }

    private _nextAttempt(){
        if (this._attempts > 1){
            this._attempts -= 1;
            this.send();
            return true;
        } else {
            return false;
        }
    }

    private _ontimeout(event : Event){
        this._acceptTimeout(event);
    }

    private _onerror(event : Event){
        this._acceptError(event);
    }

    private _onreadystatechange( event : Event) {
        switch (this._httpRequest.readyState) {
            case XMLHttpRequest.HEADERS_RECEIVED:
                this._acceptHeaders();
                break;
            case XMLHttpRequest.DONE:
                if (this._httpRequest.status === 200) {
                    this._acceptSuccess();
                } else if (Tools.getTypeOf(this._httpRequest.responseText) === Tools.EPrimitiveTypes.string && this._httpRequest.responseText.trim() !== '') {
                    this._acceptError(new Error(`Response isn't 200. Response is: ${this._httpRequest.responseText}`));
                    return false;
                } else {
                    this._acceptError(event);
                    return false;
                }
                break;
        }
        this._acceptChange(event);
    }

    private _acceptHeaders() {
        let headers = this._httpRequest.getAllResponseHeaders();
        if (typeof headers === 'string'){
            headers.split('\r\n').forEach((header)=>{
                let pair = header.split(':');
                if (pair.length === 2){
                    this._responseHeaders[pair[0]] = pair[1];
                }
            });
        }
        this.emit(EVENTS.headers, this._responseHeaders);
    }

    private _acceptSuccess(){
        this._responseText = this._httpRequest.responseText;
        let response;
        try {
            response = JSON.parse(this._responseText);
            response = this._parser(response);
        } catch (e){ 
            response = this._responseText;
        }
        if (this._validator(response)){
            this._resolve(response);
            this.emit(EVENTS.done, response);
            this.emit(TTransportEvents.done, response);
            this._callback(response, null);
        } else {
            this._acceptError(new Error('Not valid responce'));
        }
    }

    private _acceptError(event : Event | Error){
        if (!this._nextAttempt() && this._error === null){
            const error = new Error(logger.error(`Request finished with error. Was done ${this._attempts} attempts to send. Error:`, event));
            this._error = error;
            this.emit(EVENTS.fail, error);
            this.emit(TTransportEvents.error, error);
            this._reject(error);
            this._callback(null, error);
        }    
    }

    private _acceptChange(event : Event | XMLHttpRequest){
        this.emit(EVENTS.change, event);
    }

    private _acceptTimeout(event : Event){
        if (!this._nextAttempt()){
            const error = new Error(logger.error(`Request is timeouted. Was done ${this._attempts} attempts to send.`));
            this.emit(EVENTS.timeout, error);
            this.emit(TTransportEvents.error, error);
            this._reject(error);
            this._callback(null, error);
        }
    }

    private _defaultValidator(validator : Function | any){
        return typeof validator === 'function' ? validator : function (){ return true; };
    }

    private _defaultParser(parser : Function | any){
        return typeof parser === 'function' ? parser : function (data : any){ return data; };
    }

    private _defaultRequestHeaders(headers : TRequestHeaders = {}){
        if (typeof headers !== 'object' || headers === null){
            headers = {};
        }
        headers[HEADERS.CONTENT_TYPE]   === void 0 && (headers[HEADERS.CONTENT_TYPE]    = 'application/x-www-form-urlencoded');
        headers[HEADERS.ACCEPT]         === void 0 && (headers[HEADERS.ACCEPT]          = '*/*');
        return headers;
    }

    private _parseRequestHeaders(headers : TRequestHeaders = {}){
        Object.keys(headers).forEach((key)=>{
            let parts = key.split('-');
            parts.forEach((part, index)=>{
                parts[index] = part.charAt(0).toUpperCase() + part.slice(1);
            });
            headers[parts.join('-')] = headers[key];
        });
        return headers;
    }

    private _setRequestHeaders(){
        Object.keys(this._requestHeaders).forEach((key)=>{
            if (typeof this._requestHeaders[key] === 'string'){
                this._httpRequest.setRequestHeader(key, this._requestHeaders[key]);
            } else {
                throw new Error(logger.error(`Value of header should be STRING. Check HEADER [${key}]`));
            }
        });
    }

    private _parseRequestPost(post : any = {}){
        let params: any = {},
            result = '';
        if (post instanceof Array){
            post.map((param)=>{
                if (typeof param === 'string'){
                    return param.trim();
                } else {
                    throw new Error(logger.error('As parameter (in array) can be used only STRING'));
                }
            }).forEach((param)=>{
                let pair = param.split('=');
                if (pair.length === 2){
                    params[pair[0]] = pair[1];
                } else {
                    throw new Error(logger.error('As parameter (in array) can be used only pair: key=value'));
                }
            });
        } else if (typeof post === 'object' && post !== null){
            Object.keys(post).forEach((key)=>{
                switch(typeof post[key]){
                    case 'string':
                        params[key] = post[key];
                        break;
                    case 'boolean':
                        params[key] = post[key].toString();
                        break;
                    case 'number':
                        params[key] = post[key].toString();
                        break;
                    default:
                        try{
                            params[key] = JSON.stringify(post[key]);
                        } catch (e) { }
                        break;
                }
            });
        } else if (typeof post !== 'string'){
            throw new Error(logger.error('Parameters of request can be: OBJECT[key = value], ARRAY[key,value] or STRING. Type of not valid parameters is: [' + typeof post + ']'))
        } else {
            params = post;
        }
        if (typeof params === 'object'){
            if (/application\/json/gi.test(this._requestHeaders[HEADERS.CONTENT_TYPE])){
                result = JSON.stringify(params);
            } else {
                let encodeURI = /-urlencoded/gi.test(this._requestHeaders[HEADERS.CONTENT_TYPE]);
                Object.keys(params).forEach((key, index)=>{
                    result += (index > 0 ? '&' : '') + key + '=' + (encodeURI ? encodeURIComponent(params[key]) : params[key]);
                });
            }
        }
        //Parameters are converted to string
        return result;
    }

}