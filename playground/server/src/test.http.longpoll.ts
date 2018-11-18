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
        Protocol.Requests.IsOnline.Request,
        { type: 'online'},
        (demand: Protocol.Requests.IsOnline.Request, callback: (error: Error | null, results: Protocol.Requests.IsOnline.Response) => any) => {
            logger.info(`HTTP.Longpoll transport test: client has gotten a demand: ${Tools.inspect(demand.getSignature())}`);
            callback(null, new Protocol.Requests.IsOnline.Response({
                since: new Date(),
                message: `this server response`
            }));
        }
    );
    logger.info(`Server is created on: "localhost:${parameters.port}".`);
}
