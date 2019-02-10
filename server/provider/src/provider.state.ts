import * as Tools from './platform/tools/index';
import * as Protocol from './protocols/connection/protocol.connection';
import { Aliases, TAlias } from './provider.aliases';
import { ProcessorDemands } from './provider.processor.demands';
import { ProcessorEvents } from './provider.processor.events';
import { Queue } from './provider.queue';
import ATransport from './transports/transport.abstract';

export class ProviderState extends Tools.EventEmitter {

    private _transport: ATransport<any, any>;
    private _protocols: Tools.ProtocolsHolder;
    private _demands: ProcessorDemands;
    private _events: ProcessorEvents;
    private _tasks: Queue;
    private _aliases: Aliases;

    public get transport(): ATransport<any, any> {
        return this._transport;
    }

    public get protocols(): Tools.ProtocolsHolder {
        return this._protocols;
    }

    public get demands(): ProcessorDemands {
        return this._demands;
    }

    public get events(): ProcessorEvents {
        return this._events;
    }

    public get tasks(): Queue {
        return this._tasks;
    }

    public get aliases(): Aliases {
        return this._aliases;
    }

    constructor(transport: ATransport<any, any>) {
        super();
        this._transport = transport;
        this._protocols = new Tools.ProtocolsHolder();
        this._demands = new ProcessorDemands(this);
        this._events = new ProcessorEvents(this);
        this._tasks = new Queue(transport);
        this._aliases = new Aliases();
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

}
