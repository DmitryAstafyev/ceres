import * as Transports from '../../../client/src/transports/index';
import * as Enums from '../../../common/platform/enums/index';
import * as Tools from '../../../common/platform/tools/index';
import * as Protocol from '../../protocol/protocol.playground';

class Output {
    private node: HTMLElement | null = null;

    constructor() {
        this._setTargetNode();
    }

    _setTargetNode() {
        if (this.node === null) {
            this.node = document.querySelector('#output');
        }
    }

    add(str: string, style?: any) {
        this._setTargetNode();
        if (this.node !== null) {
            const p = document.createElement('P');
            p.innerHTML = `${(new Date).toTimeString()}: ${str}`;
            Object.assign(p.style, style);
            this.node.appendChild(p);
            p.scrollIntoView();
        }
    }
}
export default function test(){
    const output = new Output();
    //Create parameters for HTTP Longpoll client
    const parameters = new Transports.HTTPLongpollClient.ConnectionParameters({
        host: 'http://localhost',
        port: 3003,
        type: Enums.ERequestTypes.post
    });

    //Create HTTP Longpoll client
    const client = new Transports.HTTPLongpollClient.Client(parameters);

    client.subscribe(Transports.HTTPLongpollClient.Client.EVENTS.connected, () => {
        output.add(`HTTP.Longpoll transport test: Connected`);
        const greeting = new Protocol.EventPing({
            name: 'Test Client'
        });
        client.eventEmit(greeting, Protocol)
            .then((res) => {
                output.add(`Event sent: ${Tools.inspect(res)}`, { color: 'rgb(200,200,200)'});
            })
            .catch((e) => {
                output.add(`Error: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
            });
    });
    client.subscribe(Transports.HTTPLongpollClient.Client.EVENTS.disconnected, () => {
        output.add(`Client is disconnected.`, { color: 'rgb(255,255,0)'});
    });
    client.subscribe(Transports.HTTPLongpollClient.Client.EVENTS.error, (error: any) => {
        output.add(`Error: ${error.message}; reason: ${error.reason}`, { color: 'rgb(255,0,0)'});
    });
    client.subscribe(Transports.HTTPLongpollClient.Client.EVENTS.heartbeat, () => {
        output.add(`Heartbeat...`, { color: 'rgb(150,150,150)'});
    });

}