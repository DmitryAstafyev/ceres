import * as HTTP from 'http';

import * as DescMiddleware from '../../infrastructure/middleware/implementation';
import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';
import * as DescConnection from './connection/index';

import { Aliases, TAlias } from './server.aliases';
import { Connection } from './server.connection';
import { Connections } from './server.connections';
import { Token, Tokens } from './server.tokens';

type TPendingDemand = {
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
                        Protocol.Message.Demand.FromRepondent.Request |
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
                            Protocol.Message.Demand.FromRepondent.Request,
                            Protocol.Message.Respondent.Bind.Request,
                            Protocol.Message.Respondent.Unbind.Request];

type TQuery = { [key: string]: string };

type THandler = (...args: any[]) => any;

interface IScopedRespondentList {
    hosts: string[];
    clients: string[];
    all: string[];
    target: string | null;
    type: Protocol.Message.Demand.Options.Scope | null;
}

const ServerDemandHandlerSignature: string = '__ServerDemandHandlerSignature';

export class Server {

    private _logger:                    Tools.Logger                = new Tools.Logger('Http.Server');
    private _pending:                   Connections                 = new Connections();
    private _hooks:                     Connections                 = new Connections();
    private _protocols:                 Tools.ProtocolsHolder       = new Tools.ProtocolsHolder();
    private _tokens:                    Tokens;
    private _subscriptions:             Tools.SubscriptionsHolder   = new Tools.SubscriptionsHolder();
    private _demands:                   Tools.DemandsHolder         = new Tools.DemandsHolder();
    private _serverDemandsHanlders:     Map<string, THandler>       = new Map();
    private _tasks:                     Tools.Queue                 = new Tools.Queue();
    private _aliases:                   Aliases                     = new Aliases();
    private _pendingDemandResults:      Map<string, TPendingDemand> = new Map();
    private _pendingDemandRespondent:   Map<string, TPendingDemand> = new Map();
    private _parameters:                DescConnection.ConnectionParameters;
    private _middleware:                DescMiddleware.Middleware<Connection>;
    private _http:                      HTTP.Server;

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

        this._tokens = new Tokens(this._parameters.getTokenLife());

        this._http = HTTP.createServer(this._onRequest.bind(this)).listen(this._parameters.getPort());

        // Turn off timeout for income connections
        this._http.timeout = 0;

        this._onClientDisconnected = this._onClientDisconnected.bind(this);

        this._logState();
    }

    /**
     * Destroy server
     * @returns {Promise<void>} - Formatted log-string
     */
    public destroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._tasks.destory()
                .then(() => {
                    this._pending.closeAll()
                        .then(() => {
                            this._http.close(resolve);
                        });
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
        this._serverDemandsHanlders.set(guid, handler);
        // Add protocol
        this._protocols.add(protocol);
        // Add subscription
        this._demands.subscribe(protocolSignature, demandSignature, guid, query);
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
        const subscriptions: string[] | Error = this._demands.getAll(protocolSignature, demandSignature);
        if (subscriptions instanceof Error) {
            return subscriptions;
        }
        subscriptions.forEach((guid: string) => {
            this._serverDemandsHanlders.delete(guid);
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
        if (token !== this._tokens.get(clientId)) {
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
            return this._middleware.auth(clientId, connection)
                .then(() => {
                    // Connection is accepted
                    connection.close((new Protocol.Message.Handshake.Response({
                        clientId: clientId,
                        token: this._tokens.set(clientId),
                    })).stringify()).then(() => {
                        this._logger.env(`Authorization of connection for ${clientId} is done.`);
                    }).catch((error: Error) => {
                        this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
                    });
                })
                .catch((error: Error) => {
                    // Connection is rejected
                    connection.close((new Protocol.Message.Handshake.Response({
                        clientId: clientId,
                        error: error.message,
                        reason: Protocol.Message.Handshake.Response.Reasons.FAIL_AUTH,
                    })).stringify()).then(() => {
                        this._logger.env(`Authorization of connection for ${clientId} is failed die error: ${error.message}`);
                    }).catch((closeError: Error) => {
                        this._logger.warn(`Fail to close connection ${clientId} due error: ${closeError.message}`);
                    });
                });
        }
        const token = message.token;
        // Reconnection
        if (message instanceof Protocol.Message.Reconnection.Request) {
            return connection.close((new Protocol.Message.Reconnection.Response({
                allowed: true,
                clientId: clientId,
            })).stringify()).then(() => {
                this._logger.env(`Reconnection for client ${clientId} is allowed.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        // Hook connection
        if (message instanceof Protocol.Message.Hook.Request) {
            connection.setClientGUID(clientId);
            connection.on(Connection.EVENTS.onAborted, this._onClientDisconnected);
            this._hooks.add(clientId, connection);
            return this._logger.env(`Hook connection for ${clientId} is accepted.`);
        }
        // Pending connnection
        if (message instanceof Protocol.Message.Pending.Request) {
            connection.setClientGUID(clientId);
            connection.on(Connection.EVENTS.onAborted, this._onClientDisconnected);
            // Add pending
            this._pending.add(clientId, connection);
            // Execute tasks
            this._tasks.procced();
            return this._logger.env(`Pending connection for ${clientId} is accepted.`);
        }
        // Subscribe to event
        if (message instanceof Protocol.Message.Subscribe.Request) {
            let status: boolean = false;
            if (typeof message.subscription.event === 'string' && message.subscription.event.trim() !== '' &&
                typeof message.subscription.protocol === 'string' && message.subscription.protocol.trim() !== '') {
                status = this._subscriptions.subscribe(
                    message.subscription.protocol,
                    message.subscription.event,
                    clientId,
                );
            }
            return connection.close((new Protocol.Message.Subscribe.Response({
                clientId: clientId,
                status: status,
            })).stringify()).then(() => {
                this._logger.env(`Subscription for client ${clientId} to protocol ${message.subscription.protocol}, event ${message.subscription.event} is done.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        // Unsubscribe event
        if (message instanceof Protocol.Message.Unsubscribe.Request) {
            let status: boolean = false;
            if (typeof message.subscription.event === 'string' && message.subscription.event.trim() !== '' &&
                typeof message.subscription.protocol === 'string' && message.subscription.protocol.trim() !== '') {
                status = this._subscriptions.unsubscribe(
                    message.subscription.protocol,
                    message.subscription.event,
                    clientId,
                );
            }
            return connection.close((new Protocol.Message.Unsubscribe.Response({
                clientId: clientId,
                status: status,
            })).stringify()).then(() => {
                this._logger.env(`Unsubscription for client ${clientId} to protocol ${message.subscription.protocol}, event ${message.subscription.event} is done.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        // Unsubscribe all event
        if (message instanceof Protocol.Message.UnsubscribeAll.Request) {
            let status: boolean = false;
            if (typeof message.subscription.protocol === 'string' && message.subscription.protocol.trim() !== '') {
                status = this._subscriptions.unsubscribe(
                    clientId,
                    message.subscription.protocol,
                );
            }
            return connection.close((new Protocol.Message.UnsubscribeAll.Response({
                clientId: clientId,
                status: status,
            })).stringify()).then(() => {
                this._logger.env(`Unsubscription for client ${clientId} to protocol ${message.subscription.protocol}, all events is done.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        // Trigger event
        if (message instanceof Protocol.Message.Event.Request) {
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
            let subscribers = this._subscriptions.get(message.event.protocol, message.event.event);
            // Check aliases
            if (message.aliases instanceof Array) {
                const targetClients = this._aliases.get(message.aliases);
                subscribers = subscribers.filter((subscriberId: string) => {
                    return targetClients.indexOf(subscriberId) !== -1;
                });
            }
            // Add tasks
            subscribers.forEach((subscriberId: string) => {
                this._tasks.add(
                    this._emitClientEvent.bind(this,
                        message.event.protocol,
                        message.event.event,
                        message.event.body,
                        subscriberId,
                    ),
                    subscriberId,
                );
            });
            // Execute tasks
            this._tasks.procced();
            return connection.close((new Protocol.Message.Event.Response({
                clientId: clientId,
                subscribers: subscribers.length,
            })).stringify()).then(() => {
                this._logger.env(`Emit event from client ${clientId} for event protocol ${message.event.protocol}, event ${message.event.event} is done for ${subscribers.length} subscribers.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail emit event from client ${clientId} for event protocol ${message.event.protocol}, event ${message.event.event} due error: ${error.message}.`);
            });
        }
        // Registration
        if (message instanceof Protocol.Message.Registration.Request) {
            let status: boolean = false;
            if (message.aliases instanceof Array) {
                if (message.aliases.length === 0) {
                    this._aliases.unref(clientId);
                    status = true;
                } else {
                    const aliases: TAlias = {};
                    let valid: boolean = true;
                    message.aliases.forEach((alias: Protocol.KeyValue) => {
                        if (!valid) {
                            return;
                        }
                        if (aliases[alias.key] !== void 0) {
                            valid = false;
                        } else {
                            aliases[alias.key] = alias.value;
                        }
                    });
                    if (valid) {
                        this._aliases.ref(clientId, aliases);
                        status = true;
                    }
                }
            }
            return connection.close((new Protocol.Message.Registration.Response({
                clientId: clientId,
                status: status,
            })).stringify()).then(() => {
                this._logger.env(`Registration of aliases for client ${clientId} as "${message.aliases.map((alias: Protocol.KeyValue) => {
                    return `${alias.key}: ${alias.value}`;
                }).join(', ')}" is done.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        // Registration as Respondent for Demand
        if (message instanceof Protocol.Message.Respondent.Bind.Request) {
            let status: boolean | Error = false;
            if (message.query instanceof Array) {
                if (message.query.length > 0) {
                    status = this._demands.subscribe(message.protocol, message.demand, clientId, message.query);
                }
            }
            return connection.close((new Protocol.Message.Respondent.Bind.Response({
                clientId: clientId,
                error: status instanceof Error ? status.message : undefined,
                status: status instanceof Error ? false : true,
            })).stringify()).then(() => {
                this._logger.env(`Binding client ${clientId} with demand "${message.protocol}/${message.demand}" with query as "${message.query.map((alias: Protocol.KeyValue) => {
                    return `${alias.key}: ${alias.value}`;
                }).join(', ')}" is done.`);
                this._checkPendingRespondent();
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        // Unregistration as Respondent for Demand
        if (message instanceof Protocol.Message.Respondent.Unbind.Request) {
            const status: boolean = this._demands.unsubscribe(clientId, message.protocol, message.demand);
            return connection.close((new Protocol.Message.Respondent.Unbind.Response({
                clientId: clientId,
                status: status,
            })).stringify()).then(() => {
                this._logger.env(`Unbinding client ${clientId} with demand "${message.protocol}/${message.demand}" is done.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        // Demand request: call from expectant
        if (message instanceof Protocol.Message.Demand.FromExpectant.Request) {
            // Setup default options
            if (message.options === undefined) {
                message.options = new Protocol.Message.Demand.Options({});
            }
            message.options.scope = message.options.scope === undefined ? Protocol.Message.Demand.Options.Scope.all : message.options.scope;
            const respondents: IScopedRespondentList | Error = this._getRespondentsForDemand(message.demand.protocol, message.demand.demand, message.query, message.options.scope);
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
                }).catch((error: Error) => {
                    this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
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
                    }).catch((error: Error) => {
                        this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
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
                    this._pendingDemandRespondent.set(demandGUID, {
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
                }).catch((error: Error) => {
                    this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
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
                    this._proccessDemandByServer(
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
                    this._tasks.add(
                        this._sendDemand.bind(this,
                            message.demand.protocol,
                            message.demand.demand,
                            message.demand.body,
                            message.demand.expected,
                            clientId,
                            respondents.target,
                            demandGUID,
                        ),
                        respondents.target as string,
                    );
                }
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        // Demand request: response from respondent
        if (message instanceof Protocol.Message.Demand.FromRepondent.Request) {
            // Try to find data in pending tasks
            const pendingDemand: TPendingDemand | undefined = this._pendingDemandResults.get(message.id);
            if (typeof pendingDemand === 'undefined') {
                // Already nobody expects an answer
                return connection.close((new Protocol.Message.Demand.FromRepondent.Response({
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
                this._tasks.add(
                    this._sendDemandResponse.bind(this,
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
                this._tasks.add(
                    this._sendDemandResponse.bind(this,
                        message.demand.protocol,
                        message.demand.demand,
                        message.demand.body,
                        message.demand.expected,
                        pendingDemand.expectantId,
                        '',
                        message.id,
                    ),
                    pendingDemand.expectantId,
                );
            }
            return connection.close((new Protocol.Message.Demand.FromRepondent.Response({
                clientId: clientId,
                status: true,
            })).stringify()).then(() => {
                this._logger.env(`Confirmation of sending demand's response sent Responend ${clientId}.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
    }

    private _onClientDisconnected(connection: Connection) {
        const clientId: string | null = connection.getClientGUID();
        if (typeof clientId !== 'string') {
            return this._logger.error(`Fait to disconnnect client, because clientId is incorrect: ${Tools.inspect(clientId)}`);
        }
        const _hooks: boolean = this._hooks.has(clientId);
        const _pending: boolean = this._pending.has(clientId);
        const _tasks: boolean = this._tasks.count(clientId) > 0;
        // Remove from storage of hooks
        _hooks && this._hooks.delete(clientId);
        // Remove from storage of pending
        _pending && this._pending.delete(clientId);
        // Remove related tasks
        _tasks && this._tasks.drop(clientId);
        // Unsubscribe
        this._subscriptions.removeClient(clientId);
        // Remove ref
        this._aliases.unref(clientId);
        // Remove demands
        this._demands.removeClient(clientId);
        if (_hooks || _pending) {
            this._logger.env(`Client ${clientId} is disconnected`);
        }
    }

    private _emitClientEvent(
        protocol: string,
        event: string,
        body: string,
        clientId: string,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const connection = this._pending.get(clientId);
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

    private _sendDemand(
        protocol: string,
        demand: string,
        body: string,
        expected: string,
        expectantId: string,
        respondentId: string,
        demandGUID: string,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const connection = this._pending.get(respondentId);
            if (connection === null) {
                return reject(new Error(
                    this._logger.env(`Client (${respondentId}) is subscribed as respondent on "${protocol}/${demand}", but active connection wasn't found. Task will stay in a queue.`),
                ));
            }
            this._logger.env(`Client (${respondentId}) is subscribed as respondent on  "${protocol}/${demand}". Demand will be sent.`);
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
                // Register demand
                this._pendingDemandResults.set(demandGUID, {
                    demand: demand,
                    expectantId: expectantId,
                    expected: expected,
                    protocol: protocol,
                    respondemtId: respondentId,
                    sent: (new Date()).getTime(),
                });
                resolve();
            }).catch((error: Error) => {
                this._logger.warn(`Fail to demand to client ${respondentId}: protocol ${protocol}, demand ${demand} due error: ${error.message}.`);
                reject();
            });
        });
    }

    private _sendDemandResponse(
        protocol: string,
        demand: string,
        body: string,
        expected: string,
        expectantId: string,
        error: string,
        demandRequestId: string,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const connection = this._pending.get(expectantId);
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
                resolve();
            }).catch((errorSending: Error) => {
                this._logger.warn(`Fail to send response on demand to client ${expectantId}: protocol ${protocol}, demand ${demand} due error: ${errorSending.message}.`);
                reject();
            });
        });
    }

    private _getResponseOfDemandByServer(
        protocol: string,
        demand: string,
        body: string,
        expected: string,
        respondentId: string,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            this._protocols.parse(protocol, body).then((demandImpl: Protocol.IImplementation) => {
                if (demandImpl.getSignature() !== demand) {
                    return reject(new Error(this._logger.env(`Implementation demand mismatch with demand name in request. Implemented: "${demandImpl.getSignature()}"; defined in request: ${demand}.`)));
                }
                const handler = this._serverDemandsHanlders.get(respondentId);
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

    private _proccessDemandByServer(
        protocol: string,
        demand: string,
        body: string,
        expected: string,
        respondentId: string,
        expectantId: string,
        demandGUID: string,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            this._getResponseOfDemandByServer(
                protocol,
                demand,
                body,
                expected,
                respondentId,
            ).then((response: string) => {
                this._tasks.add(
                    this._sendDemandResponse.bind(this,
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
                this._tasks.add(
                    this._sendDemandResponse.bind(this,
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

    private _checkPendingRespondent(): void {
        this._pendingDemandRespondent.forEach((pending: TPendingDemand, demandGUID: string) => {
            if (pending.options === undefined || pending.options.scope === undefined) {
                return;
            }
            const respondents: IScopedRespondentList | Error = this._getRespondentsForDemand(
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
                this._proccessDemandByServer(
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
                this._tasks.add(
                    this._sendDemand.bind(this,
                        pending.protocol,
                        pending.demand,
                        pending.body,
                        pending.expected,
                        pending.expectantId,
                        respondents.target,
                        demandGUID,
                    ),
                    respondents.target,
                );
            }
            // Remove pending task
            this._pendingDemandRespondent.delete(demandGUID);
        });
    }

    private _getRespondentsForDemand(protocol: string, demand: string, query: any[], scope: Protocol.Message.Demand.Options.Scope): IScopedRespondentList | Error {
        const result: IScopedRespondentList = {
            all: [],
            clients: [],
            hosts: [],
            target: null,
            type: null,
        };
        const respondents: string[] | Error = this._demands.get(protocol, demand, query);
        if (respondents instanceof Error) {
            return respondents;
        }
        result.all = respondents;
        respondents.forEach((clientId: string) => {
            if (this._serverDemandsHanlders.has(clientId)) {
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
                result.type = this._serverDemandsHanlders.has(result.target as string) ? result.type = Protocol.Message.Demand.Options.Scope.hosts : Protocol.Message.Demand.Options.Scope.clients;
                break;
        }
        return result;
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
        this._logger.debug(`\t[server state]: \n\pending:\n${this._pending.getInfo()}\n\hooks:\n${this._hooks.getInfo()}\n\tsubcribers\n ${this._subscriptions.getInfo()}\n\ttasks in queue: ${this._tasks.getTasksCount()}.`);
        setTimeout(() => {
            this._logState();
        }, 3000);
    }
}
