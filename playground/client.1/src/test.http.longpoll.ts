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
        host: 'http://{sub[1..200]}.localhost',
        port: 3005
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
    }

    private _subsribeTransportEvents(){
        this._client.subscribe(Transports.HTTPLongpollClient.Client.EVENTS.connected, this._onConnected);
        this._client.subscribe(Transports.HTTPLongpollClient.Client.EVENTS.disconnected, this._onDisconnected);
        this._client.subscribe(Transports.HTTPLongpollClient.Client.EVENTS.error, this._onError);
    }

    private _unsubsribeTransportEvents(){
        this._client.unsubscribe(Transports.HTTPLongpollClient.Client.EVENTS.connected, this._onConnected);
        this._client.unsubscribe(Transports.HTTPLongpollClient.Client.EVENTS.disconnected, this._onDisconnected);
        this._client.unsubscribe(Transports.HTTPLongpollClient.Client.EVENTS.error, this._onError);
    }
    
    //////////////////////////////////////////////////////////////////////////////////////////////
    // Transprt events: handlers
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _onConnected(){
        this._output.add(`HTTP.Longpoll transport test: Connected`);
        this._subscribeTestProtocol();
        this._refClient();
    }

    private _onDisconnected(){
        this._output.add(`Client is disconnected.`, { color: 'rgb(255,255,0)'});
        this._unsubscribeTestProtocol();
    }

    private _onError(error: any){
        this._output.add(`Error: ${error.message}; reason: ${error.reason}`, { color: 'rgb(255,0,0)'});
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Tests protocol: subscriptions
    //////////////////////////////////////////////////////////////////////////////////////////////

    private _bindTestProtocol(){
        this._onTestProtocolGreeting = this._onTestProtocolGreeting.bind(this);
    }

    private _subscribeTestProtocol(){
        this._client.subscribeEvent(Protocol.Events.Ping, Protocol, this._onTestProtocolGreeting)
            .then((res) => {
                this._output.add(`Subscription to ${Protocol.Events.Ping.name} was done. Subscription response: ${Tools.inspect(res)}`, { color: 'rgb(200,200,200)'});
            })
            .catch((e) => {
                this._output.add(`Error to subscribe to ${Protocol.Events.Ping.name}: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
            });
    }

    private _unsubscribeTestProtocol(){
        this._client.unsubscribeEvent(Protocol.Events.Ping, Protocol)
            .then((res) => {
                this._output.add(`Unsubscription from ${Protocol.Events.Ping.name} was done. Unsubscription response: ${Tools.inspect(res)}`, { color: 'rgb(50,50,250)'});
            })
            .catch((e) => {
                this._output.add(`Error to unsubscribe to ${Protocol.Events.Ping.name}: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
            });
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Tests protocol: ref to aliases
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _refClient() {
        const hash: string = (typeof location.hash === 'string' ? location.hash : '').replace('#', '');
        const nameMatch = hash.match(/name=\w*/gi);
        const groupMatch = hash.match(/group=\w*/gi);
        const aliases: { [key: string]: string} = {
            name: nameMatch !== null ? (nameMatch.length === 1 ? nameMatch[0].replace('name=', '') : 'name') : 'name',
            group: groupMatch !== null ? (groupMatch.length === 1 ? groupMatch[0].replace('group=', '') : 'group') : 'group'
        };
        this._client.ref(aliases)
            .then((res) => {
                this._output.add(`Ref client to "${aliases.name} / ${aliases.group}" was done. Response: ${Tools.inspect(res)}`, { color: 'rgb(50,50,250)'});
            })
            .catch((e) => {
                this._output.add(`Error to ref client due error: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
            });
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Tests protocol: handlers
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _onTestProtocolGreeting(event: Protocol.Events.Ping){
        const color: string = typeof event.message === 'string' ? (event.message.indexOf('Bred') !== -1 ? 'rgb(170, 236, 236)' : 'rgb(170, 170, 236)') : 'rgb(170, 170, 236)';
        this._output.add(`HTTP.Longpoll transport test: get event: ${Tools.inspect(event)}`, { color: color});
    }

}

