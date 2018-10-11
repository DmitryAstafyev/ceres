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
        host: 'http://{sub1,sub2,sub3}.localhost',
        port: 3005
    });
    private _client: Transports.HTTPLongpollClient.Client;
    private _greetingMessageTimer: number = -1;
    private _targetMessageTimer: number = -1;

    constructor(){    
        //Create HTTP Longpoll client
        this._client = new Transports.HTTPLongpollClient.Client(this._parameters);
        this._bind();
        this._subsribeTransportEvents();
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Transprt events: sunscription
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
        this._sendGreetingMessage();
        this._sendTargetMessage();
    }

    private _onDisconnected(){
        this._output.add(`Client is disconnected.`, { color: 'rgb(255,255,0)'});
        this._stopSendGreetingMessage();
        this._stopSendTargetMessage();
    }

    private _onError(error: any){
        this._output.add(`Error: ${error.message}; reason: ${error.reason}`, { color: 'rgb(255,0,0)'});
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Tests
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _sendGreetingMessage(){
        this._greetingMessageTimer = setTimeout(() => {
            const greeting = new Protocol.Events.Ping({
                timestamp: new Date()
            });
            
            this._client.eventEmit(greeting, Protocol)
                .then((res) => {
                    this._output.add(`Event sent: ${Tools.inspect(res)}`, { color: 'rgb(200,200,200)'});
                    this._sendGreetingMessage();
                })
                .catch((e) => {
                    this._output.add(`Error: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
                    this._sendGreetingMessage();
                });
            
        }, 2000);
    }

    private _stopSendGreetingMessage(){
        if (this._greetingMessageTimer === -1){
            return;
        }
        clearTimeout(this._greetingMessageTimer);
        this._greetingMessageTimer = -1;
    }

    private _sendTargetMessage(){
        this._targetMessageTimer = setTimeout(() => {
            const greeting = new Protocol.Events.Ping({
                timestamp: new Date(),
                message: 'This is target message for Bred Pitt'
            });
            
            this._client.eventEmit(greeting, Protocol, { name: 'Bred', group: 'artist'})
                .then((res) => {
                    this._output.add(`Event sent: ${Tools.inspect(res)}`, { color: 'rgb(200,200,200)'});
                    this._sendTargetMessage();
                })
                .catch((e) => {
                    this._output.add(`Error: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
                    this._sendTargetMessage();
                });
            
        }, 1000);
    }

    private _stopSendTargetMessage(){
        if (this._targetMessageTimer === -1){
            return;
        }
        clearTimeout(this._targetMessageTimer);
        this._targetMessageTimer = -1;
    }
}