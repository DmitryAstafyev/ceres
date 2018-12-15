import * as Tools from '../../platform/tools/index';
import { Connection } from './server.connection';
import { ServerState } from './server.state';

export abstract class MessageProcessor<T> extends Tools.EventEmitter {

    public state: ServerState;

    protected _logger: Tools.Logger;

    constructor(name: string, state: ServerState) {
        super({ strict: true });
        this._logger = new Tools.Logger(`Message.Processor:${name}`);
        this.state = state;
    }

    public abstract process(connection: Connection, message: T): Promise<void>;

    public abstract drop(): Promise<void>;

}
