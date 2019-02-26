import { Tools } from 'ceres.provider';
import LongpollTransport from './transport';
import { Connection } from './transport.connection';

export abstract class TransportMessageProcessor<T> extends Tools.EventEmitter {

    public transport: LongpollTransport;

    protected _logger: Tools.Logger;

    constructor(name: string, transport: LongpollTransport) {
        super({ strict: true });
        this._logger = new Tools.Logger(`Message.Processor:${name}`);
        this.transport = transport;
    }

    public abstract process(connection: Connection, message: T): Promise<any>;

}
