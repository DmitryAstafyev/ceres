import * as Transports from '../../../client/src/transports/index';
import * as Enums from '../../../common/platform/enums/index';

export default function test(){
    //Create parameters for HTTP Longpoll client
    const parameters = new Transports.HTTPLongpollClient.ConnectionParameters({
        host: 'http://localhost',
        port: 3003,
        type: Enums.ERequestTypes.post
    });

    //Create HTTP Longpoll client
    const client = new Transports.HTTPLongpollClient.Client(parameters);
}