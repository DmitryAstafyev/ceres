import { Protocol } from 'ceres.client.consumer';
import * as TransportProtocol from './protocols/protocol.transport.ws';

import { Request } from './transport.request.connection';

export class Requests {

    private _requests: Map<string, Request> = new Map();

    public send(url: string, body: string | Uint8Array): Promise<TransportProtocol.TProtocolTypes> {
        return new Promise((resolve, reject) => {
            const request = new Request(url, body);
            this._requests.set(request.getId(), request);
            request.send().then((response: string | Uint8Array) => {
                this._requests.delete(request.getId());
                const message = TransportProtocol.parseFrom(response, [TransportProtocol, Protocol]);
                if (message instanceof Error) {
                    return reject(message);
                }
                resolve(message);
            }).catch((error: Error) => {
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
