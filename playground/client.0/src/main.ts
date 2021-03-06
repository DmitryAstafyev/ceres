import * as Tools from '../../../common/platform/tools/index';
import * as Protocol from '../../protocol/protocol.playground';
import { Output } from '../../client.common/output';
import { Indicators } from '../../client.common/indicators';
import { Switcher } from '../../client.common/switcher';

import { TTestStates, EClientTests } from '../../client.common/client.tests.desc';

import TransportWS from 'ceres.consumer.browser.ws';
import TransportLP from 'ceres.consumer.browser.longpoll';
import { ConnectionParameters as ConnectionParametersWS } from 'ceres.consumer.browser.ws';
import { ConnectionParameters as ConnectionParametersLP } from 'ceres.consumer.browser.longpoll';

import Consumer from 'ceres.consumer';

const PARAMS = {
    ws: {
        host: 'http://{sub1,sub2,sub3}.localhost',
        port: 3005,
        wsHost: 'ws://localhost',
        wsPort: 3005,
    },
    longpoll: {
        host: 'http://{sub1,sub2,sub3}.localhost',
        port: 3005,
    }
};

export default class Test {

    private _output: Output = new Output('Client.0');
    private _switcher: Switcher;
    private _defaultTransport: string = Switcher.Transports.ws;
    private _transport: TransportWS | TransportLP | undefined;
    private _consumer: Consumer | undefined;
    private _greetingMessageTimer: any = -1;
    private _targetMessageTimer: any = -1;
    private _serverEventTimer: any = -1;
    private _demandClientMessageTimer: any = -1;
    private _demandServerMessageTimer: any = -1;
    private _testDoneHandler: (test: EClientTests) => void;
    private _testFailHandler: (test: EClientTests) => void;
    private _indicators: Indicators = new Indicators();

    constructor(
        testDoneHandler: (test: EClientTests) => void = (test: EClientTests) => void 0, 
        testFailHandler: (test: EClientTests) => void = (test: EClientTests) => void 0){    
        // Add switcher
        this._switcher = new Switcher(this._onTransportSwitch.bind(this));
        // Binding
        this._testDoneHandler = testDoneHandler;
        this._testFailHandler = testFailHandler;
        this._bind();
        this._indicators.add('connection', 'Connection');
        this._indicators.add('disconnection', 'Disconnection');
        this._indicators.add('triggerBroadcastEvent', 'Broadcase event triggered');
        this._indicators.add('triggerTargetEvent', 'Targeted event triggered');
        this._indicators.add('sendClientDemand', 'Demand sent to client');
        this._indicators.add('demandClientResponse', 'Demand response is gotten from client');
        this._indicators.add('sendServerDemand', 'Demand sent to server/host');
        this._indicators.add('triggerServerEvent', 'Sending server event');
        this._indicators.add('demandServerResponse', 'Demand response is gotten from server');
        this._indicators.add('connection', 'Connection');
        this._reinit();
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Transprt switcher
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _onTransportSwitch(transport: string) {
        this._defaultTransport = transport;
        this._reinit();
    }

    private _reinit() {
        if (this._consumer !== undefined) {
            this._unsubsribeTransportEvents();
            (this._consumer as Consumer).destroy();
        }
        switch(this._defaultTransport) {
            case Switcher.Transports.ws:
                this._transport = new TransportWS(new ConnectionParametersWS(PARAMS.ws));
                this._consumer = new Consumer(this._transport);
                break;
            case Switcher.Transports.longpoll:
                this._transport = new TransportLP(new ConnectionParametersLP(PARAMS.longpoll));
                this._consumer = new Consumer(this._transport);
                break;
        }
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
        if (this._consumer === undefined) {
            return;
        }
        this._consumer.on(Consumer.Events.connected, this._onConnected);
        this._consumer.on(Consumer.Events.disconnected, this._onDisconnected);
        this._consumer.on(Consumer.Events.error, this._onError);
    }

    private _unsubsribeTransportEvents(){
        if (this._consumer === undefined) {
            return;
        }
        this._consumer.removeListener(Consumer.Events.connected, this._onConnected);
        this._consumer.removeListener(Consumer.Events.disconnected, this._onDisconnected);
        this._consumer.removeListener(Consumer.Events.error, this._onError);
    }
    
    //////////////////////////////////////////////////////////////////////////////////////////////
    // Transprt events: handlers
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _onConnected(){
        this._testDoneHandler(EClientTests.connection);
        this._output.add(`Connected`);
        this._sendGreetingMessage();
        this._sendTargetMessage();
        this._sendServerEvent();
        this._sendClientDemand();
        this._sendServerDemand();
        this._indicators.state('connection', Indicators.States.success);
        this._indicators.increase('connection');
    }

    private _onDisconnected(){
        this._testDoneHandler(EClientTests.disconnection);
        this._output.add(`Client is disconnected.`, { color: 'rgb(255,255,0)'});
        this._stopSendGreetingMessage();
        this._stopSendTargetMessage();
        this._stopSendServerEvent();
        this._stopSendClientDemand();
        this._stopSendServerDemand();
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
            if (this._consumer === undefined) {
                return;
            }
            this._consumer.emit(greeting)
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
            if (this._consumer === undefined) {
                return;
            }
            this._consumer.emit(greeting, { name: aliases.name, group: aliases.group})
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

    private _sendServerEvent(){
        this._serverEventTimer = setTimeout(() => {
            const serverEvent = new Protocol.Events.EventToServer({
                timestamp: new Date(),
                message: 'Hello server!'
            });
            if (this._consumer === undefined) {
                return;
            }
            this._consumer.emit(serverEvent)
                .then((res) => {
                    this._output.add(`Event sent: ${Tools.inspect(res)}`, { color: 'rgb(200,214,141)'});
                    this._sendServerEvent();
                    this._testDoneHandler(EClientTests.triggerServerEvent);
                    this._indicators.state('triggerServerEvent', Indicators.States.success);
                    this._indicators.increase('triggerServerEvent');
                })
                .catch((e) => {
                    this._output.add(`Error: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
                    this._sendGreetingMessage();
                    this._testFailHandler(EClientTests.triggerServerEvent);
                    this._indicators.state('triggerServerEvent', Indicators.States.fail);
                });
            
        }, 2000);
    }

    private _stopSendServerEvent(){
        if (this._serverEventTimer === -1){
            return;
        }
        clearTimeout(this._serverEventTimer);
        this._serverEventTimer = -1;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Transprt client demands: handlers
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _sendClientDemand(){
        this._demandClientMessageTimer = setTimeout(() => {
            const demand = new Protocol.Requests.IsOnlineClient.Request({
                sent: new Date()
            });
            this._indicators.state('sendClientDemand', Indicators.States.success);
            this._indicators.increase('sendClientDemand');
            const failtimer = setTimeout(() => {
                this._indicators.state('demandClientResponse', Indicators.States.fail);
            }, 5000);
            if (this._consumer === undefined) {
                return;
            }
            this._consumer.request(demand, Protocol.Requests.IsOnlineClient.Response, { type: 'online'}, { pending: true, scope: Consumer.DemandOptions.scope.clients })
                .then((response: Protocol.Requests.IsOnlineClient.Response) => {
                    clearTimeout(failtimer);
                    this._output.add(`On client request has gotten response: ${Tools.inspect(response)}`, { color: 'rgb(100,250,70)'});
                    this._sendClientDemand();
                    this._testDoneHandler(EClientTests.getClientDemandResponse);
                    this._indicators.state('demandClientResponse', Indicators.States.success);
                    this._indicators.increase('demandClientResponse');
                })
                .catch((e) => {
                    this._output.add(`Error getting response on client demand: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
                    this._sendClientDemand();
                    this._testFailHandler(EClientTests.getClientDemandResponse);
                    this._indicators.state('demandClientResponse', Indicators.States.success);
                });
        }, 1000);
    }

    private _stopSendClientDemand(){
        if (this._demandClientMessageTimer === -1){
            return;
        }
        clearTimeout(this._demandClientMessageTimer);
        this._demandClientMessageTimer = -1;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Transprt server demands: handlers
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _sendServerDemand(){
        this._demandServerMessageTimer = setTimeout(() => {
            const demand = new Protocol.Requests.IsOnlineServer.Request({
                sent: new Date()
            });
            this._indicators.state('sendServerDemand', Indicators.States.success);
            this._indicators.increase('sendServerDemand');
            const failtimer = setTimeout(() => {
                this._indicators.state('demandServerResponse', Indicators.States.fail);
            }, 5000);
            if (this._consumer === undefined) {
                return;
            }
            this._consumer.request(demand, Protocol.Requests.IsOnlineServer.Response, { type: 'online'}, { pending: true, scope: Consumer.DemandOptions.scope.hosts })
                .then((response: Protocol.Requests.IsOnlineServer.Response) => {
                    clearTimeout(failtimer);
                    this._output.add(`On server request has gotten response: ${Tools.inspect(response)}`, { color: 'rgb(100,250,250)'});
                    this._sendServerDemand();
                    this._testDoneHandler(EClientTests.getServerDemandResponse);
                    this._indicators.state('demandServerResponse', Indicators.States.success);
                    this._indicators.increase('demandServerResponse');
                })
                .catch((e) => {
                    this._output.add(`Error getting response on server demand: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
                    this._sendServerDemand();
                    this._testFailHandler(EClientTests.getServerDemandResponse);
                    this._indicators.state('demandServerResponse', Indicators.States.success);
                });
            
        }, 1000);
    }

    private _stopSendServerDemand(){
        if (this._demandServerMessageTimer === -1){
            return;
        }
        clearTimeout(this._demandServerMessageTimer);
        this._demandServerMessageTimer = -1;
    }

}

const test: Test = new Test();