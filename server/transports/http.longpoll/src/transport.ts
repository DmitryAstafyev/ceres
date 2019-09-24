import { ATransport, Protocol, TClientRequests, Tools } from 'ceres.provider';

import { Connection } from './transport.connection';
import { Middleware } from './transport.middleware.implementation';
import { ConnectionParameters } from './transport.parameters.implementation';
import { Tokens } from './transport.tokens';

import { MessageHandshakeProcessor } from './transport.msg.processor.handshake';
import { MessageHookProcessor } from './transport.msg.processor.hook';
import { MessagePendingProcessor } from './transport.msg.processor.pending';

import { ProcessorConnections } from './transport.processor.connections';

import * as HTTP from 'http';
import * as TransportProtocol from './protocols/transports/httt.longpoll/protocol.transport.longpoll';

const ClientRequestsTypes = [
    TransportProtocol.Message.Handshake.Request,
    TransportProtocol.Message.Hook.Request,
    TransportProtocol.Message.Pending.Request,
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

type TTransportRequests =
                        TransportProtocol.Message.Handshake.Request |
                        TransportProtocol.Message.Hook.Request |
                        TransportProtocol.Message.Pending.Request;

type TRequests = TClientRequests | TTransportRequests;

export { Middleware, ConnectionParameters, Connection };

export default class LongpollTransport extends ATransport<ConnectionParameters, Middleware<Connection>> {
    public static Middleware = Middleware;
    public static Parameters = ConnectionParameters;

    private _http: HTTP.Server | undefined;
    private _logger: Tools.Logger = new Tools.Logger('LongpollTransport');
    private _tokens: Tokens ;
    private _messageHandshakeProcessor: MessageHandshakeProcessor;
    private _messagePendingProcessor: MessagePendingProcessor;
    private _messageHookProcessor: MessageHookProcessor;
    private _connections: ProcessorConnections;

    constructor(parameters: ConnectionParameters, middleware?: Middleware<Connection>) {
        super(parameters, middleware);
        if (!(parameters instanceof ConnectionParameters)) {
            if (parameters !== undefined) {
                this._logger.warn(`Get wrong parameters of connection. Expected <ConnectionParameters>. Gotten: `, parameters);
            }
            parameters = new ConnectionParameters({});
            this.parameters = parameters;
        }
        if (!(middleware instanceof Middleware)) {
            if (middleware !== undefined) {
                this._logger.warn(`Get wrong parameters of connection. Expected <Middleware>. Gotten: `, middleware);
            }
            middleware = new Middleware({});
            this.middleware = middleware;
        }
        this._tokens = new Tokens(this.parameters.getTokenLife());
        this._messageHandshakeProcessor = new MessageHandshakeProcessor(this);
        this._messageHookProcessor = new MessageHookProcessor(this);
        this._messagePendingProcessor = new MessagePendingProcessor(this);
        this._connections = new ProcessorConnections();
        this._connections.subscribe(ProcessorConnections.EVENTS.disconnected, this._onClientDisconnected.bind(this));
        this._connections.subscribe(ProcessorConnections.EVENTS.pending, this._onClientPending.bind(this));
    }

    public get connections(): ProcessorConnections {
        return this._connections;
    }

    public create(): Promise<any> {
        return new Promise((resolve) => {
            // Create server
            this._http = HTTP.createServer(this._onRequest.bind(this)).listen(this.parameters.getPort());
            // Turn off timeout for income connections
            this._http.timeout = 0;
            this.emit(ATransport.EVENTS.created);
            // Resolve
            resolve();
        });
    }

    public destroy(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._connections.drop().then(() => {
                if (this._http === undefined) {
                    return resolve();
                }
                this._http.close(() => {
                    this._http = undefined;
                    this.emit(ATransport.EVENTS.destroyed);
                    resolve();
                });
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    public send(clientId: string, data: string | Uint8Array): Promise<void> {
        return this._connections.send(clientId, data);
    }

    public isConnected(clientId: string): boolean {
        return this._connections.hooks.has(clientId);
    }

    public isAvailable(clientId: string): boolean {
        return this._connections.pending.has(clientId);
    }

    public getInfo(): string {
        const c = this._connections.getInfo();
        function filler(pattern: string | number, value: string | number): string {
            const length = typeof pattern === 'string' ? pattern.length : pattern;
            const str = `${value}`;
            const repeat = length - str.length;
            return `${str}${repeat > 0 ? (' '.repeat(repeat)) : ''}`;
        }

        return `
┌───────────────────────────────────────────┐
│ LongPoll transport connections: ${filler(5, c.hooks)}     │
├─────────────────────┬─────────────────────┤
│ pending             │ hooks               │
├─────────────────────┼─────────────────────┤
│${filler(' pending             ', ' ' + c.pending)}│${filler(' hooks               ', ' ' + c.hooks)}│
└─────────────────────┴─────────────────────┘`;
    }

    public getClientToken(clientId: string): string | null {
        return this._tokens.get(clientId);
    }

    public setClientToken(clientId: string): string {
        return this._tokens.set(clientId);
    }

    public generateClientGuid(): string {
        return this._tokens.generateClientGuid();
    }

    private _onRequest(httpRequest: HTTP.IncomingMessage, httpResponse: HTTP.ServerResponse) {
        const connection = new Connection(httpRequest, httpResponse, this.parameters.getMaxSize(), this.parameters.getCORS(), this.parameters.getAllowedHeaders());
        connection.getRequest().then((request: string | Uint8Array) => {
            // Parse request
            let post;
            if (typeof request === 'string') {
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
            } else if (request instanceof Uint8Array) {
                post = request;
            } else {
                return connection.close(this._logger.warn(`Fail to parse post data, because unexpected type of request: ${typeof request}`)).catch((closeError: Error) => {
                    this._logger.warn(`Fail to close connection due error: ${closeError.message}`);
                });
            }
            // Exctract message
            const message = TransportProtocol.parseFrom(post, [TransportProtocol, Protocol]) as any;
            if (message instanceof Error) {
                return connection.close(this._logger.warn(`Fail to get message from post data due error: ${message.message}`)).catch((closeError: Error) => {
                    this._logger.warn(`Fail to close connection due error: ${closeError.message}`);
                });
            }
            // Check for errors
            const error = this._getMessageErrors(message as TRequests);
            if (error) {
                this._logger.warn(error.error.message);
                return connection.close(error.response).catch((closeError: Error) => {
                    this._logger.warn(`Fail to close connection due error: ${closeError.message}`);
                });
            }
            // Authorization
            if (TransportProtocol.Message.Handshake.Request.instanceOf(message)) {
                return this._messageHandshakeProcessor.process(connection, message).then((validClientId: string) => {
                    this.emit(ATransport.EVENTS.connected, validClientId);
                }).catch((connectionError: Error) => {
                    this._logger.env(`Authorization of connection for ${message.clientId} is failed die error: ${connectionError.message}`);
                });
            }
            // Hook connection
            if (TransportProtocol.Message.Hook.Request.instanceOf(message)) {
                return this._messageHookProcessor.process(connection, message).then(() => {
                    this._logger.env(`Hook connection for ${message.clientId} is accepted.`);
                });
            }
            // Pending connnection
            if (TransportProtocol.Message.Pending.Request.instanceOf(message)) {
                return this._messagePendingProcessor.process(connection, message).then(() => {
                    this._logger.env(`Pending connection for ${message.clientId} is accepted.`);
                });
            }
            // Process message
            this.emit(ATransport.EVENTS.message, message as TClientRequests, connection.close.bind(connection));
        }).catch((error: Error) => {
            this._logger.warn(`Fail to get body of post data due error: ${error.message}`);
        });
    }

    private _getMessageErrors(message: any): { error: Error, response: string | Uint8Array } | null {
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
                response: (new TransportProtocol.ConnectionError({
                    message: `Request is rejected, because it has unexpected type: ${message.stringify()}`,
                    reason: TransportProtocol.ConnectionError.Reasons.UNEXPECTED_REQUEST,
                })).stringify() as Protocol.Protocol.TStringifyOutput,
            };
        }
        // Check clientId
        const clientId = message.clientId;
        if (Tools.getTypeOf(clientId) !== Tools.EPrimitiveTypes.string || clientId.trim() === '') {
            // Client ID isn't defined at all
            return {
                error: new Error(`Client ID isn't defined.`),
                response: (new TransportProtocol.ConnectionError({
                    message: `Client Id isn't found in request: ${message.stringify()}`,
                    reason: TransportProtocol.ConnectionError.Reasons.NO_CLIENT_ID_FOUND,
                })).stringify() as Protocol.Protocol.TStringifyOutput,
            };
        }
        // Check token
        if (TransportProtocol.Message.Handshake.Request.instanceOf(message)) {
            return null;
        }
        const token: string = message.token;
        if (token.trim() === '') {
            // Token isn't provided at all
            return {
                error: new Error(`No token defined in message`),
                response: (new TransportProtocol.ConnectionError({
                    message: `Token isn't found in request: ${message.stringify()}`,
                    reason: TransportProtocol.ConnectionError.Reasons.NO_TOKEN_PROVIDED,
                })).stringify() as Protocol.Protocol.TStringifyOutput,
            };
        }
        if (token !== this._tokens.get(clientId)) {
            return {
                error: new Error(`Wrong token provided`),
                response: (new TransportProtocol.ConnectionError({
                    message: `Incorrect token is in request: ${message.stringify()}`,
                    reason: TransportProtocol.ConnectionError.Reasons.TOKEN_IS_WRONG,
                })).stringify() as Protocol.Protocol.TStringifyOutput,
            };
        }
        return null;
    }

    private _onClientDisconnected(clientId: string): void {
        this.emit(ATransport.EVENTS.disconnected, clientId);
    }

    private _onClientPending(clientId: string): void {
        this.emit(ATransport.EVENTS.updated, clientId);
    }
}
