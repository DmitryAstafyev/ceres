import * as Tools from '../../platform/tools/index';
import { TRequestType, ERequestTypes } from '../../platform/enums/enum.http.request.types';


const HEADERS = {
    CONTENT_TYPE    : 'Content-Type',
    ACCEPT          : 'Accept'
};

type THeaders = {[key:string]: string};

export interface IEventDone {
    status: number
    response: string | object
};

export interface IRequestError {
    status: number,
    xmlHttpRequest: XMLHttpRequest
}

export default class ImpXMLHTTPRequest {

    static METHODS = ERequestTypes;
    private _logger             : Tools.Logger      = new Tools.Logger('ImpXMLHTTPRequest');
    private _httpRequest        : XMLHttpRequest;
    private _method             : TRequestType      = ERequestTypes.post;
    private _url                : string            = '';
    private _timeout            : number            = 0;
    private _requestHeaders     : THeaders          = {};
    private _requestPost        : string            = '';
    private _resolve            : Function          = () => {};
    private _reject             : Function          = () => {};
    private _resolved           : boolean           = false;
    private _rejected           : boolean           = false;
    private _aborted            : boolean           = false;

    constructor(
        url: string,
        post: string,
        method: TRequestType = ERequestTypes.post,
        headers: THeaders = {},
        timeout: number = 0
    ){
        if (typeof url !== 'string' || url.trim() === ''){
            throw new Error(this._logger.env(`Parameter url should be defined.`));
        }
        if (typeof post !== 'string' || post.trim() === ''){
            throw new Error(this._logger.env(`Parameter post should be defined.`));
        }
        if ((<any>Object).values(ERequestTypes).indexOf(method) === -1){
            throw new Error(this._logger.env(`Method should be defined as value of: ${(<any>Object).values(ERequestTypes).join(', ')}`));
        }
        this._httpRequest                       = new XMLHttpRequest();
        this._url                               = url;
        this._method                            = method;
        this._requestHeaders                    = this._parseRequestHeaders(this._defaultRequestHeaders(headers));
        this._requestPost                       = post;
        this._httpRequest.onreadystatechange    = this._onreadystatechange.bind(this);
        this._httpRequest.ontimeout             = this._ontimeout.bind(this);
        this._httpRequest.onerror               = this._onerror.bind(this);
        this._timeout                           = timeout;
    }

    send(): Promise<string> {
        return new Promise((resolve: Function, reject: Function) => {
            this._resolve = resolve;
            this._reject = reject;
            this._httpRequest.open(this._method, this._url, true);
            this._httpRequest.timeout = this._timeout;
            this._setRequestHeaders();
            this._httpRequest.send(this._requestPost);
        });
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * XMLHttpRequest handlers
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    private _ontimeout(event : Event){
        this._rejectRequest(
            new Tools.ExtError<XMLHttpRequest>(
                this._logger.env(`Request to url "${this._url}" is timeouted.`, event), 
                this._httpRequest
            )
        );    
    }

    private _onerror(event : Event){
        this._rejectRequest(
            new Tools.ExtError<XMLHttpRequest>(
                this._logger.env(`Request to url "${this._url}" finished with error: `, event), 
                this._httpRequest
            )
        ); 
    }

    private _onreadystatechange( event : Event) {
        switch (this._httpRequest.readyState) {
            case XMLHttpRequest.DONE:
                if (this._httpRequest.status !== 200) {
                    return this._onerror(event);
                }
                this._resolveRequest(this._httpRequest.responseText, this._getResponseHeaders());
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Promise handlers
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _rejectRequest(error: Tools.ExtError<XMLHttpRequest>) {
        if (this._aborted) {
            return this._logger.warn(`Request to url "${this._url}" was aborted. Cannot reject it.`);
        }
        if (this._rejected || this._resolved) {
            return this._logger.warn(`Request to url "${this._url}" is already ${this._rejected ? 'rejected' : 'resolved'}. Cannot reject it.`);
        }
        this._reject(error);
    }

    private _resolveRequest(responseText: string, headers: THeaders) {
        if (this._aborted) {
            return this._logger.warn(`Request to url "${this._url}" was aborted. Cannot resolve it.`);
        }
        if (this._rejected || this._resolved) {
            return this._logger.warn(`Request to url "${this._url}" is already ${this._rejected ? 'rejected' : 'resolved'}. Cannot resolve it.`);
        }
        this._resolve(responseText, headers);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Internal
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _getResponseHeaders(): THeaders{
        const headers = this._httpRequest.getAllResponseHeaders();
        let results: THeaders = {};
        if (typeof headers === 'string'){
            headers.split(/[\r\n]/gi).forEach((header)=>{
                let pair = header.split(':');
                if (pair.length === 2){
                    results[pair[0]] = pair[1];
                }
            });
        }
        return results;
    }
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    public close(){
        this._aborted = true;
        this._httpRequest.abort();
    }

    public getUrl(): string {
        return this._url;
    }

    private _defaultRequestHeaders(headers : THeaders = {}){
        if (typeof headers !== 'object' || headers === null){
            headers = {};
        }
        headers[HEADERS.CONTENT_TYPE]   === void 0 && (headers[HEADERS.CONTENT_TYPE]    = 'application/x-www-form-urlencoded');
        headers[HEADERS.ACCEPT]         === void 0 && (headers[HEADERS.ACCEPT]          = '*/*');
        return headers;
    }

    private _parseRequestHeaders(headers : THeaders = {}){
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
            if (typeof this._requestHeaders[key] !== 'string'){
                throw new Error(this._logger.env(`Value of header should be STRING. Check HEADER [${key}]`));
            }
            this._httpRequest.setRequestHeader(key, this._requestHeaders[key]);
        });
    }

}