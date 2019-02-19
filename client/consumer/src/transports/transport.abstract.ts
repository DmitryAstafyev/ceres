import * as Tools from '../platform/tools/index';
import * as Protocol from '../protocols/connection/protocol.connection';
import { EClientStates, State } from './common/transport.state';

export default abstract class ATransport<ConnectionParameters, Middleware> extends Tools.EventEmitter {

    public static EVENTS = {
        /**
         * @event connected Client is connected
         */
        connected: 'connected',
        /**
         * @event disconnected Client is disconnected
         */
        disconnected: 'disconnected',
        /**
         * @event error Some error on client side / server side
         * @argument error {Error} error
         */
        error: 'error',
        /**
         * @event message Client has gotten a message
         * @argument message {Protocol.Message.Pending.Response} message from server
         */
        message: 'message',
    };
    public static STATES = EClientStates;

    public parameters: ConnectionParameters;
    public middleware: Middleware | undefined;
    public state: State = new State();

    constructor(parameters: ConnectionParameters, middleware?: Middleware) {
        super();
        this.parameters = parameters;
        this.middleware = middleware;
    }

    public getState(): EClientStates {
        return this.state.get();
    }

    public abstract connect(): Promise<any>;
    public abstract disconnect(): Promise<any>;
    public abstract send(data: any): Promise<Protocol.TProtocolTypes>;
    public abstract getInfo(): string;
    public abstract getClientId(): string;
    public abstract getClientToken(): string;

}
