import * as HTTP from 'http';

import * as DescMiddleware from '../../infrastructure/middleware/implementation';
import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import * as DescConnection from './connection/index';
import { TAlias } from './server.aliases';
import { Connection } from './server.connection';
import { MessageDemandFromExpectantProcessor } from './server.msg.processor.demand.fromexpectant';
import { MessageDemandFromRespondentProcessor } from './server.msg.processor.demand.fromrespondent';
import { MessageEventProcessor } from './server.msg.processor.event';
import { MessageHandshakeProcessor } from './server.msg.processor.handshake';
import { MessageHookProcessor } from './server.msg.processor.hook';
import { MessagePendingProcessor } from './server.msg.processor.pending';
import { MessageReconnectionProcessor } from './server.msg.processor.reconnection';
import { MessageRegistrationProcessor } from './server.msg.processor.registration';
import { MessageRespondentBindProcessor } from './server.msg.processor.respondent.bind';
import { MessageRespondentUnbindProcessor } from './server.msg.processor.respondent.unbind';
import { MessageSubscribeProcessor } from './server.msg.processor.subscribe';
import { MessageUnsubscribeProcessor } from './server.msg.processor.unsubscribe';
import { MessageUnsubscribeAllProcessor } from './server.msg.processor.unsubscribeall';
import { THandler, TQuery } from './server.processor.demands';
import { ServerState } from './server.state';

type TClientRequests =  Protocol.Message.Handshake.Request |
                        Protocol.Message.Hook.Request |
                        Protocol.Message.Pending.Request |
                        Protocol.Message.Reconnection.Request |
                        Protocol.Message.Event.Request |
                        Protocol.Message.Subscribe.Request |
                        Protocol.Message.Unsubscribe.Request |
                        Protocol.Message.UnsubscribeAll.Request |
                        Protocol.Message.Registration.Request |
                        Protocol.Message.Demand.FromExpectant.Request |
                        Protocol.Message.Demand.FromRespondent.Request |
                        Protocol.Message.Respondent.Bind.Request |
                        Protocol.Message.Respondent.Unbind.Request;

const ClientRequestsTypes = [Protocol.Message.Handshake.Request,
                            Protocol.Message.Hook.Request,
                            Protocol.Message.Pending.Request,
                            Protocol.Message.Reconnection.Request,
                            Protocol.Message.Event.Request,
                            Protocol.Message.Subscribe.Request,
                            Protocol.Message.Unsubscribe.Request,
                            Protocol.Message.UnsubscribeAll.Request,
                            Protocol.Message.Registration.Request,
                            Protocol.Message.Demand.FromExpectant.Request,
                            Protocol.Message.Demand.FromRespondent.Request,
                            Protocol.Message.Respondent.Bind.Request,
                            Protocol.Message.Respondent.Unbind.Request];

const ServerDemandHandlerSignature: string = '__ServerDemandHandlerSignature';
const ServerEventHandlerSignature: string = '__ServerEventHandlerSignature';

export class Server {

    private _logger:                    Tools.Logger                = new Tools.Logger('Http.Server');
    private _parameters:                DescConnection.ConnectionParameters;
    private _middleware:                DescMiddleware.Middleware<Connection>;
    private _http:                      HTTP.Server;

    private _messageEventProcessor: MessageEventProcessor;
    private _messageHandshakeProcessor: MessageHandshakeProcessor;
    private _messageReconnectionProcessor: MessageReconnectionProcessor;
    private _messageRegistrationProcessor: MessageRegistrationProcessor;
    private _messagePendingProcessor: MessagePendingProcessor;
    private _messageHookProcessor: MessageHookProcessor;
    private _messageSubscribeProcessor: MessageSubscribeProcessor;
    private _messageUnsubscribeProcessor: MessageUnsubscribeProcessor;
    private _messageUnsubscribeAllProcessor: MessageUnsubscribeAllProcessor;
    private _messageRespondentBindProcessor: MessageRespondentBindProcessor;
    private _messageRespondentUnbindProcessor: MessageRespondentUnbindProcessor;
    private _messageDemandFromExpectantProcessor: MessageDemandFromExpectantProcessor;
    private _messageDemandFromRespondentProcessor: MessageDemandFromRespondentProcessor;
    private _state: ServerState;

    constructor(
        parameters: DescConnection.ConnectionParameters,
        middleware?: DescMiddleware.Middleware<Connection>,
    ) {

        if (!(parameters instanceof DescConnection.ConnectionParameters)) {
            if (parameters !== undefined) {
                this._logger.warn(`Get wrong parameters of connection. Expected <ConnectionParameters>. Gotten: `, parameters);
            }
            parameters = new DescConnection.ConnectionParameters({});
        }

        if (!(middleware instanceof DescMiddleware.Middleware)) {
            if (middleware !== undefined) {
                this._logger.warn(`Get wrong parameters of connection. Expected <Middleware>. Gotten: `, middleware);
            }
            middleware = new DescMiddleware.Middleware({});
        }

        this._parameters = parameters;
        this._middleware = middleware;

        // Create server state
        this._state = new ServerState(this._parameters, this._middleware);
        // Create processors of messages
        this._messageEventProcessor = new MessageEventProcessor(this._state);
        this._messageHandshakeProcessor = new MessageHandshakeProcessor(this._state);
        this._messageReconnectionProcessor = new MessageReconnectionProcessor(this._state);
        this._messageRegistrationProcessor = new MessageRegistrationProcessor(this._state);
        this._messageHookProcessor = new MessageHookProcessor(this._state);
        this._messagePendingProcessor = new MessagePendingProcessor(this._state);
        this._messageSubscribeProcessor = new MessageSubscribeProcessor(this._state);
        this._messageUnsubscribeProcessor = new MessageUnsubscribeProcessor(this._state);
        this._messageUnsubscribeAllProcessor = new MessageUnsubscribeAllProcessor(this._state);
        this._messageRespondentBindProcessor = new MessageRespondentBindProcessor(this._state);
        this._messageRespondentUnbindProcessor = new MessageRespondentUnbindProcessor(this._state);
        this._messageDemandFromExpectantProcessor = new MessageDemandFromExpectantProcessor(this._state);
        this._messageDemandFromRespondentProcessor = new MessageDemandFromRespondentProcessor(this._state);

        // Create server
        this._http = HTTP.createServer(this._onRequest.bind(this)).listen(this._parameters.getPort());

        // Turn off timeout for income connections
        this._http.timeout = 0;

        this._logState();
    }

    /**
     * Destroy server
     * @returns {Promise<void>} - Formatted log-string
     */
    public destroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this._messageHookProcessor.drop(),
                this._messagePendingProcessor.drop(),
                this._messageSubscribeProcessor.drop(),
            ]).then(() => {
                this._http.close(resolve);
            });
        });
    }

    public subscribeToRequest(protocol: any, demand: Protocol.IClass | string, query: TQuery, handler: THandler): void | Error {
        // Check handler
        if ((handler as any)[ServerDemandHandlerSignature] !== void 0) {
            return new Error(`Handler is already subscribed`);
        }
        // Create subscription
        const guid: string = `${Tools.guid()}-${Tools.guid()}`;
        const protocolSignature = this._getEntitySignature(protocol);
        if (protocolSignature instanceof Error) {
            return protocolSignature;
        }
        const demandSignature = typeof demand === 'string' ? demand : this._getEntitySignature(demand);
        if (demandSignature instanceof Error) {
            return demandSignature;
        }
        (handler as any)[ServerDemandHandlerSignature] = guid;
        // Add handler
        this._state.processors.demands.refServerHandler(guid, handler);
        // Add protocol
        this._state.protocols.add(protocol);
        // Add subscription
        this._state.processors.demands.subscribe(protocolSignature, demandSignature, guid, query);
    }

    public unsubscribeFromRequest(protocol: any, demand: Protocol.IClass | string): void | Error {
        const protocolSignature = this._getEntitySignature(protocol);
        if (protocolSignature instanceof Error) {
            return protocolSignature;
        }
        const demandSignature = typeof demand === 'string' ? demand : this._getEntitySignature(demand);
        if (demandSignature instanceof Error) {
            return demandSignature;
        }
        const subscriptions: string[] | Error = this._state.processors.demands.getSubscriptions(protocolSignature, demandSignature);
        if (subscriptions instanceof Error) {
            return subscriptions;
        }
        subscriptions.forEach((guid: string) => {
            this._state.processors.demands.unrefServerHandler(guid);
        });
    }

    public subscribeToEvent(protocol: any, event: Protocol.IClass | string, handler: THandler): void | Error {
        // Check handler
        if ((handler as any)[ServerEventHandlerSignature] !== void 0) {
            return new Error(`Handler is already subscribed`);
        }
        // Create subscription
        const guid: string = `${Tools.guid()}-${Tools.guid()}`;
        const protocolSignature = this._getEntitySignature(protocol);
        if (protocolSignature instanceof Error) {
            return protocolSignature;
        }
        const eventSignature = typeof event === 'string' ? event : this._getEntitySignature(event);
        if (eventSignature instanceof Error) {
            return eventSignature;
        }
        (handler as any)[ServerEventHandlerSignature] = guid;
        // Add protocol
        this._state.protocols.add(protocol);
        // Add handler
        this._state.processors.events.subscribeHandler(protocolSignature, eventSignature, handler);
    }

    public unsubscribeFromEvent(protocol: any, event?: Protocol.IClass | string, handler?: THandler): void | Error {
        const protocolSignature = this._getEntitySignature(protocol);
        if (protocolSignature instanceof Error) {
            return protocolSignature;
        }
        if (event === undefined) {
            this._state.processors.events.unsubscribeHandler(protocolSignature);
            return;
        }
        const eventSignature = typeof event === 'string' ? event : this._getEntitySignature(event);
        if (eventSignature instanceof Error) {
            return eventSignature;
        }
        if (handler === undefined) {
            this._state.processors.events.unsubscribeHandler(protocolSignature, eventSignature);
            return;
        }
        this._state.processors.events.unsubscribeHandler(protocolSignature, eventSignature, handler);
    }

    public refEventAliases(alias: TAlias): Error | void {
        return this._state.processors.events.refAlias(alias);
    }

    public unrefEventAliases(): void {
        this._state.processors.events.unrefAlias();
    }

    public emitEvent(protocol: any, event: any, aliases?: TAlias, options?: Protocol.Message.Event.Options): Promise<number> {
        return new Promise((resolve, reject) => {
            const protocolSignature = this._getEntitySignature(protocol);
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            const eventSignature = this._getEntitySignature(event);
            if (eventSignature instanceof Error) {
                return reject(eventSignature);
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
            this._state.processors.events.emitAll(
                protocolSignature,
                eventSignature,
                event.stringify(),
                options,
                _aliases.length > 0 ? _aliases : undefined).then((count: number) => {
                resolve(count);
            });
        });
    }

    private _onRequest(httpRequest: HTTP.IncomingMessage, httpResponse: HTTP.ServerResponse) {
        const connection = new Connection(httpRequest, httpResponse, this._parameters.getMaxSize(), this._parameters.getCORS());
        connection.getRequest()
            .then((request: string) => {
                // Parse request
                let post;
                try {
                    post = JSON.parse(request);
                    if (Tools.getTypeOf(post) !== Tools.EPrimitiveTypes.object) {
                        return connection.close(this._logger.warn(`As post data expecting only {object}.`)).catch((closeError: Error) => {
                            this._logger.warn(`Fail to close connection due error: ${closeError.message}`);
                        });
                    }
                } catch (error) {
                    return connection.close(this._logger.warn(`Fail to parse post data due error: ${error.message}`)).catch((closeError: Error) => {
                        this._logger.warn(`Fail to close connection due error: ${closeError.message}`);
                    });
                }
                // Exctract message
                const message = Protocol.parse(post);
                if (message instanceof Error) {
                    return connection.close(this._logger.warn(`Fail to get message from post data due error: ${message.message}`)).catch((closeError: Error) => {
                        this._logger.warn(`Fail to close connection due error: ${closeError.message}`);
                    });
                }
                // Check for errors
                const error = this._getMessageErrors(message as TClientRequests);
                if (error) {
                    this._logger.warn(error.error.message);
                    return connection.close(error.response).catch((closeError: Error) => {
                        this._logger.warn(`Fail to close connection due error: ${closeError.message}`);
                    });
                }
                // Process message
                this._onMessage(message as TClientRequests, connection);
            })
            .catch((error: Error) => {
                this._logger.warn(`Fail to get body of post data due error: ${error.message}`);
            });
    }

    private _getMessageErrors(message: TClientRequests): { error: Error, response: string } | null {
        // Check type of message
        let isCorrectType: boolean = false;
        ClientRequestsTypes.forEach((TTypeRef) => {
            if (isCorrectType) {
                return;
            }
            if (message instanceof TTypeRef) {
                isCorrectType = true;
            }
        });
        if (!isCorrectType) {
            // Unexpected request
            return {
                error: new Error(`Unexpected request from client.`),
                response: (new Protocol.ConnectionError({
                    message: `Request is rejected, because it has unexpected type: ${message.stringify()}`,
                    reason: Protocol.ConnectionError.Reasons.UNEXPECTED_REQUEST,
                })).stringify(),
            };
        }
        // Check clientId
        const clientId = message.clientId;
        if (Tools.getTypeOf(clientId) !== Tools.EPrimitiveTypes.string || clientId.trim() === '') {
            // Client ID isn't defined at all
            return {
                error: new Error(`Client ID isn't defined.`),
                response: (new Protocol.ConnectionError({
                    message: `Client Id isn't found in request: ${message.stringify()}`,
                    reason: Protocol.ConnectionError.Reasons.NO_CLIENT_ID_FOUND,
                })).stringify(),
            };
        }
        // Check token
        if (message instanceof Protocol.Message.Handshake.Request) {
            return null;
        }
        const token: string = message.token;
        if (token.trim() === '') {
            // Token isn't provided at all
            return {
                error: new Error(`No token defined in message`),
                response: (new Protocol.ConnectionError({
                    message: `Token isn't found in request: ${message.stringify()}`,
                    reason: Protocol.ConnectionError.Reasons.NO_TOKEN_PROVIDED,
                })).stringify(),
            };
        }
        if (token !== this._messageHandshakeProcessor.getClientToken(clientId)) {
            return {
                error: new Error(`Wrong token provided`),
                response: (new Protocol.ConnectionError({
                    message: `Incorrect token is in request: ${message.stringify()}`,
                    reason: Protocol.ConnectionError.Reasons.TOKEN_IS_WRONG,
                })).stringify(),
            };
        }
        return null;
    }

    private _onMessage(message: TClientRequests, connection: Connection) {
        const clientId = message.clientId;
        // Authorization
        if (message instanceof Protocol.Message.Handshake.Request) {
            return this._messageHandshakeProcessor.process(connection, message).catch((error: Error) => {
                this._logger.env(`Authorization of connection for ${clientId} is failed die error: ${error.message}`);
            });
        }
        // Reconnection
        if (message instanceof Protocol.Message.Reconnection.Request) {
            return this._messageReconnectionProcessor.process(connection, message).catch((error: Error) => {
                this._logger.warn(`Fail to reconnect for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Hook connection
        if (message instanceof Protocol.Message.Hook.Request) {
            this._messageHookProcessor.process(connection, message).then(() => {
                this._logger.env(`Hook connection for ${clientId} is accepted.`);
            });
        }
        // Pending connnection
        if (message instanceof Protocol.Message.Pending.Request) {
            this._messagePendingProcessor.process(connection, message).then(() => {
                this._logger.env(`Pending connection for ${clientId} is accepted.`);
            });
        }
        // Subscribe to event
        if (message instanceof Protocol.Message.Subscribe.Request) {
            this._messageSubscribeProcessor.process(connection, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Subscribe for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Unsubscribe event
        if (message instanceof Protocol.Message.Unsubscribe.Request) {
            this._messageUnsubscribeProcessor.process(connection, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Unsubscribe for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Unsubscribe all event
        if (message instanceof Protocol.Message.UnsubscribeAll.Request) {
            this._messageUnsubscribeAllProcessor.process(connection, message).catch((error: Error) => {
                this._logger.warn(`Fail todo UnsubscribeAll for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Trigger event
        if (message instanceof Protocol.Message.Event.Request) {
            this._messageEventProcessor.process(connection, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Event for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Registration
        if (message instanceof Protocol.Message.Registration.Request) {
            this._messageRegistrationProcessor.process(connection, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Registration for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Registration as Respondent for Demand
        if (message instanceof Protocol.Message.Respondent.Bind.Request) {
            this._messageRespondentBindProcessor.process(connection, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Respondent.Bind for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Unregistration as Respondent for Demand
        if (message instanceof Protocol.Message.Respondent.Unbind.Request) {
            this._messageRespondentUnbindProcessor.process(connection, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Respondent.Unbind for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Demand request: call from expectant
        if (message instanceof Protocol.Message.Demand.FromExpectant.Request) {
            this._messageDemandFromExpectantProcessor.process(connection, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Demand.FromExpectant for connection ${clientId} due error: ${error.message}`);
            });
        }
        // Demand request: response from respondent
        if (message instanceof Protocol.Message.Demand.FromRespondent.Request) {
            this._messageDemandFromRespondentProcessor.process(connection, message).catch((error: Error) => {
                this._logger.warn(`Fail todo Demand.FromRespondent for connection ${clientId} due error: ${error.message}`);
            });
        }
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
        this._logger.debug(`\t[server state]: \n${this._state.processors.connections.getInfo()}\n\n\tsubcribers\n ${this._state.processors.events.getInfo()}\n\t${this._state.processors.demands.getInfo()}.`);
        setTimeout(() => {
            this._logState();
        }, 3000);
    }
}
