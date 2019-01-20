import * as Tools from './platform/tools/index';
import * as Protocol from './protocols/connection/protocol.connection';
import { isInclude as isAliasInclude, TAlias } from './provider.aliases';
import { THandler } from './provider.processor.demands';
import { ProviderState } from './provider.state';

type TProtocol = string;

const EventHandlerIdProp = '__EventHandlerIdProp';

export class ProcessorEvents {

    private subscriptions: Tools.SubscriptionsHolder = new Tools.SubscriptionsHolder();
    private handlers: Map<TProtocol, Tools.HandlersHolder> = new Map();
    private alias: TAlias = {};
    private state: ProviderState;
    private _logger: Tools.Logger = new Tools.Logger(`ProcessorEvents`);

    constructor(state: ProviderState) {
        this.state = state;
    }

    public emitAll(protocolSignature: string, eventSignature: string, body: string, options: Protocol.Message.Event.Options, aliases?: Protocol.KeyValue[]): Promise<number> {
        return new Promise((resolve, reject) => {
            if (options.scope === Protocol.Message.Event.Options.Scope.all) {
                Promise.all([
                    this._emitClients(protocolSignature, eventSignature, body, options, aliases),
                    this._emitServer(protocolSignature, eventSignature, body, options, aliases),
                ]).then((counts: number[]) => {
                    resolve(counts[0] + counts[1]);
                }).catch((error: Error) => {
                    reject(error);
                });
            } else if (options.scope === Protocol.Message.Event.Options.Scope.clients) {
                this._emitClients(protocolSignature, eventSignature, body, options, aliases).then(resolve).catch(reject);
            } else if (options.scope === Protocol.Message.Event.Options.Scope.hosts) {
                this._emitServer(protocolSignature, eventSignature, body, options, aliases).then(resolve).catch(reject);
            }
        });
    }

    public emit(
        protocol: string,
        event: string,
        body: string,
        clientId: string,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.state.transport.isAvailable(clientId)) {
                return reject(new Error(
                    this._logger.env(`Client (${clientId}) is subscribed on "${protocol}/${event}", but active connection wasn't found. Task will stay in a queue.`),
                ));
            }
            this._logger.env(`Client (${clientId}) is subscribed on "${protocol}/${event}". Event will be sent.`);
            this.state.transport.send(clientId, (new Protocol.Message.ToConsumer({
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

    public subscribeHandler(protocol: string, event: string, handler: THandler): boolean | Error {
        let events: Tools.HandlersHolder | undefined = this.handlers.get(protocol);
        if (events === undefined) {
            events = new Tools.HandlersHolder();
        }
        if ((handler as any)[EventHandlerIdProp] !== void 0) {
            return new Error(`Fail to subscribe event handler, because handler is already subscribed.`);
        }
        const guid: string = Tools.guid();
        (handler as any)[EventHandlerIdProp] = guid;
        events.add(event, guid, handler);
        this.handlers.set(protocol, events);
        return true;
    }

    public unsubscribeHandler(protocol: string, event?: string, handler?: THandler): void {
        const events: Tools.HandlersHolder | undefined = this.handlers.get(protocol);
        if (events === undefined) {
            return;
        }
        if (event === undefined) {
            this.handlers.delete(protocol);
            return;
        }
        if (handler === undefined || handler === null || (handler as any)[EventHandlerIdProp] === undefined) {
            events.remove(event);
            this.handlers.set(protocol, events);
            return;
        }
        const guid: string = (handler as any)[EventHandlerIdProp];
        if (typeof guid !== 'string') {
            return;
        }
        events.remove(event, guid);
        this.handlers.set(protocol, events);
    }

    public refAlias(alias: TAlias): Error | void {
        let valid: boolean = true;
        Object.keys(alias).forEach((key: string) => {
            if (typeof alias[key] !== 'string') {
                valid = false;
            }
            if (!valid) {
                return;
            }
        });
        if (!valid) {
            return new Error(`As aliases can be used only object { [key: string]: string }. Some of values of target isn't a {string}.`);
        }
        this.alias = alias;
    }

    public unrefAlias(): void {
        this.alias = {};
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

    private _emitClients(protocolSignature: string, eventSignature: string, body: string, options: Protocol.Message.Event.Options, aliases?: Protocol.KeyValue[]): Promise<number> {
        return new Promise((resolve) => {
            let subscribers = this.state.events.getSubscribers(protocolSignature, eventSignature);
            // Check aliases
            if (aliases instanceof Array) {
                const targetClients = this.state.getClientsByAlias(aliases);
                subscribers = subscribers.filter((subscriberId: string) => {
                    return targetClients.indexOf(subscriberId) !== -1;
                });
            }
            // Add tasks
            subscribers.forEach((subscriberId: string) => {
                this.state.tasks.add(
                    this.emit.bind(this,
                        protocolSignature,
                        eventSignature,
                        body,
                        subscriberId,
                    ),
                    subscriberId,
                );
            });
            // Execute tasks
            this.state.tasks.proceed();
            resolve(subscribers.length);
        });
    }

    private _emitServer(protocolSignature: string, eventSignature: string, body: string, options: Protocol.Message.Event.Options, aliases?: Protocol.KeyValue[]): Promise<number> {
        return new Promise((resolve, reject) => {
            // Check server alias
            if (aliases instanceof Array && !isAliasInclude(this.alias, aliases)) {
                return resolve(0);
            }
            // Get server subscriptions
            const serverEventsHandlers: Tools.HandlersHolder | undefined = this.handlers.get(protocolSignature);
            if (serverEventsHandlers === undefined) {
                return resolve(0);
            }
            const handlers = serverEventsHandlers.get(eventSignature);
            if (!(handlers instanceof Map)) {
                return resolve(0);
            }
            // Note: in any case we resolve it, because to keep server stable
            this.state.protocols.parse(protocolSignature, body).then((eventImpl: any) => {
                handlers.forEach((handler: THandler) => {
                    try {
                        handler(eventImpl);
                    } catch (executeError) {
                        this._logger.error(`Error during executing event's handler (${protocolSignature}/${eventSignature}). \nEvent: ${body}. \nError: ${executeError.message}`);
                    }
                });
                resolve(handlers.size);
            }).catch((parsingError: Error) => {
                this._logger.error(`Error during parsing event's body (${protocolSignature}/${eventSignature}). \nEvent: ${body}. \nError: ${parsingError.message}`);
                resolve(0);
            });
        });
    }
}
