import * as HTTP from 'http';

import { Tools } from 'ceres.provider';

type THeaders = { [key: string]: string };

export class Connection extends Tools.EventEmitter {

    public static EVENTS = {
        onAborted: Symbol(),
    };

    private _request: HTTP.IncomingMessage;
    private _response: HTTP.ServerResponse;
    private _maxSize: number;
    private _CORS: boolean;
    private _clientGUID: string | null = null;
    private _allowedHeaders: string[];

    constructor(request: HTTP.IncomingMessage, response: HTTP.ServerResponse, maxSize: number, CORS: boolean, allowedHeaders: string[] | undefined) {
        super({ strict: true });
        this._request = request;
        this._response = response;
        this._maxSize = maxSize;
        this._CORS = CORS;
        this._onAborted = this._onAborted.bind(this);
        this._allowedHeaders = allowedHeaders instanceof Array ? allowedHeaders : [];
        this._request.on('aborted', this._onAborted);
    }

    public setClientGUID(clientGUID: string): null | Error {
        if (this._clientGUID !== null) {
            return new Error(`Client GUID is already assigned`);
        }
        this._clientGUID = clientGUID;
        return null;
    }

    public getClientGUID(): string | null {
        return this._clientGUID;
    }

    public getRequest(): Promise<string | Uint8Array> {
        return new Promise((resolve, reject) => {
            let str: string = '';
            const buffer: number[] = [];
            let error: Error | null = null;
            this._request.on('data', (data) => {
                if (error !== null) {
                    return;
                }
                if (data instanceof Buffer) {
                    buffer.push(...data);
                } else {
                    str += data;
                }
                if (str.length > this._maxSize || buffer.length > this._maxSize) {
                    error = new Error(`Length of request to big. Maximum length of request is: ${this._maxSize} bytes`);
                    this._request.destroy(error);
                    reject(error);
                }
            });
            this._request.on('end', () => {
                if (error !== null) {
                    return;
                }
                if (buffer.length > 0) {
                    resolve(new Uint8Array(buffer));
                } else {
                    resolve(str);
                }
            });
        });
    }

    public close(response: string | Uint8Array): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof response !== 'string' && !(response instanceof Uint8Array)) {
                return reject(new Error(`To client can be sent only {string} or {Uint8Array}, but here is attempt to send: ${typeof response}.`));
            }
            this._setHeaders(response instanceof Uint8Array ? true : false);
            this._response.write(
                (response instanceof Uint8Array ? new Buffer(response) : response),
                (response instanceof Uint8Array ? 'binary' : 'utf8'),
                (error: Error | null | undefined) => {
                    if (error) {
                        return reject();
                    }
                    this._response.end(() => {
                        resolve();
                    }, (response instanceof Uint8Array ? 'binary' : 'utf8'));
                },
            );
        });
    }

    private _onAborted() {
        this.emit(Connection.EVENTS.onAborted, this);
    }

    private _setHeaders(binary: boolean = false) {
        const headers: THeaders = {
            "Content-Type": binary ? "application/octet-stream" : "text/plain",
        };
        if (this._allowedHeaders.length > 0) {
            headers['Access-Control-Allow-Headers'] = `${this._allowedHeaders.join(',')}`;
        }
        if (this._CORS) {
            headers['Access-Control-Allow-Origin'] = '*';
        }
        this._response.writeHead(200, headers);
    }

}
