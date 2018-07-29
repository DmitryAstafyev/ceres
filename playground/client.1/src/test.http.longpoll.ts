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

    _serialize(str: string){
        if (typeof str !== 'string') {
            return '';
        }
        return str.replace(/</gi, '&lt').replace(/>/gi, '&gt');
    }

    add(str: string, style?: any) {
        this._setTargetNode();
        if (this.node !== null) {
            const p = document.createElement('P');
            p.innerHTML = `${(new Date).toTimeString()}: ${this._serialize(str)}`;
            Object.assign(p.style, style);
            this.node.appendChild(p);
            p.scrollIntoView();
        }
    }
}

export default class Test {

    private _output: Output = new Output();
    private _parameters: Transports.HTTPLongpollClient.ConnectionParameters = new Transports.HTTPLongpollClient.ConnectionParameters({
        host: 'http://localhost',
        port: 3005,
        type: Enums.ERequestTypes.post
    });
    private _client: Transports.HTTPLongpollClient.Client;
    private _greetingMessageTimer: number = -1;

    constructor(){    
        //Create HTTP Longpoll client
        this._client = new Transports.HTTPLongpollClient.Client(this._parameters);
        this._bind();
        this._bindTestProtocol();
        this._subsribeTransportEvents();
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Transprt events: subscription
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _bind(){
        this._onConnected = this._onConnected.bind(this);
        this._onDisconnected = this._onDisconnected.bind(this);
        this._onError = this._onError.bind(this);
        this._onHeartBeat = this._onHeartBeat.bind(this);
    }

    private _subsribeTransportEvents(){
        this._client.subscribe(Transports.HTTPLongpollClient.Client.EVENTS.connected, this._onConnected);
        this._client.subscribe(Transports.HTTPLongpollClient.Client.EVENTS.disconnected, this._onDisconnected);
        this._client.subscribe(Transports.HTTPLongpollClient.Client.EVENTS.error, this._onError);
        this._client.subscribe(Transports.HTTPLongpollClient.Client.EVENTS.heartbeat, this._onHeartBeat);
    }

    private _unsubsribeTransportEvents(){
        this._client.unsubscribe(Transports.HTTPLongpollClient.Client.EVENTS.connected, this._onConnected);
        this._client.unsubscribe(Transports.HTTPLongpollClient.Client.EVENTS.disconnected, this._onDisconnected);
        this._client.unsubscribe(Transports.HTTPLongpollClient.Client.EVENTS.error, this._onError);
        this._client.unsubscribe(Transports.HTTPLongpollClient.Client.EVENTS.heartbeat, this._onHeartBeat);
    }
    
    //////////////////////////////////////////////////////////////////////////////////////////////
    // Transprt events: handlers
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _onConnected(){
        this._output.add(`HTTP.Longpoll transport test: Connected`);
        this._subscribeTestProtocol();
    }

    private _onDisconnected(){
        this._output.add(`Client is disconnected.`, { color: 'rgb(255,255,0)'});
        this._unsubscribeTestProtocol();
    }

    private _onError(error: any){
        this._output.add(`Error: ${error.message}; reason: ${error.reason}`, { color: 'rgb(255,0,0)'});
    }

    private _onHeartBeat(){
        this._output.add(`Heartbeat...`, { color: 'rgb(150,150,150)'});
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Tests protocol: subscriptions
    //////////////////////////////////////////////////////////////////////////////////////////////

    private _bindTestProtocol(){
        this._onTestProtocolGreeting = this._onTestProtocolGreeting.bind(this);
    }

    private _subscribeTestProtocol(){
        this._client.subscribeEvent(Protocol.EventPing, Protocol, this._onTestProtocolGreeting)
            .then((res) => {
                this._output.add(`Subscription to ${Tools.inspect(Protocol.EventPing)} was done. Subscription response: ${Tools.inspect(res)}`, { color: 'rgb(200,200,200)'});
            })
            .catch((e) => {
                this._output.add(`Error to subscribe to ${Tools.inspect(Protocol.EventPing)}: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
            });
    }

    private _unsubscribeTestProtocol(){
        this._client.unsubscribeEvent(Protocol.EventPing, Protocol)
            .then((res) => {
                this._output.add(`Unsubscription from ${Tools.inspect(Protocol.EventPing)} was done. Unsubscription response: ${Tools.inspect(res)}`, { color: 'rgb(50,50,250)'});
            })
            .catch((e) => {
                this._output.add(`Error to unsubscribe to ${Tools.inspect(Protocol.EventPing)}: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
            });
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Tests protocol: handlers
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _onTestProtocolGreeting(event: Protocol.EventPing){
        this._output.add(`HTTP.Longpoll transport test: get event: ${Tools.inspect(event)}`, { color: 'rgb(170, 170, 236)'});
    }

}

