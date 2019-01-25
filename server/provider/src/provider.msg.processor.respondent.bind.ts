import * as Protocol from './protocols/connection/protocol.connection';
import { MessageProcessor } from './provider.msg.processor';
import { ProviderState } from './provider.state';
import { TSender } from './transports/transport.abstract';

export class MessageRespondentBindProcessor extends MessageProcessor<Protocol.Message.Respondent.Bind.Request> {

    constructor(state: ProviderState) {
        super('Respondent.Bind', state);
    }

    public process(sender: TSender, message: Protocol.Message.Respondent.Bind.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            let status: boolean | Error = false;
            if (message.query instanceof Array) {
                if (message.query.length > 0) {
                    status = this.state.demands.subscribe(message.protocol, message.demand, clientId, message.query);
                }
            }
            return sender((new Protocol.Message.Respondent.Bind.Response({
                clientId: clientId,
                error: status instanceof Error ? status.message : undefined,
                guid: message.guid,
                status: status instanceof Error ? false : true,
            })).stringify()).then(() => {
                this._logger.env(`Binding client ${clientId} with demand "${message.protocol}/${message.demand}" with query as "${message.query.map((alias: Protocol.KeyValue) => {
                    return `${alias.key}: ${alias.value}`;
                }).join(', ')}" is done.`);
                this.state.demands.checkPendingRespondent();
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
