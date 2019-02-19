import * as Tools from './platform/tools/index';
import * as Protocol from './protocols/connection/protocol.connection';
import { MessageProcessor } from './provider.msg.processor';
import { ProviderState } from './provider.state';
import { TSender } from './transports/transport.abstract';

export class MessageRespondentUnbindProcessor extends MessageProcessor<Protocol.Message.Respondent.Unbind.Request> {

    constructor(state: ProviderState) {
        super('Respondent.Unbind', state);
    }

    public process(sender: TSender, message: Protocol.Message.Respondent.Unbind.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            const status: boolean = this.state.demands.unsubscribe(clientId, message.protocol, message.demand);
            return sender((new Protocol.Message.Respondent.Unbind.Response({
                clientId: clientId,
                guid: message.guid,
                status: status,
            })).stringify() as Protocol.Protocol.TStringifyOutput).then(() => {
                this._logger.env(`Unbinding client ${clientId} with demand "${message.protocol}/${message.demand}" is done.`);
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
