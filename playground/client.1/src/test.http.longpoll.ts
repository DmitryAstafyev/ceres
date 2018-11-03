import * as Transports from '../../../client/src/transports/index';
import * as Enums from '../../../common/platform/enums/index';
import * as Tools from '../../../common/platform/tools/index';
import * as Protocol from '../../protocol/protocol.playground';
import { Output } from '../../client.common/output';

export default class Test {

    private _output: Output = new Output('Client.1');
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
        this._subscribeAsRespondent();
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
        this._demandOnlineHandler = this._demandOnlineHandler.bind(this);
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

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Tests protocol: demands
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _subscribeAsRespondent() {
        this._client.subscribeToRequest(Protocol, Protocol.Requests.IsOnline.Request, { type: 'online'}, this._demandOnlineHandler).then(() => {
            this._output.add(`HTTP.Longpoll transport test: client is subscribed as respontent to: ${Tools.inspect(Protocol.Requests.IsOnline.Request.getSignature())}`, { color: 'rgb(50,50,250)' });
        }).catch((error: Error) => {
            this._output.add(`Error to subscribe as respondent due error: ${error.message}`, { color: 'rgb(255,0,0)'});
        });
    }

    private _demandOnlineHandler(demand: Protocol.Requests.IsOnline.Request, callback: (error: Error | null, results: Protocol.Requests.IsOnline.Response) => any){
        this._output.add(`HTTP.Longpoll transport test: client has gotten a demand: ${Tools.inspect(demand.getSignature())}`, { color: 'rgb(50,50,250)' });
        callback(null, new Protocol.Requests.IsOnline.Response({
            since: new Date(),
            message: `yes, I'm here`
        }));
    }
}

