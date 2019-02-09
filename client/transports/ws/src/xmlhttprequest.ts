import { Tools } from 'ceres.client.consumer';

export enum ERequestTypes {
    get     = 'GET',
    post    = 'POST',
    put     = 'PUT',
    delete  = 'DELETE',
    option  = 'OPTION',
}

export type TRequestType = ERequestTypes.post | ERequestTypes.get | ERequestTypes.put | ERequestTypes.option | ERequestTypes.delete;

const HEADERS = {
    ACCEPT          : 'Accept',
    CONTENT_TYPE    : 'Content-Type',
};

export type THeaders = {[key: string]: string};
export type TCallback = (...args: any[]) => any;

export interface IEventDone {
    status: number;
    response: string | object;
}

export const ContentType = {
    binary: 'application/octet-stream',
    text: 'text/plain',
}

export default class ImpXMLHTTPRequest {

    public static METHODS = ERequestTypes;
    private _logger:            Tools.Logger        = new Tools.Logger('ImpXMLHTTPRequest');
    private _httpRequest:       XMLHttpRequest;
    private _method:            TRequestType        = ERequestTypes.post;
    private _url:               string              = '';
    private _timeout:           number              = 0;
    private _requestHeaders:    THeaders            = {};
    private _requestPost:       string | Uint8Array = '';
    private _resolved:          boolean             = false;
    private _rejected:          boolean             = false;

    constructor(
        url: string,
        post: string | Uint8Array,
        method: TRequestType = ERequestTypes.post,
        headers: THeaders = {},
        timeout: number = 0,
    ) {
        if (typeof url !== 'string' || url.trim() === '') {
            throw new Error(this._logger.env(`Parameter url should be defined.`));
        }
        if ((typeof post !== 'string' || post.trim() === '') && !(post instanceof Uint8Array)) {
            throw new Error(this._logger.env(`Parameter post should be defined.`));
        }
        if ((Object as any).values(ERequestTypes).indexOf(method) === -1) {
            throw new Error(this._logger.env(`Method should be defined as value of: ${(Object as any).values(ERequestTypes).join(', ')}`));
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

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    public send(): Promise<string | Uint8Array> {
        return new Promise((resolve: TCallback, reject: TCallback) => {
            if (this._requestPost instanceof Uint8Array) {
                this._httpRequest.responseType = "arraybuffer";
            }
            this._resolve = resolve;
            this._reject = reject;
            this._httpRequest.open(this._method, this._url, true);
            this._httpRequest.timeout = this._timeout;
            this._setRequestHeaders();
            this._httpRequest.send(this._requestPost);
        });
    }

    public close() {
        this._httpRequest.abort();
    }

    public getUrl(): string {
        return this._url;
    }

    public getXMLHttpRequest(): XMLHttpRequest {
        return this._httpRequest;
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    private _resolve: TCallback = () => void 0;
    private _reject: TCallback  = () => void 0;

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * XMLHttpRequest handlers
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    private _getRequestStateData(event: Event): { [key: string]: string | number | undefined } {
        const state = {
            readyState: undefined,
            status: undefined,
        };
        if (typeof event !== 'object' || event === null) {
            return state;
        }
        if (typeof event.target !== 'object' || event.target === null) {
            return state;
        }
        Object.keys(state).forEach((key: string) => {
            (state as any)[key] = (event.target as any)[key];
        });
        return state;
    }

    private _ontimeout(event: Event) {
        this._logger.verbose(`Request to url "${this._url}" is timeouted: `, event);
        this._rejectRequest(
            new Error(this._logger.env(`Request to url "${this._url}" is timeouted:`, this._getRequestStateData(event))),
        );
    }

    private _onerror(event: Event) {
        this._logger.verbose(`Request to url "${this._url}" finished with error: `, event);
        this._rejectRequest(
            new Error(this._logger.env(`Request to url "${this._url}" finished with error:`, this._getRequestStateData(event))),
        );
    }

    private _onreadystatechange( event: Event) {
        switch (this._httpRequest.readyState) {
            case XMLHttpRequest.DONE:
                if (this._httpRequest.status !== 200) {
                    return this._onerror(event);
                }
                const contentType = this._getContentType();
                switch(contentType) {
                    case ContentType.text:
                        this._resolveRequest(this._httpRequest.responseText, this._getResponseHeaders());
                        break;
                    case ContentType.binary:
                        if (!(this._httpRequest.response instanceof ArrayBuffer)) {
                            return this._rejectRequest(
                                new Error(this._logger.env(`Request to url "${this._url}" finished with error: for binary data expected ArrayBuffer, but response has type: ${typeof this._httpRequest.response}`)),
                            ); 
                        }
                        this._resolveRequest(new Uint8Array(this._httpRequest.response), this._getResponseHeaders());
                        break;
                    default:
                        this._rejectRequest(
                            new Error(this._logger.env(`Request to url "${this._url}" finished with error: unsupported content type: ${contentType}`)),
                        ); 
                        break;
                }
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Promise handlers
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _rejectRequest(error: Error) {
        if (this._rejected || this._resolved) {
            return this._logger.env(`Request to url "${this._url}" is already ${this._rejected ? 'rejected' : 'resolved'}. Cannot reject it.`);
        }
        this._reject(error);
    }

    private _resolveRequest(response: string | Uint8Array, headers: THeaders) {
        if (this._rejected || this._resolved) {
            return this._logger.env(`Request to url "${this._url}" is already ${this._rejected ? 'rejected' : 'resolved'}. Cannot resolve it.`);
        }
        this._resolve(response, headers);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Internal
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
    private _getResponseHeaders(): THeaders {
        const headers = this._httpRequest.getAllResponseHeaders();
        const results: THeaders = {};
        if (typeof headers === 'string') {
            headers.split(/[\r\n]/gi).forEach((header) => {
                const pair = header.split(':');
                if (pair.length === 2) {
                    results[pair[0].toLowerCase().trim()] = pair[1].toLowerCase().trim();
                }
            });
        }
        return results;
    }

    private _getContentType(): string | undefined {
        const headers = this._getResponseHeaders();
        return headers['content-type'];
    }

    private _defaultRequestHeaders(headers: THeaders = {}) {
        if (typeof headers !== 'object' || headers === null) {
            headers = {};
        }
        headers[HEADERS.CONTENT_TYPE]   === void 0 && (headers[HEADERS.CONTENT_TYPE]    = 'application/x-www-form-urlencoded');
        headers[HEADERS.ACCEPT]         === void 0 && (headers[HEADERS.ACCEPT]          = '*/*');
        return headers;
    }

    private _parseRequestHeaders(headers: THeaders = {}) {
        Object.keys(headers).forEach((key) => {
            const parts = key.split('-');
            parts.forEach((part, index) => {
                parts[index] = part.charAt(0).toUpperCase() + part.slice(1);
            });
            headers[parts.join('-')] = headers[key];
        });
        return headers;
    }

    private _setRequestHeaders() {
        Object.keys(this._requestHeaders).forEach((key) => {
            if (typeof this._requestHeaders[key] !== 'string') {
                throw new Error(this._logger.env(`Value of header should be STRING. Check HEADER [${key}]`));
            }
            this._httpRequest.setRequestHeader(key, this._requestHeaders[key]);
        });
    }

}
