import { Tools, Protocol, Token } from 'ceres.client.consumer';
import * as TransportProtocol from './protocols/protocol.transport.longpoll';

import { Request } from './transport.request.connection';

/**
 * @class Hook
 * @desc Class hook never finishs. Hook request shows: is connection alive or not
 */
export class Hook {

    private _request: Request | null = null;

    /**
     * Create hook request. This request never finish.
     * @returns {Promise<Error>}
     */
    public create(url: string, clientGUID: string, token: Token): Promise<TransportProtocol.ConnectionError | TransportProtocol.Disconnect> {
        return new Promise((resolve, reject) => {
            if (this._request !== null) {
                return reject(new Error(`Attempt to create hook, even hook is already created.`));
            }
            const instance = new TransportProtocol.Message.Hook.Request({
                clientId: clientGUID,
                token: token.get(),
            });
            this._request = new Request(url, instance.stringify());
            const requestId = this._request.getId();
            this._request.send().then((response: string) => {
                const message = TransportProtocol.parseFrom(response, [TransportProtocol, Protocol]);
                this._request = null;
                if (message instanceof Error) {
                    return reject(message);
                }
                if (!(message instanceof TransportProtocol.ConnectionError) && !(message instanceof TransportProtocol.Disconnect)) {
                    return reject(new Error(`Unexpected response: ${message.constructor.name}: ${Tools.inspect(message)}`));
                }
                resolve(message);
            }).catch((error: Error) => {
                this._request = null;
                reject(new Error(`Hook request guid "${requestId}" finished within error: ${error.message}`));
            });
        });
    }

    /**
     * Close hook connection.
     * @returns {void}
     */
    public drop() {
        if (this._request === null) {
            return;
        }
        this._request.close();
    }

}
