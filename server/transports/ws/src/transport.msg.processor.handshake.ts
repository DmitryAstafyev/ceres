import * as TransportProtocol from './protocols/protocol.transport.ws';
import LongpollTransport from './transport';
import { Connection } from './transport.connection';
import { TransportMessageProcessor } from './transport.msg.processor';

export class MessageHandshakeProcessor extends TransportMessageProcessor<TransportProtocol.Message.Handshake.Request> {

    constructor(transport: LongpollTransport) {
        super('Handshake', transport);
    }

    public process(connection: Connection, message: TransportProtocol.Message.Handshake.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            // Always generate new client guid.
            const clientId = this.transport.generateClientGuid();
            return (this.transport.middleware as any).auth(clientId, connection).then(() => {
                // Connection is accepted
                connection.close((new TransportProtocol.Message.Handshake.Response({
                    clientId: clientId,
                    guid: message.guid,
                    token: this.transport.setClientToken(clientId),
                })).stringify()).then(() => {
                    this._logger.env(`Authorization of connection for ${clientId} is done.`);
                    resolveProcess();
                }).catch((error: Error) => {
                    rejectProcess(new Error(this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`)));
                });
            }).catch((error: Error) => {
                // Connection is rejected
                connection.close((new TransportProtocol.Message.Handshake.Response({
                    clientId: clientId,
                    error: error.message,
                    guid: message.guid,
                    reason: TransportProtocol.Message.Handshake.Response.Reasons.FAIL_AUTH,
                })).stringify()).then(() => {
                    rejectProcess(new Error(this._logger.env(`Authorization of connection for ${clientId} is failed die error: ${error.message}`)));
                }).catch((closeError: Error) => {
                    rejectProcess(new Error(this._logger.warn(`Fail to close connection ${clientId} due error: ${closeError.message}`)));
                });
            });
        });
    }

}
