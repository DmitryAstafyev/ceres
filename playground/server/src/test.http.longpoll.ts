import * as Transports from '../../../server/src/transports/index';
import * as Enums from '../../../common/platform/enums/index';
import * as Tools from '../../../common/platform/tools/index';

export default function test(){
    const logger = new Tools.Logger('HTTPLongpollServerTest');
    logger.info(`Create parameters for test.`)
    const parameters = new Transports.HTTPLongpoll.ConnectionParameters({
        port: 3005
    });
    logger.info(`Creating server with:`, parameters);
    const HTTPLongpoll = new Transports.HTTPLongpoll.Server(parameters);
    logger.info(`Server is created on: "localhost:${parameters.port}".`);
}
