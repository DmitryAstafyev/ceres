import * as DescMiddleware from '../../infrastructure/middleware/implementation';
import * as Tools from '../../platform/tools/index';
import * as DescConnection from './connection/index';
import { Connection } from './server.connection';
import { ProcessorConnections } from './server.processor.connections';
import { ProcessorDemands } from './server.processor.demands';
import { ProcessorEvents } from './server.processor.events';
import { Tokens } from './server.tokens';

export class ServerState extends Tools.EventEmitter {

    public middleware: DescMiddleware.Middleware<Connection>;
    public parameters: DescConnection.ConnectionParameters;

    public tokens: Tokens ;
    public protocols: Tools.ProtocolsHolder;

    public processors: {
        connections: ProcessorConnections,
        demands: ProcessorDemands,
        events: ProcessorEvents,
    };

    constructor(
        parameters: DescConnection.ConnectionParameters,
        middleware: DescMiddleware.Middleware<Connection>,
    ) {
        super();
        this.middleware = middleware;
        this.parameters = parameters;
        this.tokens = new Tokens(this.parameters.getTokenLife());
        this.protocols = new Tools.ProtocolsHolder();
        this.processors = {
            connections: new ProcessorConnections(this),
            demands: new ProcessorDemands(this),
            events: new ProcessorEvents(this),
        };
    }

}
