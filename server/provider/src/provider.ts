
import * as Tools from './platform/tools/index';
import * as Protocol from './protocols/connection/protocol.connection';
import { TAlias } from './provider.aliases';
import { MessageDemandFromExpectantProcessor } from './provider.msg.processor.demand.fromexpectant';
import { MessageDemandFromRespondentProcessor } from './provider.msg.processor.demand.fromrespondent';
import { MessageEventProcessor } from './provider.msg.processor.event';
import { MessageReconnectionProcessor } from './provider.msg.processor.reconnection';
import { MessageRegistrationProcessor } from './provider.msg.processor.registration';
import { MessageRespondentBindProcessor } from './provider.msg.processor.respondent.bind';
import { MessageRespondentUnbindProcessor } from './provider.msg.processor.respondent.unbind';
import { MessageSubscribeProcessor } from './provider.msg.processor.subscribe';
import { MessageUnsubscribeProcessor } from './provider.msg.processor.unsubscribe';
import { MessageUnsubscribeAllProcessor } from './provider.msg.processor.unsubscribeall';
import { THandler, TQuery } from './provider.processor.demands';
import { ProviderState } from './provider.state';
import { TSender } from './transports/transport.abstract';

import ATransport from './transports/transport.abstract';
import { TClientRequests } from './transports/transport.abstract';

export { Tools, Protocol, ATransport, TClientRequests, THandler, TQuery, ProviderState, TSender, TAlias };

const ServerDemandHandlerSignature: string = '__ServerDemandHandlerSignature';
const ServerEventHandlerSignature: string = '__ServerEventHandlerSignature';

export default class Provider {
    public static Events = {
        connected: 'connected',
        disconnected: 'disconnected',
    };

    private _logger: Tools.Logger = new Tools.Logger('Provider');
    private _emitter: Tools.EventEmitter = new Tools.EventEmitter();
    private _messageEventProcessor: MessageEventProcessor;
    private _messageReconnectionProcessor: MessageReconnectionProcessor;
    private _messageRegistrationProcessor: MessageRegistrationProcessor;
    private _messageSubscribeProcessor: MessageSubscribeProcessor;
    private _messageUnsubscribeProcessor: MessageUnsubscribeProcessor;
    private _messageUnsubscribeAllProcessor: MessageUnsubscribeAllProcessor;
    private _messageRespondentBindProcessor: MessageRespondentBindProcessor;
    private _messageRespondentUnbindProcessor: MessageRespondentUnbindProcessor;
    private _messageDemandFromExpectantProcessor: MessageDemandFromExpectantProcessor;
    private _messageDemandFromRespondentProcessor: MessageDemandFromRespondentProcessor;
    private _state: ProviderState;

    constructor(transport: ATransport<any, any>) {
        // TODO: Connected type definition should be removed

        // Create server state
        this._state = new ProviderState(transport);
        // Create processors of messages
        this._messageEventProcessor = new MessageEventProcessor(this._state);
        this._messageReconnectionProcessor = new MessageReconnectionProcessor(this._state);
        this._messageRegistrationProcessor = new MessageRegistrationProcessor(this._state);
        this._messageSubscribeProcessor = new MessageSubscribeProcessor(this._state);
        this._messageUnsubscribeProcessor = new MessageUnsubscribeProcessor(this._state);
        this._messageUnsubscribeAllProcessor = new MessageUnsubscribeAllProcessor(this._state);
        this._messageRespondentBindProcessor = new MessageRespondentBindProcessor(this._state);
        this._messageRespondentUnbindProcessor = new MessageRespondentUnbindProcessor(this._state);
        this._messageDemandFromExpectantProcessor = new MessageDemandFromExpectantProcessor(this._state);
        this._messageDemandFromRespondentProcessor = new MessageDemandFromRespondentProcessor(this._state);
        // Subscribe to messages
        transport.subscribe(ATransport.EVENTS.message, this._onClientMessage.bind(this));
        transport.subscribe(ATransport.EVENTS.connected, this._onClientConnected.bind(this));
        transport.subscribe(ATransport.EVENTS.disconnected, this._onClientDisconnect.bind(this));
        transport.subscribe(ATransport.EVENTS.updated, this._onClientUpdated.bind(this));
        // Create transport
        transport.create().then(() => {
            this._logger.env(`Transport for provider is created`);
            this._logState();
        }).catch((error: Error) => {
            this._logger.error(`Fail to create transport due error: ${error.message}`);
        });
    }

    /**
     * Subscribe to provider event
     * @param event {any} event from Provider.Events
     * @param handler {Function} handler of event
     * @returns {boolean}
     */
    public on(event: any, handler: (...args: any[]) => any): boolean {
        return this._emitter.subscribe(event, handler);
    }

    /**
     * Unsubscribe from provider event
     * @param event {any} event from Provider.Events
     * @param handler {Function} handler of event
     * @returns {boolean}
     */
    public removeListener(event: any, handler: (...args: any[]) => any): boolean {
        return this._emitter.unsubscribe(event, handler);
    }

    /**
     * Remove all handlers for Provider.Events event
     * @param event {any} event from Provider.Events
     * @returns {void}
     */
    public removeAllListeners(event?: any): void {
        return this._emitter.unsubscribeAll(event);
    }

    /**
     * Destroy server
     * @returns {Promise<void>} - Formatted log-string
     */
    public destroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._state.tasks.destory();
            this._state.transport.destroy().then(() => {
                this._state.events.drop();
                this._state.demands.drop();
                this._state.aliases.clear();
                this._state.unsubscribeAll();
                this._state.transport.unsubscribeAll();
                resolve();
            }).catch((transportError: Error) => {
                reject(transportError);
            });
        });
    }

    /**
     * Register as respondent: bind handler with protocol / demand (request)
     * @param demand {any} reference to demand class
     * @param query {TQuery} query, which will used for calls to respondent
     * @param handler {Function} handler to process income request (demand)
     * @returns { void | Error }
     */
    public listenRequest(
        demand: any,
        handler: (demand: any, clientId: string, callback: (error: Error | null, results: any) => any) => any,
        query: TQuery = {},
    ): void | Error {
        // Check handler
        if ((handler as any)[ServerDemandHandlerSignature] !== void 0) {
            return new Error(`Handler is already subscribed`);
        }
        // Create subscription
        const guid: string = `${Tools.guid()}-${Tools.guid()}`;
        const demandSignature = this._getEntitySignature(demand);
        if (demandSignature instanceof Error) {
            return demandSignature;
        }
        const protocol = demand.getProtocol();
        const protocolSignature = this._getEntitySignature(protocol);
        if (protocolSignature instanceof Error) {
            return protocolSignature;
        }
        (handler as any)[ServerDemandHandlerSignature] = guid;
        // Add handler
        this._state.demands.refServerHandler(guid, handler);
        // Add protocol
        this._state.protocols.add(protocol);
        // Add subscription
        this._state.demands.subscribe(protocolSignature, demandSignature, guid, query);
    }

    /**
     * Unregister as respondent: unbind handler with protocol / demand (request)
     * @param demand {any} reference to demand class
     * @returns { void | Error }
     */
    public removeRequestListener(demand: any): void | Error {
        const demandSignature = this._getEntitySignature(demand);
        if (demandSignature instanceof Error) {
            return demandSignature;
        }
        const protocolSignature = this._getEntitySignature(demand.getProtocol());
        if (protocolSignature instanceof Error) {
            return protocolSignature;
        }
        const subscriptions: string[] | Error = this._state.demands.getSubscriptions(protocolSignature, demandSignature);
        if (subscriptions instanceof Error) {
            return subscriptions;
        }
        subscriptions.forEach((guid: string) => {
            this._state.demands.unrefServerHandler(guid);
        });
    }

    /**
     * Subscribe handler to event
     * @param event {any} implementation of event
     * @param handler {Function} handler
     * @returns { void | Error }
     */
    public subscribe(event: any, handler: (event: any) => any): void | Error {
        // Check handler
        if ((handler as any)[ServerEventHandlerSignature] !== void 0) {
            return new Error(`Handler is already subscribed`);
        }
        // Create subscription
        const guid: string = `${Tools.guid()}-${Tools.guid()}`;
        const eventSignature = this._getEntitySignature(event);
        if (eventSignature instanceof Error) {
            return eventSignature;
        }
        const protocol = event.getProtocol();
        const protocolSignature = this._getEntitySignature(protocol);
        if (protocolSignature instanceof Error) {
            return protocolSignature;
        }
        (handler as any)[ServerEventHandlerSignature] = guid;
        // Add protocol
        this._state.protocols.add(protocol);
        // Add handler
        this._state.events.subscribeHandler(protocolSignature, eventSignature, handler);
    }

    /**
     * Unsubscribe from event
     * @param event {any} implementation of event
     * @param handler {function} listener of event
     * @returns { void | Error }
     */
    public unsubscribe(event: any, handler?: THandler): void | Error {
        const eventSignature = this._getEntitySignature(event);
        if (eventSignature instanceof Error) {
            return eventSignature;
        }
        const protocolSignature = this._getEntitySignature(event.getProtocol());
        if (protocolSignature instanceof Error) {
            return protocolSignature;
        }
        if (handler === undefined) {
            this._state.events.unsubscribeHandler(protocolSignature, eventSignature);
            return;
        }
        this._state.events.unsubscribeHandler(protocolSignature, eventSignature, handler);
    }

    public ref(alias: TAlias): Error | void {
        return this._state.events.refAlias(alias);
    }

    public unref(): void {
        this._state.events.unrefAlias();
    }

    public emit(event: any, aliases?: TAlias, options?: Protocol.Message.Event.Options): Promise<number> {
        return new Promise((resolve, reject) => {
            const eventSignature = this._getEntitySignature(event);
            if (eventSignature instanceof Error) {
                return reject(eventSignature);
            }
            const protocolSignature = this._getEntitySignature(event.getProtocol());
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            const _aliases: Protocol.KeyValue[] = [];
            if (typeof aliases !== 'undefined') {
                try {
                    if (typeof aliases !== 'object' || aliases === null) {
                        throw new Error(`As aliases can be provided an object { [key: string]: string }.`);
                    }
                    Object.keys(aliases).forEach((key: string) => {
                        if (typeof aliases[key] !== 'string' || aliases[key].trim() === '') {
                            throw new Error(`Alias with key = "${key}" is defined incorrectly. It should be not empty {string}.`);
                        }
                        _aliases.push(new Protocol.KeyValue({
                            key: key,
                            value: aliases[key],
                        }));
                    });
                } catch (error) {
                    return reject(error);
                }
            }
            // Setup default options
            if (options === undefined) {
                options = new Protocol.Message.Event.Options({});
            }
            options.scope = options.scope === undefined ? Protocol.Message.Event.Options.Scope.all : options.scope;
            this._state.events.emitAll(
                null,
                protocolSignature,
                eventSignature,
                event.stringify(),
                options,
                _aliases.length > 0 ? _aliases : undefined).then((count: number) => {
                resolve(count);
            });
        });
    }

    private _onClientMessage(message: any, sender: TSender) {
        const clientId = message.clientId;

        // Reconnection
        if (Protocol.Message.Reconnection.Request.instanceOf(message)) {
            return this._messageReconnectionProcessor.process(sender, message).catch((error: Error) => {
                this._logger.warn(`Fail to reconnect for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Subscribe to event
        if (Protocol.Message.Subscribe.Request.instanceOf(message)) {
            this._messageSubscribeProcessor.process(sender, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Subscribe for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Unsubscribe event
        if (Protocol.Message.Unsubscribe.Request.instanceOf(message)) {
            this._messageUnsubscribeProcessor.process(sender, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Unsubscribe for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Unsubscribe all event
        if (Protocol.Message.UnsubscribeAll.Request.instanceOf(message)) {
            this._messageUnsubscribeAllProcessor.process(sender, message).catch((error: Error) => {
                this._logger.warn(`Fail todo UnsubscribeAll for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Trigger event
        if (Protocol.Message.Event.Request.instanceOf(message)) {
            this._messageEventProcessor.process(sender, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Event for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Registration
        if (Protocol.Message.Registration.Request.instanceOf(message)) {
            this._messageRegistrationProcessor.process(sender, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Registration for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Registration as Respondent for Demand
        if (Protocol.Message.Respondent.Bind.Request.instanceOf(message)) {
            this._messageRespondentBindProcessor.process(sender, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Respondent.Bind for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Unregistration as Respondent for Demand
        if (Protocol.Message.Respondent.Unbind.Request.instanceOf(message)) {
            this._messageRespondentUnbindProcessor.process(sender, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Respondent.Unbind for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Demand request: call from expectant
        if (Protocol.Message.Demand.FromExpectant.Request.instanceOf(message)) {
            this._messageDemandFromExpectantProcessor.process(sender, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Demand.FromExpectant for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Demand request: response from respondent
        if (Protocol.Message.Demand.FromRespondent.Request.instanceOf(message)) {
            this._messageDemandFromRespondentProcessor.process(sender, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Demand.FromRespondent for connection ${clientId} due error: ${error.message}`);
            });
        }
    }

    private _onClientConnected(clientId: string) {
        this._emitter.emit(Provider.Events.connected, clientId);
    }

    private _onClientDisconnect(clientId: string) {
        Promise.all([
            this._state.events.disconnect(clientId),
            this._state.demands.disconnect(clientId),
        ]).then(() => {
            this._state.tasks.drop(clientId);
            this._state.aliases.unref(clientId);
            this._emitter.emit(Provider.Events.disconnected, clientId);
        }).catch((error: Error) => {
            this._logger.error(`Fail to disconnect client correctly due error: ${error.message}`);
        });
    }

    private _onClientUpdated(clientId: string) {
        this._state.tasks.resolve(clientId);
    }

    /**
     * Gets entity's signature
     * @param protocol {Protocol} implementation of protocol
     * @returns {string | Error}
     */
    private _getEntitySignature(entity: any): string | Error {
        if ((typeof entity !== 'object' || entity === null) && typeof entity !== 'function') {
            return new Error('No protocol found. As protocol expecting: constructor or instance of protocol.');
        }
        if (typeof entity.getSignature !== 'function' || typeof entity.getSignature() !== 'string' || entity.getSignature().trim() === '') {
            return new Error('No sigature of protocol found');
        }
        return entity.getSignature();
    }

    private _logState() {
        const i = {
            d: this._state.demands.getInfo(),
            e: this._state.events.getInfo(),
            t: this._state.tasks.getTasksInfo(),
        };
        const events: any = {};
        i.e.forEach((count, key) => {
            events[key] = count;
        });
        function filler(pattern: string | number, value: string | number): string {
            const length = typeof pattern === 'string' ? pattern.length : pattern;
            const str = `${value}`;
            const repeat = length - str.length;
            return `${str}${repeat > 0 ? (' '.repeat(repeat)) : ''}`;
        }
        let eventsInfo: string = Object.keys(events).length === 0 ? (filler(55, `│ No any subscriptions yet`) + '│') : '';
        if (Object.keys(events).length > 0) {
            eventsInfo = Object.keys(events).map((key) => {
                return filler(55, `│ ${key}: ${events[key]}`) + '│';
            }).join('\n');
        }
        const info: string = `
┌─────────────────┬─────────────────┬──────────────────┐
│ tasks           │ demands         │ results          │
├─────────────────┼─────────────────┼──────────────────┤
│${filler(' tasks           ', ' ' + i.t.summary)}│${filler(' demands         ', ' ' + i.d.demands)}│${filler(' results          ', ' ' + i.d.results)}│
├─────────────────┴─────────────────┴──────────────────┤
│ events                                               │
${eventsInfo}
└──────────────────────────────────────────────────────┘\n`;
        const transportInfo: string[] = this._state.transport.getInfo().split(/[\n\r]/gi);
        const infoParts: string[] = info.split(/[\n\r]/gi).map((line: string, index: number) => {
            return `${line}${transportInfo[index] !== void 0 ? transportInfo[index] : ''}`;
        });
        this._logger.area('state').debug(infoParts.join('\n'));
        setTimeout(() => {
            this._logState();
        }, 3000);
    }
}
