import * as Tools from '../../platform/tools/index';
import { EventHandler } from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import { Connection } from './server.connection';
import { MessageProcessor } from './server.msg.processor';
import { ServerState } from './server.state';

export class MessagePendingProcessor extends MessageProcessor<Protocol.Message.Pending.Request> {

    public static EVENTS = {
        disconnected: Symbol(),
    };

    constructor(state: ServerState) {
        super('Pending', state);
    }

    public process(connection: Connection, message: Protocol.Message.Pending.Request): Promise<void> {
        return new Promise((resolveProcess) => {
            const clientId = message.clientId;
            connection.setClientGUID(clientId);
            connection.subscribe(Connection.EVENTS.onAborted, this._disconnected.bind(this, clientId));
            this.state.processors.connections.addPending(clientId, connection);
            resolveProcess();
        });
    }

    public drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    @EventHandler() private _disconnected(clientId: string): void {
        // Only hook processor is able to trigger disconect workflow
        this._logger.env(`Padding connection of client ${clientId} is disconnected.`);
        this.emit(MessagePendingProcessor.EVENTS.disconnected, clientId);
    }

}
