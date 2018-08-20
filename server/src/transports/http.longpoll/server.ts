import * as HTTP from 'http';
import * as querystring from 'querystring';

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

class Pendings {

    private _pendings: Map<string, Array<Connection>> = new Map();

    public add(clientId: string, connection: Connection){
        let connections = this._pendings.get(clientId);
        if (!(connections instanceof Array)) {
            connections = [];
        }
        connections.push(connection);
        this._pendings.set(clientId, connections);
    }

    public get(clientId: string): Connection | null {
        let connections = this._pendings.get(clientId);
        if (!(connections instanceof Array)) {
            return null;
        }
        const connection = connections[0];
        connections.splice(0, 1);
        if (connections.length === 0) {
            this._pendings.delete(clientId);
        } else {
            this._pendings.set(clientId, connections);
        }
        return connection;
    }

    public closeAll(): Promise<void> {
        return new Promise((resolve, reject) => {
            const tasks: Array<Promise<void>> = [];
            this._pendings.forEach((connections: Array<Connection>, clientId: string) => {
                tasks.push(...connections.map((connection: Connection) => {
                    return connection.close((new Protocol.ResponseError({
                        clientId: clientId,
                        allowed: false,
                        reason: Protocol.Reasons.SERVER_SHUTDOWN,
                    })).getStr());
                }));
            });
            Promise.all(tasks)
                .then(() => {
                    this._pendings.clear();
                    resolve();
                })
                .catch((error: Error) => {
                    this._pendings.clear();
                    reject(error);
                });
        });
    }

    public delete(clientId: string){
        this._pendings.delete(clientId);
    }

    public getInfo(){
        let info = '';
        this._pendings.forEach((connections: Array<Connection>, clientId: string) => {
            info += `clientId: "${clientId}" has ${connections.length} connections; `;
        });
        return info;
    }

}

export class Server {
 
    private _logger         : Tools.Logger              = new Tools.Logger('Http.Server');
    private _pending        : Pendings                  = new Pendings();
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

        this._onAbortedPendingConnection = this._onAbortedPendingConnection.bind(this);

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
                    post = querystring.parse(request);
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
                const message = Protocol.extract(post);
                if (message instanceof Error) {
                    return connection.close(this._logger.warn(`Fail to get message from post data due error: ${message.message}`)).catch((error: Error) => {
                        this._logger.warn(`Fail to close connection due error: ${error.message}`);
                    });
                }
                //Check for errors
                const error = this._getMessageErrors(message);
                if (error) {
                    this._logger.warn(error.error.message);
                    return connection.close(error.response).catch((error: Error) => {
                        this._logger.warn(`Fail to close connection due error: ${error.message}`);
                    });
                }
                //Process message
                this._onMessage(message, connection);
            })
            .catch((error: Error) => {
                this._logger.warn(`Fail to get body of post data due error: ${error.message}`)
            });
    }

    private _getMessageErrors(message: Protocol.TProtocolClasses): { error: Error, response: string } | null {
        //Check clientId
        const clientId = message.clientId;
        if (Tools.getTypeOf(clientId) !== Tools.EPrimitiveTypes.string || clientId.trim() === ''){
            //Client ID isn't defined at all
            return {
                error: new Error(`Client ID isn't defined.`),
                response: (new Protocol.ResponseError({
                    clientId: '',
                    allowed: false,
                    reason: Protocol.Reasons.NO_CLIENT_ID_FOUND
                })).getStr()
            };
        }
        //Check token
        const token: any = message.getToken();
        if (token instanceof Error) {
            return {
                error: new Error(`No token defined in message`),
                response: (new Protocol.ResponseError({
                    clientId: clientId,
                    allowed: false,
                    reason: Protocol.Reasons.NO_TOKEN_FOUND,
                    error: token.message
                })).getStr()
            };
        }
        if (token.trim() === '' && !(message instanceof Protocol.RequestHandshake)) {
            return {
                error: new Error(`No token provided in message`),
                response: (new Protocol.ResponseError({
                    clientId: clientId,
                    allowed: false,
                    reason: Protocol.Reasons.NO_TOKEN_PROVIDED
                })).getStr()
            };
        }
        if (token !== this._tokens.get(clientId)) {
            return {
                error: new Error(`Wrong token provided`),
                response: (new Protocol.ResponseError({
                    clientId: clientId,
                    allowed: false,
                    reason: Protocol.Reasons.TOKEN_IS_WRONG
                })).getStr()
            };
        }
        return null;
    }

    private _onMessage(message: Protocol.TProtocolClasses, connection: Connection){
        const clientId = message.clientId;
        const token = message.getToken();
        //Authorization
        if (message instanceof Protocol.RequestHandshake){
            return this._middleware.auth(clientId, connection)
                .then(() => {
                    //Connection is accepted
                    connection.close((new Protocol.ResponseHandshake({
                        clientId: clientId,
                        allowed: true
                    })).setToken(this._tokens.set(clientId)).getStr()).then(() => {
                        this._logger.env(`Authorization of connection for ${clientId} is done.`);
                    }).catch((error: Error) => {
                        this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
                    });
                })
                .catch((error: Error) => {
                    //Connection is rejected
                    connection.close((new Protocol.ResponseHandshake({
                        clientId: clientId,
                        allowed: false,
                        reason: Protocol.Reasons.FAIL_AUTH,
                        error: error.message
                    })).getStr()).then(() => {
                        this._logger.env(`Authorization of connection for ${clientId} is failed die error: ${error.message}`);
                    }).catch((error: Error) => {
                        this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
                    });
                });
        }
        //Pending connnection
        if (message instanceof Protocol.RequestPending) {
            connection.setClientGUID(clientId);
            connection.on(Connection.EVENTS.onAborted, this._onAbortedPendingConnection);
            this._pending.add(clientId, connection);
            return this._logger.env(`Pending connection for ${clientId} is accepted.`);
        }
        //Subscribe to event
        if (message instanceof Protocol.SubscribeRequest) {
            return connection.close((new Protocol.SubscribeResponse({
                clientId: clientId,
                protocol: message.protocol,
                signature: message.signature,
                status: this._subscriptions.subscribe(
                    message.protocol,
                    message.signature,
                    clientId
                )
            })).setToken(token).getStr()).then(() => {
                this._logger.env(`Subscription for client ${clientId} to protocol ${message.protocol}, event ${message.signature} is done.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        //Unsubscribe event
        if (message instanceof Protocol.UnsubscribeRequest) {
            return connection.close((new Protocol.UnsubscribeResponse({
                clientId: clientId,
                protocol: message.protocol,
                signature: message.signature,
                status: this._subscriptions.unsubscribe(
                    clientId,
                    message.protocol,
                    message.signature
                )
            })).setToken(token).getStr()).then(() => {
                this._logger.env(`Unsubscription for client ${clientId} to protocol ${message.protocol}, event ${message.signature} is done.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        //Unsubscribe all event
        if (message instanceof Protocol.UnsubscribeAllRequest) {
            return connection.close((new Protocol.UnsubscribeAllResponse({
                clientId: clientId,
                protocol: message.protocol,
                status: this._subscriptions.unsubscribe(
                    clientId,
                    message.protocol
                )
            })).setToken(token).getStr()).then(() => {
                this._logger.env(`Unsubscription for client ${clientId} to protocol ${message.protocol}, all events is done.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
            });
        }
        //Trigger event
        if (message instanceof Protocol.EventRequest) {
            const subscribers = this._subscriptions.get(message.protocol, message.signature);
            //Add tasks
            subscribers.forEach((clientId: string) => {
                this._tasks.add(this._emitClientEvent.bind(this, message.protocol, message.signature, message.body, clientId, token), clientId);
            });
            //Execute tasks
            this._tasks.procced();
            return connection.close((new Protocol.EventResponse({
                clientId: clientId,
                subscribers: subscribers.length,
                eventId: message.eventId
            })).setToken(token).getStr()).then(() => {
                this._logger.env(`Emit event from client ${clientId} for event protocol ${message.protocol}, event ${message.signature} is done for ${subscribers.length} subscribers.`);
            }).catch((error: Error) => {
                this._logger.warn(`Fail emit event from client ${clientId} for event protocol ${message.protocol}, event ${message.signature} due error: ${error.message}.`);
            });
        }
    }

    private _onAbortedPendingConnection(connection: Connection){
        //Pending connection is aborted => client is disconnected
        const clientId = connection.getClientGUID();
        if (clientId === null) {
            this._logger.error(`Pending connection is aborted, but connection doesn't have clientId`);
            return;
        }
        //Remove from storage
        this._pending.delete(clientId);
        //Remove related tasks
        this._tasks.drop(clientId);
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
            connection.close((new Protocol.IncomeEvent({
                signature: event,
                protocol: protocol,
                body: body,
                clientId:clientId
            })).setToken(token).getStr()).then(() => {
                this._logger.env(`Emit event for client ${clientId}: protocol ${protocol}, event ${event} is done.`);
                resolve();
            }).catch((error: Error) => {
                this._logger.warn(`Fail to emit event for client ${clientId}: protocol ${protocol}, event ${event} due error: ${error.message}.`);
            });
        });
    }

    private _logState(){
        this._logger.debug(`    [server state]: connections = ${this._pending.getInfo()}; subcribers = ${this._subscriptions.getInfo()}; tasks in queue: ${this._tasks.getTasksCount()}.`);
        setTimeout(() => {
            this._logState();
        }, 1000);
    }
}