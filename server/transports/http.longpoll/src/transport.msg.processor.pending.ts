import { Tools } from 'ceres.server.provider';
import * as TransportProtocol from './protocols/protocol.transport.longpoll';
import LongpollTransport from './transport';
import { Connection } from './transport.connection';
import { TransportMessageProcessor } from './transport.msg.processor';

export class MessagePendingProcessor extends TransportMessageProcessor<TransportProtocol.Message.Pending.Request> {

    public static EVENTS = {
        disconnected: Symbol(),
    };

    constructor(transport: LongpollTransport) {
        super('Pending', transport);
    }

    public process(connection: Connection, message: TransportProtocol.Message.Pending.Request): Promise<void> {
        return new Promise((resolveProcess) => {
            const clientId = message.clientId;
            connection.setClientGUID(clientId);
            connection.subscribe(Connection.EVENTS.onAborted, this._disconnected.bind(this, clientId));
            this.transport.connections.addPending(clientId, connection);
            resolveProcess();
        });
    }

    public drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    @Tools.EventHandler() private _disconnected(clientId: string): void {
        // Only hook processor is able to trigger disconect workflow
        this._logger.env(`Padding connection of client ${clientId} is disconnected.`);
        this.emit(MessagePendingProcessor.EVENTS.disconnected, clientId);
    }

}
