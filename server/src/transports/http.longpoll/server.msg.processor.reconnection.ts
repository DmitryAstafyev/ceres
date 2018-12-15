import * as Protocol from '../../protocols/connection/protocol.connection';
import { Connection } from './server.connection';
import { MessageProcessor } from './server.msg.processor';
import { ServerState } from './server.state';

export class MessageReconnectionProcessor extends MessageProcessor<Protocol.Message.Reconnection.Request> {

    constructor(state: ServerState) {
        super('Reconnection', state);
    }

    public process(connection: Connection, message: Protocol.Message.Reconnection.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            return connection.close((new Protocol.Message.Reconnection.Response({
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
