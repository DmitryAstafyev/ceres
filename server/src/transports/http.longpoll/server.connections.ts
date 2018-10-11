import { Connection } from './server.connection';

import * as Protocol from '../../protocols/connection/protocol.connection';

export class Connections {

    private _connections: Map<string, Connection[]> = new Map();

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
                    return connection.close((new Protocol.Disconnect({
                        message: 'Closing all pending requests.',
                        reason: Protocol.Disconnect.Reasons.SHUTDOWN,
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

    public delete(clientId: string) {
        this._connections.delete(clientId);
    }

    public getInfo(): string {
        const info: string[] = [];
        this._connections.forEach((connections: Connection[], clientId: string) => {
            info.push(`\t\tclientId: "${clientId}" has ${connections.length} connections`);
        });
        return info.join(';\n');
    }

}
