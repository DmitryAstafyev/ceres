import { Tools } from 'ceres.provider';

import { Connection } from './transport.connection';
import { Connections } from './transport.connections';

export class ProcessorConnections extends Tools.EventEmitter {

    public static EVENTS = {
        disconnected: 'disconnected',
        pending: 'pending',
    };

    public hooks: Connections;
    public pending: Connections;

    private _logger: Tools.Logger = new Tools.Logger(`ProcessorConnections`);

    constructor() {
        super();
        this.hooks = new Connections();
        this.pending = new Connections();
    }

    public send(clientId: string, data: string | Uint8Array): Promise<void> {
        return new Promise((resolve, reject) => {
            const connection: Connection | null = this.pending.get(clientId);
            if (connection === null) {
                return reject(new Error(`No pending connections for client ${clientId}`));
            }
            connection.close(data).then(resolve).catch(reject);
        });
    }

    public addPending(clientId: string, connection: Connection) {
        this.pending.add(clientId, connection);
        // Execute tasks
        this.emit(ProcessorConnections.EVENTS.pending, clientId);
    }

    public addHook(clientId: string, connection: Connection) {
        return this.hooks.add(clientId, connection);
    }

    public disconnect(clientId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.hooks.delete(clientId),
                this.pending.delete(clientId),
            ]).then(() => {
                this.emit(ProcessorConnections.EVENTS.disconnected, clientId);
                resolve();
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    public drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.hooks.closeAll(),
                this.pending.closeAll(),
            ]).then(() => {
                resolve();
            }).catch(reject);
        });
    }

    public getInfo(): { pending: number, hooks: number } {
        return {
            hooks: this.hooks.getInfo().size,
            pending: this.pending.getInfo().size,
        };
    }
}
