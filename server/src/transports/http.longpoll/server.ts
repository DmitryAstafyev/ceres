import * as HTTP from 'http';

import * as Tools from '../../platform/tools/index';
import * as DescConnection from './connection/index';
import * as DescMiddleware from '../../infrastructure/middleware/implementation';

import { Connection } from './connection';

import * as Protocol from '../../protocols/connection/protocol.connection';

type Token = { token: string, timestamp: number };

export class Tokens {

    private _tokenLife  : number;
    private _tokens     : Map<string, Token> = new Map();

    constructor(tokenLife: number){
        this._tokenLife = tokenLife;
    }

    public set(clientId: string): string {
        const token = Tools.guid();
        this._tokens.set(clientId, {
            token: token,
            timestamp: (new Date()).getTime()
        });
        return token;
    }

    public get(clientId: string): string | null {
        const token: Token | undefined = this._tokens.get(clientId);
        if (token === undefined){
            return null;
        }
        return token.token;
    }

    public isActual(clientId: string): boolean {
        const token: Token | undefined = this._tokens.get(clientId);
        if (token === undefined){
            return false;
        }
        if (((new Date()).getTime() - token.timestamp) > this._tokenLife) {
            this._tokens.delete(clientId);
            return false;
        }
        return true;
    }

}

class Connections {

    private _connections: Map<string, Array<Connection>> = new Map();

    public add(clientId: string, connection: Connection){
        let connections = this._connections.get(clientId);
        if (!(connections instanceof Array)) {
            connections = [];
        }
        connections.push(connection);
        this._connections.set(clientId, connections);
    }

    public get(clientId: string): Connection | null {
        let connections = this._connections.get(clientId);
        if (!(connections instanceof Array)) {
            return null;
        }
        const connection = connections[0];
        connections.splice(0, 1);
        if (connections.length === 0) {
            this._connections.delete(clientId);
        } else {
            this._connections.set(clientId, connections);
        }
        return connection;
    }

    public has(clientId: string): boolean {
        let connections = this._connections.get(clientId);
        if (!(connections instanceof Array)) {
            return false;
        }
        return true;
    }
    public closeAll(): Promise<void> {
        return new Promise((resolve, reject) => {
            const tasks: Array<Promise<void>> = [];
            this._connections.forEach((connections: Array<Connection>, clientId: string) => {
                tasks.push(...connections.map((connection: Connection) => {
                    return connection.close((new Protocol.Disconnect({
                        reason: Protocol.Disconnect.Reasons.SHUTDOWN,
                        message: 'Closing all pending requests.'
                    })).stringify());
                }));
            });
            Promise.all(tasks)
                .then(() => {
                    this._connections.clear();
                    resolve();
                })
                .catch((error: Error) => {
                    this._connections.clear();
                    reject(error);
                });
        });
    }

    public delete(clientId: string){
        this._connections.delete(clientId);
    }

    public getInfo(): string {
        let info: Array<string> = [];
        this._connections.forEach((connections: Array<Connection>, clientId: string) => {
            info.push(`\t\tclientId: "${clientId}" has ${connections.length} connections`);
        });
        return info.join(';\n');
    }

}

type TClientRequests =  Protocol.Message.Handshake.Request |
                        Protocol.Message.Hook.Request |
                        Protocol.Message.Pending.Request |
                        Protocol.Message.Reconnection.Request |
                        Protocol.Message.Event.Request |
                        Protocol.Message.Subscribe.Request |
                        Protocol.Message.Unsubscribe.Request |
                        Protocol.Message.UnsubscribeAll.Request;

const ClientRequestsTypes = [Protocol.Message.Handshake.Request, 
                            Protocol.Message.Hook.Request,
                            Protocol.Message.Pending.Request,
                            Protocol.Message.Reconnection.Request,
                            Protocol.Message.Event.Request,
                            Protocol.Message.Subscribe.Request,
                            Protocol.Message.Unsubscribe.Request,
                            Protocol.Message.UnsubscribeAll.Request];

export class Server {
 
    private _logger         : Tools.Logger              = new Tools.Logger('Http.Server');
    private _pending        : Connections               = new Connections();
    private _hooks          : Connections               = new Connections();
    private _tokens         : Tokens;
    private _subscriptions  : Tools.SubscriptionsHolder = new Tools.SubscriptionsHolder();
    private _tasks          : Tools.Queue               = new Tools.Queue();
    private _parameters     : DescConnection.ConnectionParameters;
    private _middleware     : DescMiddleware.Middleware<Connection>;
    private _http           : HTTP.Server;

    constructor(
        parameters: DescConnection.ConnectionParameters,
        middleware?: DescMiddleware.Middleware<Connection>
    ){
 
        if (!(parameters instanceof DescConnection.ConnectionParameters)) {
            if (parameters !== undefined){
                this._logger.warn(`Get wrong parameters of connection. Expected <ConnectionParameters>. Gotten: `, parameters);
            }
            parameters = new DescConnection.ConnectionParameters({});
        }

        if (!(middleware instanceof DescMiddleware.Middleware)) {
            if (middleware !== undefined){
                this._logger.warn(`Get wrong parameters of connection. Expected <Middleware>. Gotten: `, middleware);
            }
            middleware = new DescMiddleware.Middleware({});
        }

        this._parameters = parameters;
        this._middleware = middleware;

        this._tokens = new Tokens(this._parameters.getTokenLife());

        this._http = HTTP.createServer(this._onRequest.bind(this)).listen(this._parameters.getPort());

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
                })
        });
    }

    private _onRequest(request: HTTP.IncomingMessage, response: HTTP.ServerResponse) {
        const connection = new Connection(request, response, this._parameters.getMaxSize(), this._parameters.getCORS());
        connection.getRequest()
            .then((request: string) => {
                //Parse request
                let post;
                try {
                    post = JSON.parse(request);
                    if (Tools.getTypeOf(post) !== Tools.EPrimitiveTypes.object){
                        return connection.close(this._logger.warn(`As post data expecting only {object}.`)).catch((error: Error) => {
                            this._logger.warn(`Fail to close connection due error: ${error.message}`);
                        });
                    }
                } catch (error) {
                    return connection.close(this._logger.warn(`Fail to parse post data due error: ${error.message}`)).catch((error: Error) => {
                        this._logger.warn(`Fail to close connection due error: ${error.message}`);
                    });
                }
                //Exctract message
                const message = Protocol.parse(post);
                if (message instanceof Error) {
                    return connection.close(this._logger.warn(`Fail to get message from post data due error: ${message.message}`)).catch((error: Error) => {
                        this._logger.warn(`Fail to close connection due error: ${error.message}`);
                    });
                }
                //Check for errors
                const error = this._getMessageErrors(message as TClientRequests);
                if (error) {
                    this._logger.warn(error.error.message);
                    return connection.close(error.response).catch((error: Error) => {
                        this._logger.warn(`Fail to close connection due error: ${error.message}`);
                    });
                }
                //Process message
                this._onMessage(message as TClientRequests, connection);
            })
            .catch((error: Error) => {
                this._logger.warn(`Fail to get body of post data due error: ${error.message}`)
            });
    }

    private _getMessageErrors(message: TClientRequests): { error: Error, response: string } | null {
        //Check type of message
        let isCorrectType: boolean = false;
        ClientRequestsTypes.forEach((TTypeRef) => {
            if (isCorrectType){
                return;
            }
            if (message instanceof TTypeRef) {
                isCorrectType = true;
            }
        });
        if (!isCorrectType){
            //Unexpected request
            return {
                error: new Error(`Unexpected request from client.`),
                response: (new Protocol.ConnectionError({
                    reason: Protocol.ConnectionError.Reasons.UNEXPECTED_REQUEST,
                    message: `Request is rejected, because it has unexpected type: ${message.stringify()}`
                })).stringify()
            };
        }
        //Check clientId
        const clientId = message.clientId;
        if (Tools.getTypeOf(clientId) !== Tools.EPrimitiveTypes.string || clientId.trim() === ''){
            //Client ID isn't defined at all
            return {
                error: new Error(`Client ID isn't defined.`),
                response: (new Protocol.ConnectionError({
                    reason: Protocol.ConnectionError.Reasons.NO_CLIENT_ID_FOUND,
                    message: `Client Id isn't found in request: ${message.stringify()}`
                })).stringify()
            };
        }
        //Check token
        if (message instanceof Protocol.Message.Handshake.Request) {
            return null;
        }
        const token: string = message.token;
        if (token.trim() === '') {
            //Token isn't provided at all
            return {
                error: new Error(`No token defined in message`),
                response: (new Protocol.ConnectionError({
                    reason: Protocol.ConnectionError.Reasons.NO_TOKEN_PROVIDED,
                    message: `Token isn't found in request: ${message.stringify()}`
                })).stringify()
            };
        }
        if (token !== this._tokens.get(clientId)) {
            return {
                error: new Error(`Wrong token provided`),
                response: (new Protocol.ConnectionError({
                    reason: Protocol.ConnectionError.Reasons.TOKEN_IS_WRONG,
                    message: `Incorrect token is in request: ${message.stringify()}`
                })).stringify()
            };
        }
        return null;
    }

    private _onMessage(message: TClientRequests, connection: Connection){
        const clientId = message.clientId;
        //Authorization
        if (message instanceof Protocol.Message.Handshake.Request){
            return this._middleware.auth(clientId, connection)
                .then(() => {
                    //Connection is accepted
                    connection.close((new Protocol.Message.Handshake.Response({
                        clientId: clientId,
                        token: this._tokens.set(clientId)
                    })).stringify()).then(() => {
                        this._logger.env(`Authorization of connection for ${clientId} is done.`);
                    }).catch((error: Error) => {
                        this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
                    });
                })
                .catch((error: Error) => {
                    //Connection is rejected
                    connection.close((new Protocol.Message.Handshake.Response({
                        clientId: clientId,
                        reason: Protocol.Message.Handshake.Response.Reasons.FAIL_AUTH,
                        error: error.message
                    })).stringify()).then(() => {
                        this._logger.env(`Authorization of connection for ${clientId} is failed die error: ${error.message}`);
                    }).catch((error: Error) => {
                        this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
                    });
                });
        }
        const token = message.token;
        //Reconnection
        if (message instanceof Protocol.Message.Reconnection.Request) {
            return connection.close((new Protocol.Message.Reconnection.Response({
                clientId: clientId,
                allowed: true
            })).stringify()).then(() => {
                this._logger.env(`Reconnection for client ${clientId} is allowed.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        //Hook connection
        if (message instanceof Protocol.Message.Hook.Request) {
            connection.setClientGUID(clientId);
            connection.on(Connection.EVENTS.onAborted, this._onClientDisconnected);
            this._hooks.add(clientId, connection);
            return this._logger.env(`Hook connection for ${clientId} is accepted.`);
        }
        //Pending connnection
        if (message instanceof Protocol.Message.Pending.Request) {
            connection.setClientGUID(clientId);
            connection.on(Connection.EVENTS.onAborted, this._onClientDisconnected);
            this._pending.add(clientId, connection);
            return this._logger.env(`Pending connection for ${clientId} is accepted.`);
        }
        //Subscribe to event
        if (message instanceof Protocol.Message.Subscribe.Request) {
            let status: boolean = false; 
            if (typeof message.subscription.event === 'string' && message.subscription.event.trim() !== '' &&
                typeof message.subscription.protocol === 'string' && message.subscription.protocol.trim() !== '') {
                status = this._subscriptions.subscribe(
                    message.subscription.protocol,
                    message.subscription.event,
                    clientId
                );
            }
            return connection.close((new Protocol.Message.Subscribe.Response({
                clientId: clientId,
                status: status
            })).stringify()).then(() => {
                this._logger.env(`Subscription for client ${clientId} to protocol ${message.subscription.protocol}, event ${message.subscription.event} is done.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        //Unsubscribe event
        if (message instanceof Protocol.Message.Unsubscribe.Request) {
            let status: boolean = false; 
            if (typeof message.subscription.event === 'string' && message.subscription.event.trim() !== ''&&
                typeof message.subscription.protocol === 'string' && message.subscription.protocol.trim() !== '') {
                status = this._subscriptions.unsubscribe(
                    message.subscription.protocol,
                    message.subscription.event,
                    clientId
                );
            }
            return connection.close((new Protocol.Message.Unsubscribe.Response({
                clientId: clientId,
                status: status
            })).stringify()).then(() => {
                this._logger.env(`Unsubscription for client ${clientId} to protocol ${message.subscription.protocol}, event ${message.subscription.event} is done.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        //Unsubscribe all event
        if (message instanceof Protocol.Message.UnsubscribeAll.Request) {
            let status: boolean = false; 
            if (typeof message.subscription.protocol === 'string' && message.subscription.protocol.trim() !== '') {
                status = this._subscriptions.unsubscribe(
                    clientId,
                    message.subscription.protocol
                );
            }
            return connection.close((new Protocol.Message.UnsubscribeAll.Response({
                clientId: clientId,
                status: status
            })).stringify()).then(() => {
                this._logger.env(`Unsubscription for client ${clientId} to protocol ${message.subscription.protocol}, all events is done.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        //Trigger event
        if (message instanceof Protocol.Message.Event.Request) {
            if (typeof message.event.protocol !== 'string' || message.event.protocol.trim() === '' ||
                typeof message.event.event !== 'string' || message.event.event.trim() === '') {
                return connection.close((new Protocol.ConnectionError({
                    reason: Protocol.ConnectionError.Reasons.NO_DATA_PROVIDED,
                    message: `Expecting defined fields: protocol {string}; event {string}`
                })).stringify()).then(() => {
                    this._logger.env(`Fail to emit event from client ${clientId}.`);
                }).catch((error: Error) => {
                    this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
                });
            }
            const subscribers = this._subscriptions.get(message.event.protocol, message.event.event);
            //Add tasks
            subscribers.forEach((clientId: string) => {
                this._tasks.add(this._emitClientEvent.bind(this, message.event.protocol, message.event.event, message.event.body, clientId, token), clientId);
            });
            //Execute tasks
            this._tasks.procced();
            return connection.close((new Protocol.Message.Event.Response({
                clientId: clientId,
                subscribers: subscribers.length
            })).stringify()).then(() => {
                this._logger.env(`Emit event from client ${clientId} for event protocol ${message.event.protocol}, event ${message.event.event} is done for ${subscribers.length} subscribers.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail emit event from client ${clientId} for event protocol ${message.event.protocol}, event ${message.event.event} due error: ${error.message}.`);
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
        //Remove from storage of hooks
        _hooks && this._hooks.delete(clientId);
        //Remove from storage of pending
        _pending && this._pending.delete(clientId);
        //Remove related tasks
        _tasks && this._tasks.drop(clientId);
        //Unsubscribe
        this._subscriptions.removeClient(clientId);
        if (_hooks || _pending) {
            this._logger.env(`Client ${clientId} is disconnected`);
        }
    }

    private _emitClientEvent(protocol: string, event: string, body: string, clientId: string, token: string) {
        return new Promise((resolve, reject) => {
            const connection = this._pending.get(clientId);
            if (connection === null) {
                return reject(new Error(
                    this._logger.env(`Client (${clientId}) is subscribed on "${protocol}/${event}", but active connection wasn't found. Task will stay in a queue.`)
                ));
            }
            this._logger.env(`Client (${clientId}) is subscribed on "${protocol}/${event}". Event will be sent.`);
            connection.close((new Protocol.Message.Pending.Response({
                event: new Protocol.EventDefinition({
                    protocol: protocol,
                    event: event,
                    body: body
                }),
                clientId: clientId
            })).stringify()).then(() => {
                this._logger.env(`Emit event for client ${clientId}: protocol ${protocol}, event ${event} is done.`);
                resolve();
            }).catch((error: Error) => {
                this._logger.warn(`Fail to emit event for client ${clientId}: protocol ${protocol}, event ${event} due error: ${error.message}.`);
            });
        });
    }

    private _logState(){
        this._logger.debug(`\t[server state]: \n\pending:\n${this._pending.getInfo()}\n\hooks:\n${this._hooks.getInfo()}\n\tsubcribers\n ${this._subscriptions.getInfo()}\n\ttasks in queue: ${this._tasks.getTasksCount()}.`);
        setTimeout(() => {
            this._logState();
        }, 3000);
    }
}