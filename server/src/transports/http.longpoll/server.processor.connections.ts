import * as Tools from '../../platform/tools/index';
import * as Protocol from '../../protocols/connection/protocol.connection';

import { TExecuter } from '../../platform/tools/tools.queue';
import { Aliases, TAlias } from './server.aliases';
import { Connection } from './server.connection';
import { Connections } from './server.connections';
import { ServerState } from './server.state';

export class ProcessorConnections {

    public aliases: Aliases;
    public hooks: Connections;
    public pending: Connections;
    public tasks: Tools.Queue;

    private state: ServerState;
    private _logger: Tools.Logger = new Tools.Logger(`ProcessorConnections`);

    constructor(state: ServerState) {
        this.state = state;
        this.aliases = new Aliases();
        this.hooks = new Connections();
        this.pending = new Connections();
        this.tasks = new Tools.Queue('ProcessorConnectionsTasks');
    }

    public addTask(executer: TExecuter, alias?: string | symbol): symbol | Error {
        return this.tasks.add(executer, alias);
    }

    public proceedTasks() {
        this.tasks.proceed();
    }

    public getPending(clientId: string): Connection | null {
        return this.pending.get(clientId);
    }

    public addPending(clientId: string, connection: Connection) {
        this.pending.add(clientId, connection);
        // Execute tasks
        this.tasks.proceed();
    }

    public addHook(clientId: string, connection: Connection) {
        return this.hooks.add(clientId, connection);
    }

    public refAlias(clientId: string, alias: TAlias) {
        this.aliases.ref(clientId, alias);
    }

    public unrefAlias(clientId: string) {
        this.aliases.unref(clientId);
    }

    public getClientsByAlias(aliases: TAlias | Protocol.KeyValue[]): string[] {
        let convertedAliases: TAlias = {};
        if (aliases instanceof Array) {
            aliases.forEach((pair: Protocol.KeyValue) => {
                convertedAliases[pair.key] = pair.value;
            });
        } else {
            convertedAliases = aliases;
        }
        return this.aliases.get(convertedAliases);
    }

    public isConnected(clientId: string): boolean {
        return this.hooks.has(clientId);
    }

    public disconnect(clientId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.hooks.delete(clientId),
                this.pending.delete(clientId),
                this.state.processors.demands.disconnect(clientId),
                this.state.processors.events.disconnect(clientId),
            ]).then(() => {
                this.tasks.drop(clientId);
                this.aliases.unref(clientId);
                resolve();
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    public drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.tasks.destory().then(() => {
                Promise.all([
                    this.hooks.closeAll(),
                    this.pending.closeAll(),
                ]).then(() => {
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });
    }

    public getInfo(): { pending: number, hooks: number, tasks: number } {
        return {
            hooks: this.hooks.getInfo().size,
            pending: this.pending.getInfo().size,
            tasks: this.tasks.getTasksCount(),
        };
    }
}
