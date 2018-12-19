import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import { ServerState } from './server.state';

export type TPendingDemand = {
    body?: string;
    respondemtId: string,
    protocol: string,
    demand: string,
    expected: string,
    expectantId: string,
    sent: number,
    options?: Protocol.Message.Demand.Options,
    query?: Protocol.KeyValue[],
};

export interface IScopedRespondentList {
    hosts: string[];
    clients: string[];
    all: string[];
    target: string | null;
    type: Protocol.Message.Demand.Options.Scope | null;
}

export type TQuery = { [key: string]: string };

export type THandler = (...args: any[]) => any;

export class ProcessorDemands {

    private state: ServerState;
    private demands: Tools.DemandsHolder;
    private pendingDemandRespondent: Map<string, TPendingDemand>;
    private pendingDemandResults: Map<string, TPendingDemand>;
    private serverDemandsHanlders: Map<string, THandler>;
    private _logger: Tools.Logger = new Tools.Logger(`ProcessorDemands`);

    constructor(state: ServerState) {
        this.state = state;
        this.demands = new Tools.DemandsHolder();
        this.pendingDemandRespondent = new Map();
        this.pendingDemandResults = new Map();
        this.serverDemandsHanlders = new Map();
    }

    public checkPendingRespondent(): void {
        this.pendingDemandRespondent.forEach((pending: TPendingDemand, demandGUID: string) => {
            if (pending.options === undefined || pending.options.scope === undefined) {
                return;
            }
            const respondents: IScopedRespondentList | Error = this.getRespondentsForDemand(
                pending.protocol,
                pending.demand,
                pending.query as Protocol.KeyValue[],
                pending.options.scope);

            if (respondents instanceof Error) {
                return;
            }
            if (respondents.target === null) {
                return;
            }
            this._logger.env(`Respondennt of "${pending.protocol}/${pending.demand}" is registred. Demand for client ${pending.expectantId} will be requested.`);
            if (respondents.type === Protocol.Message.Demand.Options.Scope.hosts) {
                // Respondent is host: proceed task
                this.proccessDemandByServer(
                    pending.protocol,
                    pending.demand,
                    pending.body as string,
                    pending.expected,
                    respondents.target as string,
                    pending.expectantId,
                    demandGUID,
                ).catch((error: Error) => {
                    this._logger.warn(`Fail to proccess server's demand due error: ${error.message}`);
                });
            } else {
                // Create task for sending demand
                this.state.processors.connections.addTask(
                    this.sendDemand.bind(this,
                        pending.protocol,
                        pending.demand,
                        pending.body as string,
                        pending.expected,
                        pending.expectantId,
                        respondents.target,
                        demandGUID,
                    ),
                    respondents.target,
                );
            }
        });
    }

    public getRespondentsForDemand(protocol: string, demand: string, query: any[], scope: Protocol.Message.Demand.Options.Scope): IScopedRespondentList | Error {
        const result: IScopedRespondentList = {
            all: [],
            clients: [],
            hosts: [],
            target: null,
            type: null,
        };
        const respondents: string[] | Error = this.demands.get(protocol, demand, query);
        if (respondents instanceof Error) {
            return respondents;
        }
        result.all = respondents;
        respondents.forEach((clientId: string) => {
            if (this.serverDemandsHanlders.has(clientId)) {
                // Server's handler
                result.hosts.push(clientId);
            } else {
                // Client's handler
                result.clients.push(clientId);
            }
        });
        switch (scope) {
            case Protocol.Message.Demand.Options.Scope.hosts:
                result.target = result.hosts.length > 0 ? result.hosts[0] : null;
                result.type = Protocol.Message.Demand.Options.Scope.hosts;
                break;
            case Protocol.Message.Demand.Options.Scope.clients:
                result.target = result.clients.length > 0 ? result.clients[0] : null;
                result.type = Protocol.Message.Demand.Options.Scope.clients;
                break;
            case Protocol.Message.Demand.Options.Scope.all:
                result.target = result.all.length > 0 ? result.all[0] : null;
                result.type = this.serverDemandsHanlders.has(result.target as string) ? result.type = Protocol.Message.Demand.Options.Scope.hosts : Protocol.Message.Demand.Options.Scope.clients;
                break;
        }
        return result;
    }

    public sendDemand(
        protocol: string,
        demand: string,
        body: string,
        expected: string,
        expectantId: string,
        respondentId: string,
        demandGUID: string,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const connection = this.state.processors.connections.getPending(respondentId);
            if (connection === null) {
                return reject(new Error(
                    this._logger.env(`Client (${respondentId}) is subscribed as respondent on "${protocol}/${demand}", but active connection wasn't found. Task will stay in a queue.`),
                ));
            }
            this._logger.env(`Client (${respondentId}) is subscribed as respondent on  "${protocol}/${demand}". Demand will be sent.`);
            // Remove pending demand info
            this.pendingDemandRespondent.delete(demandGUID);
            // Register demand results if expectant still connected
            if (this.state.processors.connections.isConnected(expectantId)) {
                this.pendingDemandResults.set(demandGUID, {
                    demand: demand,
                    expectantId: expectantId,
                    expected: expected,
                    protocol: protocol,
                    respondemtId: respondentId,
                    sent: (new Date()).getTime(),
                });
            }
            connection.close((new Protocol.Message.Demand.Pending.Response({
                clientId: respondentId,
                demand: new Protocol.DemandDefinition({
                    body: body,
                    demand: demand,
                    expected: expected,
                    id: demandGUID,
                    protocol: protocol,
                }),
            })).stringify()).then(() => {
                this._logger.env(`Demand to client ${respondentId}: protocol ${protocol}, demand ${demand} was sent.`);
                resolve();
            }).catch((error: Error) => {
                // TODO: expectant still waiting for response
                this._logger.warn(`Fail to demand to client ${respondentId}: protocol ${protocol}, demand ${demand} due error: ${error.message}.`);
                reject();
            });
        });
    }

    public sendDemandResponse(
        protocol: string,
        demand: string,
        body: string,
        expected: string,
        expectantId: string,
        error: string,
        demandRequestId: string,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const connection = this.state.processors.connections.getPending(expectantId);
            if (connection === null) {
                return reject(new Error(
                    this._logger.env(`Client (${expectantId}) is waiting for response on "${protocol}/${demand}", but active connection wasn't found. Task will stay in a queue.`),
                ));
            }
            this._logger.env(`Client (${expectantId}) is waiting for response on  "${protocol}/${demand}". Response will be sent.`);
            connection.close((new Protocol.Message.Pending.Response({
                clientId: expectantId,
                return: new Protocol.DemandDefinition({
                    body: body,
                    demand: demand,
                    error: error,
                    expected: expected,
                    id: demandRequestId,
                    protocol: protocol,
                }),
            })).stringify()).then(() => {
                this._logger.env(`Response on demand to client ${expectantId}: protocol ${protocol}, demand ${demand} was sent.`);
                this.pendingDemandRespondent.delete(demandRequestId);
                this.pendingDemandResults.delete(demandRequestId);
                resolve();
            }).catch((errorSending: Error) => {
                this._logger.warn(`Fail to send response on demand to client ${expectantId}: protocol ${protocol}, demand ${demand} due error: ${errorSending.message}.`);
                reject();
            });
        });
    }

    public getResponseOfDemandByServer(
        protocol: string,
        demand: string,
        body: string,
        expected: string,
        respondentId: string,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            this.state.protocols.parse(protocol, body).then((demandImpl: Protocol.IImplementation) => {
                if (demandImpl.getSignature() !== demand) {
                    return reject(new Error(this._logger.env(`Implementation demand mismatch with demand name in request. Implemented: "${demandImpl.getSignature()}"; defined in request: ${demand}.`)));
                }
                const handler = this.serverDemandsHanlders.get(respondentId);
                if (handler === undefined) {
                    return reject(new Error(this._logger.warn(`Cannot find server's hander for demand: "${protocol}" / "${demand}".`)));
                }
                handler(demandImpl, (error: Error | null, results: any) => {
                    if (error instanceof Error) {
                        return reject(error);
                    }
                    if (typeof results !== 'object' || results === null) {
                        return reject(new Error(this._logger.env(`Expected results of demand will be an object.`)));
                    }
                    if (typeof results.getSignature !== 'function' || typeof results.stringify !== 'function') {
                        return reject(new Error(this._logger.env(`Expected results will be an instance of protocol implementation.`)));
                    }
                    if (results.getSignature() !== expected) {
                        return reject(new Error(this._logger.env(`Expected results as implementation of ${expected}, but gotten ${results.getSignature()}.`)));
                    }
                    resolve(results.stringify());
                });
            }).catch((error: Error) => {
                this._logger.warn(`Fail to parse body "${body}" of protocol "${protocol}" due error: ${error.message}`);
                reject(error);
            });
        });
    }

    public proccessDemandByServer(
        protocol: string,
        demand: string,
        body: string,
        expected: string,
        respondentId: string,
        expectantId: string,
        demandGUID: string,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            this.getResponseOfDemandByServer(
                protocol,
                demand,
                body,
                expected,
                respondentId,
            ).then((response: string) => {
                this.state.processors.connections.addTask(
                    this.sendDemandResponse.bind(this,
                        protocol,
                        demand,
                        response,
                        expected,
                        expectantId,
                        '',
                        demandGUID,
                    ),
                    respondentId,
                );
                resolve();
            }).catch((processingError: Error) => {
                this.state.processors.connections.addTask(
                    this.sendDemandResponse.bind(this,
                        protocol,
                        demand,
                        '',
                        expected,
                        expectantId,
                        processingError.message,
                        demandGUID,
                    ),
                    respondentId,
                );
                resolve();
            });
        });
    }

    public createPendingTask(demandGUID: string, pendingTask: TPendingDemand) {
        this.pendingDemandRespondent.set(demandGUID, pendingTask);
    }

    public getPendingResults(demandGUID: string): TPendingDemand | undefined {
        return this.pendingDemandResults.get(demandGUID);
    }

    public subscribe(protocolSignature: string, demandSignature: string, guid: string, query: TQuery | Protocol.KeyValue[]): boolean | Error {
        let convertedQuery: TQuery = {};
        if (query instanceof Array) {
            query.forEach((pair: Protocol.KeyValue) => {
                convertedQuery[pair.key] = pair.value;
            });
        } else {
            convertedQuery = query;
        }
        return this.demands.subscribe(protocolSignature, demandSignature, guid, convertedQuery);
    }

    public unsubscribe(clientId: string, protocolSignature: string, demandSignature: string): boolean {
        return this.demands.unsubscribe(clientId, protocolSignature, demandSignature);
    }

    public refServerHandler(guid: string, handler: THandler): void {
        this.serverDemandsHanlders.set(guid, handler);
    }

    public unrefServerHandler(guid: string): void {
        this.serverDemandsHanlders.delete(guid);
    }

    public getSubscriptions(protocolSignature: string, demandSignature: string): string[] | Error {
        return this.demands.getAll(protocolSignature, demandSignature);
    }

    public getInfo(): string {
        return `\n\tpending demands: ${this.pendingDemandRespondent.size}\n\tpending demand results: ${this.pendingDemandResults.size}.`;
    }

    public disconnect(clientId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.demands.removeClient(clientId);
            this.pendingDemandRespondent.forEach((demand: TPendingDemand, demandGUID: string) => {
                if (demand.expectantId === clientId || demand.respondemtId === clientId) {
                    this.pendingDemandRespondent.delete(demandGUID);
                }
            });
            this.pendingDemandResults.forEach((demand: TPendingDemand, demandGUID: string) => {
                if (demand.expectantId === clientId || demand.respondemtId === clientId) {
                    this.pendingDemandResults.delete(demandGUID);
                }
            });
            resolve();
        });
    }

    public drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.demands.clear();
            this.pendingDemandRespondent.clear();
            this.pendingDemandResults.clear();
            this.serverDemandsHanlders.clear();
            resolve();
        });
    }

}
