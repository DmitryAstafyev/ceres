import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import { Connection } from './server.connection';
import { MessageProcessor } from './server.msg.processor';
import { ServerState } from './server.state';

export class MessageHandshakeProcessor extends MessageProcessor<Protocol.Message.Handshake.Request> {

    constructor(state: ServerState) {
        super('Handshake', state);
    }

    public process(connection: Connection, message: Protocol.Message.Handshake.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            return this.state.middleware.auth(clientId, connection).then(() => {
                // Connection is accepted
                connection.close((new Protocol.Message.Handshake.Response({
                    clientId: clientId,
                    token: this.state.tokens.set(clientId),
                })).stringify()).then(() => {
                    this._logger.env(`Authorization of connection for ${clientId} is done.`);
                    resolveProcess();
                }).catch((error: Error) => {
                    rejectProcess(new Error(this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`)));
                });
            }).catch((error: Error) => {
                // Connection is rejected
                connection.close((new Protocol.Message.Handshake.Response({
                    clientId: clientId,
                    error: error.message,
                    reason: Protocol.Message.Handshake.Response.Reasons.FAIL_AUTH,
                })).stringify()).then(() => {
                    rejectProcess(new Error(this._logger.env(`Authorization of connection for ${clientId} is failed die error: ${error.message}`)));
                }).catch((closeError: Error) => {
                    rejectProcess(new Error(this._logger.warn(`Fail to close connection ${clientId} due error: ${closeError.message}`)));
                });
            });
        });
    }

    public getClientToken(clientId: string): string | null {
        return this.state.tokens.get(clientId);
    }

    public drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

}
