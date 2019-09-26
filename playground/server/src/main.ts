import Transport from 'ceres.provider.node.ws';
import { ConnectionParameters } from 'ceres.provider.node.ws';
import Provider from 'ceres.provider';
import * as Tools from '../../../common/platform/tools/index';
import * as Protocol from '../../protocol/protocol.playground';

export default function test(){

    const logger = new Tools.Logger('Provider test');

    logger.info(`Create parameters for test.`)
    
    const parameters = new ConnectionParameters({
        port: 3005,
    });

    const transport = new Transport(parameters);

    logger.info(`Creating server with:`, parameters);

    const provider = new Provider(transport);

    provider.listenRequest(
        Protocol.Requests.IsOnlineServer.Request,
        processDemand,
        { 
            type: 'online',
        },
    );

    logger.info(`Provider is created on: "localhost:${parameters.port}".`);

    provider.subscribe(Protocol.Events.EventToServer, (event: Protocol.Events.EventToServer) => {
        logger.info(`Provider has gotten event: ${event.stringify()}`);
    });

    function processDemand(
        demand: Protocol.Requests.IsOnlineServer.Request,
        clientId: string,
        callback: (error: Error | null, results: Protocol.Requests.IsOnlineServer.Response) => any
    ) {
        logger.info(`Client has gotten a demand: ${Tools.inspect(demand.getSignature())}`);

        callback(null, new Protocol.Requests.IsOnlineServer.Response({
            since: new Date(),
            message: `this provider response`
        }));
    }

    function sendServerEvent() {
        provider.emit(new Protocol.Events.EventFromServer({
            timestamp: new Date(),
            message: 'This is event from serve'
        })).then((count: number) => {
            logger.info(`Provider event was sent to ${count} subscribers`);
            setTimeout(sendServerEvent, 2500);
        }).catch((error: Error) => {
            logger.error(`Fail to emit server event due error: ${error.message}`);
        });
    }

    sendServerEvent();
}

test();
