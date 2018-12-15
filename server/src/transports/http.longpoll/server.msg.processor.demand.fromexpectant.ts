import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import { Connection } from './server.connection';
import { MessageProcessor } from './server.msg.processor';
import { IScopedRespondentList } from './server.processor.demands';
import { ServerState } from './server.state';

export class MessageDemandFromExpectantProcessor extends MessageProcessor<Protocol.Message.Demand.FromExpectant.Request> {

    constructor(state: ServerState) {
        super('Demand.FromExpectant', state);
    }

    public process(connection: Connection, message: Protocol.Message.Demand.FromExpectant.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            // Setup default options
            if (message.options === undefined) {
                message.options = new Protocol.Message.Demand.Options({});
            }
            message.options.scope = message.options.scope === undefined ? Protocol.Message.Demand.Options.Scope.all : message.options.scope;
            const respondents: IScopedRespondentList | Error = this.state.processors.demands.getRespondentsForDemand(message.demand.protocol, message.demand.demand, message.query, message.options.scope);
            const demandGUID: string = Tools.guid();
            if (respondents instanceof Error) {
                // Some error with demand definition
                return connection.close((new Protocol.Message.Demand.FromExpectant.Response({
                    clientId: clientId,
                    error: respondents.message,
                    id: demandGUID,
                    state: Protocol.Message.Demand.State.ERROR,
                })).stringify()).then(() => {
                    this._logger.env(`Fail to process demand of client ${clientId} "${message.demand.protocol}/${message.demand.demand}". Error message was sent.`);
                    resolveProcess();
                }).catch((error: Error) => {
                    rejectProcess(error);
                });
            }
            if (respondents.target === null) {
                const isPending: boolean = typeof message.demand.pending === 'boolean' ? message.demand.pending : false;
                if (!isPending) {
                    // Request isn't pending and no any respondents
                    return connection.close((new Protocol.Message.Demand.FromExpectant.Response({
                        clientId: clientId,
                        id: demandGUID,
                        state: Protocol.Message.Demand.State.NO_RESPONDENTS,
                    })).stringify()).then(() => {
                        this._logger.env(`No respondents for demand of client ${clientId} "${message.demand.protocol}/${message.demand.demand}". Response was sent.`);
                        resolveProcess();
                    }).catch((error: Error) => {
                        rejectProcess(error);
                    });
                }
                // Send confirmation
                return connection.close((new Protocol.Message.Demand.FromExpectant.Response({
                    clientId: clientId,
                    id: demandGUID,
                    state: Protocol.Message.Demand.State.PENDING,
                })).stringify()).then(() => {
                    this._logger.env(`Confirmation of pendinng demand of client ${clientId} "${message.demand.protocol}/${message.demand.demand}" is sent.`);
                    // No respondents, create pending task
                    this.state.processors.demands.createPendingTask(demandGUID, {
                        body: message.demand.body,
                        demand: message.demand.demand,
                        expectantId: clientId,
                        expected: message.demand.expected,
                        options: message.options as Protocol.Message.Demand.Options,
                        protocol: message.demand.protocol,
                        query: message.query,
                        respondemtId: '',
                        sent: (new Date()).getTime(),
                    });
                    resolveProcess();
                }).catch((error: Error) => {
                    rejectProcess(error);
                });
            }
            // Send confirmation
            return connection.close((new Protocol.Message.Demand.FromExpectant.Response({
                clientId: clientId,
                id: demandGUID,
                state: Protocol.Message.Demand.State.DEMAND_SENT,
            })).stringify()).then(() => {
                this._logger.env(`Confirmation of sending demand of client ${clientId} "${message.demand.protocol}/${message.demand.demand}" is sent.`);
                if (respondents.type === Protocol.Message.Demand.Options.Scope.hosts) {
                    // Respondent is host: proceed task
                    this.state.processors.demands.proccessDemandByServer(
                        message.demand.protocol,
                        message.demand.demand,
                        message.demand.body,
                        message.demand.expected,
                        respondents.target as string,
                        clientId,
                        demandGUID,
                    );
                } else {
                    // Respondent is client: create task for sending demand
                    this.state.processors.connections.addTask(
                        () => {
                            return this.state.processors.demands.sendDemand(
                                message.demand.protocol,
                                message.demand.demand,
                                message.demand.body,
                                message.demand.expected,
                                clientId,
                                respondents.target as string,
                                demandGUID,
                            );
                        },
                        respondents.target as string,
                    );
                }
                resolveProcess();
            }).catch((error: Error) => {
                rejectProcess();
            });
        });
    }

    public drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

}
