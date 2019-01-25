import * as Tools from './platform/tools/index';
import * as Protocol from './protocols/connection/protocol.connection';
import { MessageProcessor } from './provider.msg.processor';
import { ProviderState } from './provider.state';
import { TSender } from './transports/transport.abstract';

export class MessageUnsubscribeAllProcessor extends MessageProcessor<Protocol.Message.UnsubscribeAll.Request> {

    constructor(state: ProviderState) {
        super('UnsubscribeAll', state);
    }

    public process(sender: TSender, message: Protocol.Message.UnsubscribeAll.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            const status: boolean | Error = this.state.events.unsubscribe(
                clientId,
                message.subscription.protocol,
            );
            return sender((new Protocol.Message.UnsubscribeAll.Response({
                clientId: clientId,
                error: status instanceof Error ? status.message : undefined,
                guid: message.guid,
                status: status instanceof Error ? false : status,
            })).stringify()).then(() => {
                this._logger.env(`Unsubscription for client ${clientId} to protocol ${message.subscription.protocol}, all events is done.`);
                resolveProcess();
            }).catch((error: Error) => {
                rejectProcess(error);
            });
        });
    }

    public drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

}
