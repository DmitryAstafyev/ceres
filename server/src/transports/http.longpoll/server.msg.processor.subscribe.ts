import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import { Connection } from './server.connection';
import { MessageProcessor } from './server.msg.processor';
import { ServerState } from './server.state';

export class MessageSubscribeProcessor extends MessageProcessor<Protocol.Message.Subscribe.Request> {

    constructor(state: ServerState) {
        super('Subscribe', state);
    }

    public process(connection: Connection, message: Protocol.Message.Subscribe.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            const status: boolean | Error = this.state.processors.events.subscribe(
                clientId,
                message.subscription.protocol as string,
                message.subscription.event as string,
            );
            return connection.close((new Protocol.Message.Subscribe.Response({
                clientId: clientId,
                error: status instanceof Error ? status.message : undefined,
                status: status instanceof Error ? false : status,
            })).stringify()).then(() => {
                this._logger.env(`Subscription for client ${clientId} to protocol ${message.subscription.protocol}, event ${message.subscription.event} is done.`);
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
