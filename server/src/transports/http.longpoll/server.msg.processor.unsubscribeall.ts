import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import { Connection } from './server.connection';
import { MessageProcessor } from './server.msg.processor';
import { ServerState } from './server.state';

export class MessageUnsubscribeAllProcessor extends MessageProcessor<Protocol.Message.UnsubscribeAll.Request> {

    constructor(state: ServerState) {
        super('UnsubscribeAll', state);
    }

    public process(connection: Connection, message: Protocol.Message.UnsubscribeAll.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            const status: boolean | Error = this.state.processors.events.unsubscribe(
                clientId,
                message.subscription.protocol,
            );
            return connection.close((new Protocol.Message.UnsubscribeAll.Response({
                clientId: clientId,
                error: status instanceof Error ? status.message : undefined,
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
