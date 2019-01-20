import * as Tools from './platform/tools/index';
import { ProviderState } from './provider.state';
import { TSender } from './transports/transport.abstract';

export abstract class MessageProcessor<T> extends Tools.EventEmitter {

    public state: ProviderState;

    protected _logger: Tools.Logger;

    constructor(name: string, state: ProviderState) {
        super({ strict: true });
        this._logger = new Tools.Logger(`Message.Processor:${name}`);
        this.state = state;
    }

    public abstract process(send: TSender, message: T): Promise<void>;

    public abstract drop(): Promise<void>;

}
