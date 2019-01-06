import * as Protocol from './protocols/connection/protocol.connection';
import { MessageProcessor } from './provider.msg.processor';
import { ProviderState } from './provider.state';
import { TSender } from './transports/transport.abstract';

export class MessageReconnectionProcessor extends MessageProcessor<Protocol.Message.Reconnection.Request> {

    constructor(state: ProviderState) {
        super('Reconnection', state);
    }

    public process(sender: TSender, message: Protocol.Message.Reconnection.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            return sender((new Protocol.Message.Reconnection.Response({
                allowed: true,
                clientId: clientId,
            })).stringify()).then(() => {
                this._logger.env(`Reconnection for client ${clientId} is allowed.`);
                resolveProcess();
            }).catch((error: Error) => {
                rejectProcess(new Error(this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`)));
            });
        });
    }

    public drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

}
