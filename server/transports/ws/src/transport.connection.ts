import * as HTTP from 'http';

import { Tools } from 'ceres.server.provider';

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

    constructor(request: HTTP.IncomingMessage, response: HTTP.ServerResponse, maxSize: number, CORS: boolean) {
        super({ strict: true });
        this._request = request;
        this._response = response;
        this._maxSize = maxSize;
        this._CORS = CORS;
        this._onAborted = this._onAborted.bind(this);
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

    public getRequest(): Promise<string> {
        return new Promise((resolve, reject) => {
            let str = '';
            let error: Error | null = null;
            this._request.on('data', (data) => {
                if (error !== null) {
                    return;
                }
                str += data;
                if (str.length > this._maxSize) {
                    error = new Error(`Length of request to big. Maximum length of request is: ${this._maxSize} bytes`);
                    this._request.destroy(error);
                    reject(error);
                }
            });
            this._request.on('end', () => {
                if (error !== null) {
                    return;
                }
                resolve(str);
            });
        });
    }

    public close(response: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this._setHeaders();
            this._response.write(response, (error: Error | null | undefined) => {
                if (error) {
                    return reject();
                }
                this._response.end(() => {
                    resolve();
                });
            });
        });
    }

    private _onAborted() {
        this.emit(Connection.EVENTS.onAborted, this);
    }

    private _setHeaders() {
        const headers: THeaders = {
            "Content-Type": "text/plain" ,
        };
        if (this._CORS) {
            headers['Access-Control-Allow-Origin'] = '*';
        }
        this._response.writeHead(200, headers);
    }

}
