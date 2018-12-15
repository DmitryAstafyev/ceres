import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import { Connection } from './server.connection';
import { MessageProcessor } from './server.msg.processor';
import { TPendingDemand } from './server.processor.demands';
import { ServerState } from './server.state';

export class MessageDemandFromRespondentProcessor extends MessageProcessor<Protocol.Message.Demand.FromRespondent.Request> {

    constructor(state: ServerState) {
        super('Demand.FromRespondent', state);
    }

    public process(connection: Connection, message: Protocol.Message.Demand.FromRespondent.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            // Try to find data in pending tasks
            const pendingDemand: TPendingDemand | undefined = this.state.processors.demands.getPendingResults(message.id);
            if (typeof pendingDemand === 'undefined') {
                // Already nobody expects an answer
                return connection.close((new Protocol.Message.Demand.FromRespondent.Response({
                    clientId: clientId,
                    error: `No expectants are found`,
                    status: false,
                })).stringify()).then(() => {
                    this._logger.env(`No expectants for demand are found. Responend ${clientId}. Response was sent.`);
                }).catch((error: Error) => {
                    this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
                });
            }
            // Expectant is found
            if (message.error !== void 0 && message.error !== '') {
                // Some error during proccessing demand
                // Create task for sending demand's error
                this.state.processors.connections.addTask(
                    this.state.processors.demands.sendDemandResponse.bind(this,
                        pendingDemand.protocol,
                        pendingDemand.demand,
                        '',
                        pendingDemand.expected,
                        pendingDemand.expectantId,
                        message.error,
                        message.id,
                    ),
                    pendingDemand.expectantId,
                );
            }
            if (message.error === '' && message.demand !== void 0) {
                // Demand proccessed successfully
                // Create task for sending demand's response
                this.state.processors.connections.addTask(
                    () => {
                        return this.state.processors.demands.sendDemandResponse(
                            (message.demand as Protocol.DemandDefinition).protocol,
                            (message.demand as Protocol.DemandDefinition).demand,
                            (message.demand as Protocol.DemandDefinition).body,
                            (message.demand as Protocol.DemandDefinition).expected,
                            pendingDemand.expectantId,
                            '',
                            message.id,
                        );
                    },
                    pendingDemand.expectantId,
                );
            }
            return connection.close((new Protocol.Message.Demand.FromRespondent.Response({
                clientId: clientId,
                status: true,
            })).stringify()).then(() => {
                this._logger.env(`Confirmation of sending demand's response sent Responend ${clientId}.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        });
    }

    public drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

}
