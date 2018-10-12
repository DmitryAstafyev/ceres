import * as Protocol from '../../protocols/connection/protocol.connection';

import { Request } from './client.request';

export class Requests {

    private _requests: Map<string, Request> = new Map();

    public send(url: string, body: string): Promise<Protocol.TProtocolTypes> {
        return new Promise((resolve, reject) => {
            const request = new Request(url, body);
            this._requests.set(request.getId(), request);
            request.send()
                .then((response: string) => {
                    this._requests.delete(request.getId());
                    const message = Protocol.parse(response);
                    if (message instanceof Error) {
                        return reject(message);
                    }
                    resolve(message);
                })
                .catch((error: Error) => {
                    this._requests.delete(request.getId());
                    reject(error);
                });
        });
    }

    public drop() {
        this._requests.forEach((request: Request) => {
            request.close();
        });
        this._requests.clear();
    }

}
