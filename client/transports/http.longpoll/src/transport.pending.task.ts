import { Tools, Protocol, Token } from 'ceres.client.consumer';
import * as TransportProtocol from './protocols/protocol.transport.longpoll';
import { Request } from './transport.request.connection';

export type TMessage = TransportProtocol.TProtocolTypes | Protocol.TProtocolTypes;

export type TPandingExpectedMessage = Protocol.Message.ToConsumer | TransportProtocol.Message.Pending.Response | TransportProtocol.Disconnect;

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
    public create(url: string, clientGUID: string, token: Token): Promise<TPandingExpectedMessage[]> {
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
            this._request.send().then((response: string | Uint8Array) => {
                this._request = null;
                const messages: TPandingExpectedMessage[] = [];
                const errors: Error[] = [];
                let packets: any[] = [];
                if (TransportProtocol.isPackage(response)) {
                    const packetError: string[] | Uint8Array[] | Error = TransportProtocol.split(response);
                    if (packetError instanceof Error) {
                        return reject(new Error(`Cannot split packets due error: ${packetError.message}`));
                    }
                    packets = packetError;
                } else {
                    packets.push(response);
                }
                packets.forEach((packet: string | Uint8Array) => {
                    const message: TMessage = TransportProtocol.parseFrom(packet, [TransportProtocol, Protocol]) as TMessage;
                    if (message instanceof Error) {
                        return errors.push(message);
                    }
                    if (!(message instanceof Protocol.Message.ToConsumer) && !(message instanceof TransportProtocol.Message.Pending.Response) && !(message instanceof TransportProtocol.Disconnect)) {
                        return errors.push(new Error(`Unexpected response: ${message.constructor.name}: ${Tools.inspect(message)}`));
                    }
                    messages.push(message);
                });
                if (errors.length > 0) {
                    return reject(errors);
                }
                resolve(messages);
            }).catch((error: Error) => {
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
