import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import { Connection } from './server.connection';
import { MessageProcessor } from './server.msg.processor';
import { ServerState } from './server.state';

export class MessageRespondentUnbindProcessor extends MessageProcessor<Protocol.Message.Respondent.Unbind.Request> {

    constructor(state: ServerState) {
        super('Respondent.Unbind', state);
    }

    public process(connection: Connection, message: Protocol.Message.Respondent.Unbind.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            const status: boolean = this.state.processors.demands.unsubscribe(clientId, message.protocol, message.demand);
            return connection.close((new Protocol.Message.Respondent.Unbind.Response({
                clientId: clientId,
                status: status,
            })).stringify()).then(() => {
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
