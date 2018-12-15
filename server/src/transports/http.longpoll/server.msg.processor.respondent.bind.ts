import * as Protocol from '../../protocols/connection/protocol.connection';
import { Connection } from './server.connection';
import { MessageProcessor } from './server.msg.processor';
import { ServerState } from './server.state';

export class MessageRespondentBindProcessor extends MessageProcessor<Protocol.Message.Respondent.Bind.Request> {

    constructor(state: ServerState) {
        super('Respondent.Bind', state);
    }

    public process(connection: Connection, message: Protocol.Message.Respondent.Bind.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            let status: boolean | Error = false;
            if (message.query instanceof Array) {
                if (message.query.length > 0) {
                    status = this.state.processors.demands.subscribe(message.protocol, message.demand, clientId, message.query);
                }
            }
            return connection.close((new Protocol.Message.Respondent.Bind.Response({
                clientId: clientId,
                error: status instanceof Error ? status.message : undefined,
                status: status instanceof Error ? false : true,
            })).stringify()).then(() => {
                this._logger.env(`Binding client ${clientId} with demand "${message.protocol}/${message.demand}" with query as "${message.query.map((alias: Protocol.KeyValue) => {
                    return `${alias.key}: ${alias.value}`;
                }).join(', ')}" is done.`);
                this.state.processors.demands.checkPendingRespondent();
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
