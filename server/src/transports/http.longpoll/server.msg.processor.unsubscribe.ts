import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import { Connection } from './server.connection';
import { MessageProcessor } from './server.msg.processor';
import { ServerState } from './server.state';

export class MessageUnsubscribeProcessor extends MessageProcessor<Protocol.Message.Unsubscribe.Request> {

    constructor(state: ServerState) {
        super('Unsubscribe', state);
    }

    public process(connection: Connection, message: Protocol.Message.Unsubscribe.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            const status: boolean | Error = this.state.processors.events.unsubscribe(
                clientId,
                message.subscription.protocol as string,
                message.subscription.event as string,
            );
            return connection.close((new Protocol.Message.Unsubscribe.Response({
                clientId: clientId,
                error: status instanceof Error ? status.message : undefined,
                status: status instanceof Error ? false : status,
            })).stringify()).then(() => {
                this._logger.env(`Unsubscription for client ${clientId} to protocol ${message.subscription.protocol}, event ${message.subscription.event} is done.`);
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
