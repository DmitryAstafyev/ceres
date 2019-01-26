import { Tools } from 'ceres.server.provider';

import * as WebSocket from 'ws';

import { Connection } from './transport.connection';
import { Connections } from './transport.connections';
import { ConnectionParameters } from './transport.parameters.implementation';

interface ISocketInfo {
    socket: WebSocket;
    clientId: string;
    alive: boolean;
}

const HEARTBEAT_DURATION = 30000;

export class ProcessorConnections extends Tools.EventEmitter {

    public static EVENTS = {
        disconnected: 'disconnected',
        message: 'message',
        pending: 'pending',
    };

    public sockets: Map<string, ISocketInfo> = new Map();
    public pending: Connections = new Connections();

    private _logger: Tools.Logger = new Tools.Logger(`ProcessorConnections`);
    private _paramters: ConnectionParameters;

    constructor(parameters: ConnectionParameters) {
        super();
        this._paramters = parameters;
        this._heartbeat();
    }

    public send(clientId: string, data: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof data !== 'string') {
                return reject(new Error(this._logger.error(`Only string can be sent`)));
            }
            if ((this._paramters.wsPackageMaxSize as number) < data.length) {
                // Use HTTP request
                this._sendViaHTTP(clientId, data).then(() => {
                    resolve();
                }).catch((error: Error) => {
                    this._logger.warn(`Fail to send message via HTTP request due error: ${error.message}. Attempt to send via WS.`);
                    this._sendViaWS(clientId, data).then(resolve).catch(reject);
                });
            } else {
                this._sendViaWS(clientId, data).then(resolve).catch(reject);
            }
        });
    }

    public addWebSocket(clientId: string, socket: WebSocket): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.sockets.has(clientId)) {
                return reject(new Error(this._logger.error(`Socket for client ${clientId} is already exist.`)));
            }
            socket.on('close', this._onSocketClose.bind(this, clientId));
            socket.on('message', this._onSocketMessage.bind(this, clientId));
            socket.on('error', this._onSocketError.bind(this, clientId));
            socket.on('pong', this._onPongEvent.bind(this, clientId));
            this.sockets.set(clientId, {
                alive: true,
                clientId: clientId,
                socket: socket,
            });
            resolve();
        });
    }

    public addPending(clientId: string, connection: Connection) {
        this.pending.add(clientId, connection);
        // Execute tasks
        this.emit(ProcessorConnections.EVENTS.pending, clientId);
    }

    public disconnect(clientId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const error: Error | undefined = this._disconnect(clientId);
            if (error) {
                return reject(error);
            }
            this.emit(ProcessorConnections.EVENTS.disconnected, clientId);
            resolve();
        });
    }

    public dropClient(clientId: string) {
        this._removePending(clientId);
        const info: ISocketInfo | undefined = this.sockets.get(clientId);
        if (!info) {
            return;
        }
        this.sockets.delete(clientId);
        info.socket.close(0, `Server disconned this connection`);
    }

    public drop(): Promise<void> {
        return new Promise((resolve) => {
            this.sockets.forEach((info: ISocketInfo) => {
                info.socket.close(0, `Server disconned this connection`);
            });
            this.sockets.clear();
            resolve();
        });
    }

    public getInfo(): { connections: number, pending: number } {
        return {
            connections: this.sockets.size,
            pending: this.pending.getInfo().size,
        };
    }

    private _removePending(clientId: string) {
        const pending: Connection | null = this.pending.get(clientId);
        if (!pending) {
            return;
        }
        pending.close('Force closing connection');
        this.pending.delete(clientId);
    }

    private _sendViaHTTP(clientId: string, data: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const connection: Connection | null = this.pending.get(clientId);
            if (connection === null) {
                return reject(new Error(`No pending connections for client ${clientId}`));
            }
            connection.close(data).then(resolve).catch(reject);
        });
    }

    private _sendViaWS(clientId: string, response: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const info: ISocketInfo | undefined = this.sockets.get(clientId);
            if (info === undefined) {
                return reject(new Error(`No WS connections for client ${clientId}`));
            }
            info.socket.send(response, (error: Error | undefined) => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    }

    private _disconnect(clientId: string): Error | undefined {
        this._removePending(clientId);
        const info: ISocketInfo | undefined = this.sockets.get(clientId);
        if (!info) {
            return new Error(this._logger.error(`Cannot find socket for client ${clientId}. Disconnection is failed.`));
        }
        this.sockets.delete(clientId);
        info.socket.close(0, `Server disconned this connection`);
    }

    private _heartbeat() {
        this.sockets.forEach((info: ISocketInfo, clientId: string) => {
            if (!info.alive) {
                info.socket.terminate();
                this.sockets.delete(clientId);
                return;
            }
            info.alive = false;
            info.socket.ping(() => {
                // Success
            });
        });
        setTimeout(() => {
            this._heartbeat();
        }, HEARTBEAT_DURATION);
    }

    private _onSocketMessage(clientId: string, data: string) {
        this.emit(ProcessorConnections.EVENTS.message, clientId, data);
    }

    private _onPongEvent(clientId: string) {
        const info: ISocketInfo | undefined = this.sockets.get(clientId);
        if (info === undefined) {
            return;
        }
        info.alive = true;
    }

    private _onSocketClose(clientId: string, code: number, reason: string) {
        this._disconnect(clientId);
        this.emit(ProcessorConnections.EVENTS.disconnected, clientId);
    }

    private _onSocketError(clientId: string, error: Error) {
        this._disconnect(clientId);
        this.emit(ProcessorConnections.EVENTS.disconnected, clientId);
    }
}
