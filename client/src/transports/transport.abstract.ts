import * as Tools from '../platform/tools/index';
import * as Protocol from '../protocols/connection/protocol.connection';
import { EClientStates, State } from './common/transport.state';

export default abstract class ATransport<ConnectionParameters> extends Tools.EventEmitter {

    public static EVENTS = {
        connected: 'connected',
        disconnected: 'disconnected',
        error: 'error',
        message: 'message',
    };
    public static STATES = EClientStates;

    public parameters: ConnectionParameters;
    public state: State = new State();

    constructor(parameters: ConnectionParameters) {
        super();
        this.parameters = parameters;
    }

    public getState(): EClientStates {
        return this.state.get();
    }

    public abstract connect(): Promise<any>;
    public abstract disconnect(): Promise<any>;
    public abstract send(data: string): Promise<Protocol.TProtocolTypes>;
    public abstract getInfo(): string;
    public abstract getClientId(): string;
    public abstract getClientToken(): string;

}
