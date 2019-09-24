import { Tools, Protocol } from 'ceres.provider';
import { Connection } from './transport.connection';

import * as TransportProtocol from './protocols/transports/httt.longpoll/protocol.transport.longpoll';

export class Connections {

    private _connections: Map<string, Connection[]> = new Map();
    private _logger: Tools.Logger = new Tools.Logger(`Connections`);

    public add(clientId: string, connection: Connection) {
        let connections = this._connections.get(clientId);
        if (!(connections instanceof Array)) {
            connections = [];
        }
        connections.push(connection);
        this._connections.set(clientId, connections);
    }

    public get(clientId: string): Connection | null {
        const connections = this._connections.get(clientId);
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
        const connections = this._connections.get(clientId);
        if (!(connections instanceof Array)) {
            return false;
        }
        return true;
    }
    public closeAll(): Promise<void> {
        return new Promise((resolve, reject) => {
            const tasks: Array<Promise<void>> = [];
            this._connections.forEach((connections: Connection[], clientId: string) => {
                tasks.push(...connections.map((connection: Connection) => {
                    return connection.close((new TransportProtocol.Disconnect({
                        message: 'Closing all pending requests.',
                        reason: TransportProtocol.Disconnect.Reasons.SHUTDOWN,
                    })).stringify() as Protocol.Protocol.TStringifyOutput);
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

    public delete(clientId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const connections: Connection[] | undefined = this._connections.get(clientId);
            if (!(connections instanceof Array)) {
                return resolve();
            }
            connections.forEach((connection: Connection) => {
                connection.close('').catch((error: Error) => {
                    this._logger.error(`Fail to close connection due error: ${error.message}`);
                });
            });
            this._connections.delete(clientId);
            resolve();
        });

    }

    public getInfo(): Map<string, number> {
        const info: Map<string, number> = new Map();
        this._connections.forEach((connections: Connection[], clientId: string) => {
            info.set(clientId, connections.length);
        });
        return info;
    }

}
