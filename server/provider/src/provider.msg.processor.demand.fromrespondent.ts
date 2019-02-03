import * as Protocol from './protocols/connection/protocol.connection';
import { MessageProcessor } from './provider.msg.processor';
import { TPendingDemand } from './provider.processor.demands';
import { ProviderState } from './provider.state';
import { TSender } from './transports/transport.abstract';

export class MessageDemandFromRespondentProcessor extends MessageProcessor<Protocol.Message.Demand.FromRespondent.Request> {

    constructor(state: ProviderState) {
        super('Demand.FromRespondent', state);
    }

    public process(sender: TSender, message: Protocol.Message.Demand.FromRespondent.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            // Try to find data in pending tasks
            const pendingDemand: TPendingDemand | undefined = this.state.demands.getPendingResults(message.id);
            if (typeof pendingDemand === 'undefined') {
                // Already nobody expects an answer
                return sender((new Protocol.Message.Demand.FromRespondent.Response({
                    clientId: clientId,
                    error: `No expectants are found`,
                    guid: message.guid,
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
                this.state.tasks.add(
                    () => {
                        return this.state.demands.sendDemandResponse(
                            pendingDemand.protocol,
                            pendingDemand.demand,
                            '',
                            pendingDemand.expected,
                            pendingDemand.expectantId,
                            message.error as string,
                            message.id,
                        );
                    },
                    pendingDemand.expectantId,
                );
            }
            if (message.error === '' && message.demand !== void 0) {
                // Demand proccessed successfully
                // Create task for sending demand's response
                this.state.tasks.add(
                    () => {
                        return this.state.demands.sendDemandResponse(
                            (message.demand as Protocol.DemandDefinition).protocol,
                            (message.demand as Protocol.DemandDefinition).demand,
                            (message.demand as Protocol.DemandDefinition).bodyStr === '' ? new Uint8Array((message.demand as Protocol.DemandDefinition).bodyBinary) : (message.demand as Protocol.DemandDefinition).bodyStr,
                            (message.demand as Protocol.DemandDefinition).expected,
                            pendingDemand.expectantId,
                            '',
                            message.id,
                        );
                    },
                    pendingDemand.expectantId,
                );
            }
            return sender((new Protocol.Message.Demand.FromRespondent.Response({
                clientId: clientId,
                guid: message.guid,
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
