import * as Tools from '../platform/tools/index';
import * as Protocol from '../protocols/connection/protocol.connection';

export type TSender = (data: string) => Promise<void>;

export type TClientRequests =
                        Protocol.Message.Reconnection.Request |
                        Protocol.Message.Event.Request |
                        Protocol.Message.Subscribe.Request |
                        Protocol.Message.Unsubscribe.Request |
                        Protocol.Message.UnsubscribeAll.Request |
                        Protocol.Message.Registration.Request |
                        Protocol.Message.Demand.FromExpectant.Request |
                        Protocol.Message.Demand.FromRespondent.Request |
                        Protocol.Message.Respondent.Bind.Request |
                        Protocol.Message.Respondent.Unbind.Request;

export default abstract class ATransport<ConnectionParameters, Middleware> extends Tools.EventEmitter {

    public static EVENTS = {
        /**
         * @event created Transport is created
         */
        created: 'created',

        /**
         * @event destroyed Transport is destroyed
         */
        destroyed: 'destroyed',

        /**
         * @event disconnected Client is disconnected
         * @argument clientId {string} ID of disconneted client
         */
        disconnected: 'disconnected',

        /**
         * @event error Error on transport
         * @argument error {Error}
         */
        error: 'error',

        /**
         * @event message Message comes from client
         * @argument message {TClientRequests} client message
         * @argument sender {TSender} sender data to client
         */
        message: 'message',

        /**
         * @event updated State of client is updated
         * @argument clientId {string} ID of updated client
         */
        updated: 'updated',
    };

    public parameters: ConnectionParameters;
    public middleware: Middleware | undefined;

    constructor(parameters: ConnectionParameters, middleware?: Middleware) {
        super();
        this.parameters = parameters;
        this.middleware = middleware;
    }

    public abstract create(): Promise<any>;
    public abstract destroy(): Promise<any>;
    public abstract send(clientId: string, data: string): Promise<void>;
    public abstract isConnected(clientId: string): boolean;
    public abstract isAvailable(clientId: string): boolean;
    public abstract getInfo(): string;

}
