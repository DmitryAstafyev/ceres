import { Tools, Protocol, Token } from 'ceres.client.consumer';
import * as TransportProtocol from './protocols/protocol.transport.ws';
import { Request } from './transport.request.connection';

type TMessage = TransportProtocol.TProtocolTypes | Protocol.TProtocolTypes;
/**
 * @class Pending
 * @desc Connection which pending command from server
 */
export class Pending {

    private _request: Request | null = null;
    private _guid: string = Tools.guid();
    private _url: string = '';

    /**
     * Create pending connection
     * @returns {Promise<TransportProtocol.Message.Pending.Response>}
     */
    public create(url: string, clientGUID: string, token: Token): Promise<TransportProtocol.Message.Pending.Response | TransportProtocol.Disconnect> {
        this._url = url;
        return new Promise((resolve, reject) => {
            if (this._request !== null) {
                return reject(new Error(`Attempt to create pending connection, even is already created.`));
            }
            const instance = new TransportProtocol.Message.Pending.Request({
                clientId: clientGUID,
                token: token.get(),
            });
            this._request = new Request(url, instance.stringify());
            const requestId = this._request.getId();
            this._request.send()
                .then((response: string) => {
                    this._request = null;
                    const message: TMessage = TransportProtocol.parseFrom(response, [TransportProtocol, Protocol]) as TMessage;
                    if (message instanceof Error) {
                        return reject(message);
                    }
                    if (!(message instanceof Protocol.Message.ToConsumer) && !(message instanceof TransportProtocol.Message.Pending.Response) && !(message instanceof TransportProtocol.Disconnect)) {
                        return reject(new Error(`Unexpected response: ${message.constructor.name}: ${Tools.inspect(message)}`));
                    }
                    resolve(message);
                })
                .catch((error: Error) => {
                    this._request = null;
                    reject(new Error(`Pending request guid "${requestId}" finished within error: ${error.message}`));
                });
        });
    }

    /**
     * Close pending connection.
     * @returns {void}
     */
    public drop() {
        if (this._request === null) {
            return;
        }
        this._request.close();
    }

    /**
     * Returns GUID of request
     * @returns {string}
     */
    public getGUID(): string {
        return this._guid;
    }

    /**
     * Returns URL of request
     * @returns {string}
     */
    public getURL(): string {
        return this._url;
    }

}
