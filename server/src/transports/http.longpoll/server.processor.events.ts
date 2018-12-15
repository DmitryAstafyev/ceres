import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import { ServerState } from './server.state';

export class ProcessorEvents {

    public subscriptions: Tools.SubscriptionsHolder = new Tools.SubscriptionsHolder();

    private state: ServerState;
    private _logger: Tools.Logger = new Tools.Logger(`ProcessorEvents`);

    constructor(state: ServerState) {
        this.state = state;
    }

    public emit(
        protocol: string,
        event: string,
        body: string,
        clientId: string,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const connection = this.state.processors.connections.getPending(clientId);
            if (connection === null) {
                return reject(new Error(
                    this._logger.env(`Client (${clientId}) is subscribed on "${protocol}/${event}", but active connection wasn't found. Task will stay in a queue.`),
                ));
            }
            this._logger.env(`Client (${clientId}) is subscribed on "${protocol}/${event}". Event will be sent.`);
            connection.close((new Protocol.Message.Pending.Response({
                clientId: clientId,
                event: new Protocol.EventDefinition({
                    body: body,
                    event: event,
                    protocol: protocol,
                }),
            })).stringify()).then(() => {
                this._logger.env(`Emit event for client ${clientId}: protocol ${protocol}, event ${event} is done.`);
                resolve();
            }).catch((error: Error) => {
                this._logger.warn(`Fail to emit event for client ${clientId}: protocol ${protocol}, event ${event} due error: ${error.message}.`);
                reject();
            });
        });
    }

    public subscribe(clientId: string, protocol: string, event: string): boolean | Error {
        if (Tools.getTypeOf(protocol) !== Tools.EPrimitiveTypes.string || protocol.trim() === '') {
            return new Error(`prototype should be a string`);
        }
        if (Tools.getTypeOf(event) !== Tools.EPrimitiveTypes.string || event.trim() === '') {
            return new Error(`event should be a string`);
        }
        if (Tools.getTypeOf(clientId) !== Tools.EPrimitiveTypes.string || clientId.trim() === '') {
            return new Error(`clientId should be a string`);
        }
        return this.subscriptions.subscribe(protocol, event, clientId);
    }

    public unsubscribe(clientId: string, protocol: string, event?: string): boolean | Error {
        if (Tools.getTypeOf(protocol) !== Tools.EPrimitiveTypes.string || protocol.trim() === '') {
            return new Error(`prototype should be a string`);
        }
        if (typeof event === 'string' && event.trim() === '') {
            return new Error(`event should be a not empty string`);
        }
        if (Tools.getTypeOf(clientId) !== Tools.EPrimitiveTypes.string || clientId.trim() === '') {
            return new Error(`clientId should be a string`);
        }
        return this.subscriptions.unsubscribe(clientId, protocol, event);
    }

    public getSubscribers(protocol: string, event: string): string[] {
        return this.subscriptions.get(protocol, event);
    }

    public disconnect(clientId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscriptions.removeClient(clientId);
            resolve();
        });
    }

    public drop() {
        this.subscriptions.clear();
    }

    public getInfo() {
        return this.subscriptions.getInfo();
    }
}
