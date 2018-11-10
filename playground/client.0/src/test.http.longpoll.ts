import * as Transports from '../../../client/src/transports/index';
import * as Enums from '../../../common/platform/enums/index';
import * as Tools from '../../../common/platform/tools/index';
import * as Protocol from '../../protocol/protocol.playground';
import { Output } from '../../client.common/output';
import { Indicators } from '../../client.common/indicators';

import { TTestStates, EClientTests } from '../../client.common/client.tests.desc';

export default class Test {

    private _output: Output = new Output('Client.0');
    private _parameters: Transports.HTTPLongpollClient.ConnectionParameters = new Transports.HTTPLongpollClient.ConnectionParameters({
        host: 'http://{sub1,sub2,sub3}.localhost',
        port: 3005
    });
    private _client: Transports.HTTPLongpollClient.Client;
    private _greetingMessageTimer: any = -1;
    private _targetMessageTimer: any = -1;
    private _demandMessageTimer: any = -1;
    private _testDoneHandler: (test: EClientTests) => void;
    private _testFailHandler: (test: EClientTests) => void;
    private _indicators: Indicators = new Indicators();
    constructor(
        testDoneHandler: (test: EClientTests) => void = (test: EClientTests) => void 0, 
        testFailHandler: (test: EClientTests) => void = (test: EClientTests) => void 0){    
        //Create HTTP Longpoll client
        this._client = new Transports.HTTPLongpollClient.Client(this._parameters);
        this._testDoneHandler = testDoneHandler;
        this._testFailHandler = testFailHandler;
        this._bind();
        this._subsribeTransportEvents();
        this._indicators.add('connection', 'Connection');
        this._indicators.add('disconnection', 'Disconnection');
        this._indicators.add('triggerBroadcastEvent', 'Broadcase event triggered');
        this._indicators.add('triggerTargetEvent', 'Targeted event triggered');
        this._indicators.add('sendDemand', 'Demand sent');
        this._indicators.add('demandResponse', 'Demand response is gotten');
        this._indicators.add('connection', 'Connection');
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
        this._testDoneHandler(EClientTests.connection);
        this._output.add(`HTTP.Longpoll transport test: Connected`);
        this._sendGreetingMessage();
        this._sendTargetMessage();
        this._sendDemand();
        this._indicators.state('connection', Indicators.States.success);
        this._indicators.increase('connection');
    }

    private _onDisconnected(){
        this._testDoneHandler(EClientTests.disconnection);
        this._output.add(`Client is disconnected.`, { color: 'rgb(255,255,0)'});
        this._stopSendGreetingMessage();
        this._stopSendTargetMessage();
        this._stopSendDemand();
        this._indicators.state('disconnection', Indicators.States.success);
        this._indicators.increase('disconnection');
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
                    this._testDoneHandler(EClientTests.triggerBroadcastEvent);
                    this._indicators.state('triggerBroadcastEvent', Indicators.States.success);
                    this._indicators.increase('triggerBroadcastEvent');
                })
                .catch((e) => {
                    this._output.add(`Error: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
                    this._sendGreetingMessage();
                    this._testFailHandler(EClientTests.triggerBroadcastEvent);
                    this._indicators.state('triggerBroadcastEvent', Indicators.States.fail);
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
            const hash: string = (typeof location.hash === 'string' ? location.hash : '').replace('#', '');
            const nameMatch = hash.match(/name=\w*/gi);
            const groupMatch = hash.match(/group=\w*/gi);
            const aliases: { [key: string]: string} = {
                name: nameMatch !== null ? (nameMatch.length === 1 ? nameMatch[0].replace('name=', '') : 'name') : 'name',
                group: groupMatch !== null ? (groupMatch.length === 1 ? groupMatch[0].replace('group=', '') : 'group') : 'group'
            };
            const greeting = new Protocol.Events.TargetedPing({
                timestamp: new Date(),
                message: `This is target message for ${aliases.name} / ${aliases.group}`
            });
            
            this._client.eventEmit(greeting, Protocol, { name: aliases.name, group: aliases.group})
                .then((res) => {
                    this._output.add(`Event sent for "${aliases.name} / ${aliases.group}": ${Tools.inspect(res)}`, { color: 'rgb(200,200,200)'});
                    this._sendTargetMessage();
                    this._testDoneHandler(EClientTests.triggerTargetedEvent);
                    this._indicators.state('triggerTargetEvent', Indicators.States.success);
                    this._indicators.increase('triggerTargetEvent');
                })
                .catch((e) => {
                    this._output.add(`Error: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
                    this._sendTargetMessage();
                    this._testFailHandler(EClientTests.triggerTargetedEvent);
                    this._indicators.state('triggerTargetEvent', Indicators.States.fail);
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

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Transprt demands: handlers
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _sendDemand(){
        this._demandMessageTimer = setTimeout(() => {
            const demand = new Protocol.Requests.IsOnline.Request({
                sent: new Date()
            });
            this._indicators.state('sendDemand', Indicators.States.success);
            this._indicators.increase('sendDemand');
            this._client.demand(Protocol, demand, Protocol.Requests.IsOnline.Response, { type: 'online'}, { pending: true })
                .then((response: Protocol.Requests.IsOnline.Response) => {
                    this._output.add(`On request has gotten response: ${Tools.inspect(response)}`, { color: 'rgb(100,250,70)'});
                    this._sendDemand();
                    this._testDoneHandler(EClientTests.getDemandResponse);
                    this._indicators.state('demandResponse', Indicators.States.success);
                    this._indicators.increase('demandResponse');
                })
                .catch((e) => {
                    this._output.add(`Error getting response on demand: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
                    this._sendDemand();
                    this._testFailHandler(EClientTests.getDemandResponse);
                    this._indicators.state('demandResponse', Indicators.States.success);
                });
            
        }, 1000);
    }

    private _stopSendDemand(){
        if (this._demandMessageTimer === -1){
            return;
        }
        clearTimeout(this._demandMessageTimer);
        this._demandMessageTimer = -1;
    }
}