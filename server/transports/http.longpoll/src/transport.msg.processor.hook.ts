import { Tools } from 'ceres.server.provider';
import * as TransportProtocol from './protocols/protocol.transport.longpoll';
import LongpollTransport from './transport';
import { Connection } from './transport.connection';
import { TransportMessageProcessor } from './transport.msg.processor';

export class MessageHookProcessor extends TransportMessageProcessor<TransportProtocol.Message.Hook.Request> {

    public static EVENTS = {
        disconnected: Symbol(),
    };

    constructor(transport: LongpollTransport) {
        super('Hook', transport);
    }

    public process(connection: Connection, message: TransportProtocol.Message.Hook.Request): Promise<void> {
        return new Promise((resolveProcess) => {
            const clientId = message.clientId;
            connection.setClientGUID(clientId);
            connection.subscribe(Connection.EVENTS.onAborted, this._disconnected.bind(this, clientId));
            this.transport.connections.addHook(clientId, connection);
            resolveProcess();
        });
    }

    public drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    @Tools.EventHandler() private _disconnected(clientId: string): void {
        this.transport.connections.disconnect(clientId).then(() => {
            this._logger.env(`client ${clientId} is disconnected.`);
            this.emit(MessageHookProcessor.EVENTS.disconnected, clientId);
        }).catch((error: Error) => {
            this._logger.error(`error during disconnecting client ${clientId}: ${error.message}`);
        });
    }

}
