import * as Transports from '../../../server/src/transports/index';
import * as Tools from '../../../common/platform/tools/index';
import * as Protocol from '../../protocol/protocol.playground';

export default function test(){
    const logger = new Tools.Logger('HTTPLongpollServerTest');
    logger.info(`Create parameters for test.`)
    const parameters = new Transports.HTTPLongpoll.ConnectionParameters({
        port: 3005
    });
    logger.info(`Creating server with:`, parameters);
    const HTTPLongpoll = new Transports.HTTPLongpoll.Server(parameters);
    HTTPLongpoll.subscribeToRequest(
        Protocol,
        Protocol.Requests.IsOnlineServer.Request,
        { type: 'online'},
        (demand: Protocol.Requests.IsOnlineServer.Request, callback: (error: Error | null, results: Protocol.Requests.IsOnlineServer.Response) => any) => {
            logger.info(`HTTP.Longpoll transport test: client has gotten a demand: ${Tools.inspect(demand.getSignature())}`);
            callback(null, new Protocol.Requests.IsOnlineServer.Response({
                since: new Date(),
                message: `this server response`
            }));
        }
    );
    logger.info(`Server is created on: "localhost:${parameters.port}".`);
    HTTPLongpoll.subscribeToEvent(Protocol, Protocol.Events.EventToServer, (event: Protocol.Events.EventToServer) => {
        logger.info(`Server has gotten event: ${event.stringify()}`);
    });
    function sendServerEvent() {
        HTTPLongpoll.emitEvent(Protocol, new Protocol.Events.EventFromServer({
            timestamp: new Date(),
            message: 'This is event from serve'
        })).then((count: number) => {
            logger.info(`Server event was sent to ${count} subscribers`);
            setTimeout(sendServerEvent, 2500);
        }).catch((error: Error) => {
            logger.error(`Fail to emit server event due error: ${error.message}`);
        });
    }
    sendServerEvent();
}
