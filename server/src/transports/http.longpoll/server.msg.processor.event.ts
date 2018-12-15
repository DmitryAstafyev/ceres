import * as Protocol from '../../protocols/connection/protocol.connection';
import { Connection } from './server.connection';
import { MessageProcessor } from './server.msg.processor';
import { ServerState } from './server.state';

export class MessageEventProcessor extends MessageProcessor<Protocol.Message.Event.Request> {

    constructor(state: ServerState) {
        super('Event', state);
    }

    public process(connection: Connection, message: Protocol.Message.Event.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            if (typeof message.event.protocol !== 'string' || message.event.protocol.trim() === '' ||
                typeof message.event.event !== 'string' || message.event.event.trim() === '') {
                return connection.close((new Protocol.ConnectionError({
                    message: `Expecting defined fields: protocol {string}; event {string}`,
                    reason: Protocol.ConnectionError.Reasons.NO_DATA_PROVIDED,
                })).stringify()).then(() => {
                    this._logger.env(`Fail to emit event from client ${clientId}.`);
                }).catch((error: Error) => {
                    this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
                });
            }
            let subscribers = this.state.processors.events.getSubscribers(message.event.protocol, message.event.event);
            // Check aliases
            if (message.aliases instanceof Array) {
                const targetClients = this.state.processors.connections.getClientsByAlias(message.aliases);
                subscribers = subscribers.filter((subscriberId: string) => {
                    return targetClients.indexOf(subscriberId) !== -1;
                });
            }
            // Add tasks
            subscribers.forEach((subscriberId: string) => {
                this.state.processors.connections.addTask(
                    this.state.processors.events.emit.bind(this,
                        message.event.protocol,
                        message.event.event,
                        message.event.body,
                        subscriberId,
                    ),
                    subscriberId,
                );
            });
            // Execute tasks
            this.state.processors.connections.proceedTasks();
            return connection.close((new Protocol.Message.Event.Response({
                clientId: clientId,
                subscribers: subscribers.length,
            })).stringify()).then(() => {
                this._logger.env(`Emit event from client ${clientId} for event protocol ${message.event.protocol}, event ${message.event.event} is done for ${subscribers.length} subscribers.`);
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
