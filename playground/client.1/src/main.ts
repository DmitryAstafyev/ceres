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

enum EIndicators {
    connected = 'connected',
    disconnected = 'disconnected',
    subscribeBroadcast = 'subscribeBroadcast',
    subscribeTrageted = 'subscribeTrageted',
    subscribeServerEvent = 'subscribeServerEvent',
    catchBroadcast = 'catchBroadcast',
    catchTargeted = 'catchTargeted',
    catchServerEvent = 'catchServerEvent',
    getDemand = 'getDemand',
    registerAlias = 'registerAlias',
    subscribeAsRespondent = 'subscribeAsRespondent',
    unsubscribeAsRespondent = 'unsubscribeAsRespondent'
};

const PARAMS = {
    ws: {
        host: 'http://{sub[1..200]}.localhost',
        port: 3005,
        wsHost: 'ws://localhost',
        wsPort: 3005
    },
    longpoll: {
        host: 'http://{sub[1..200]}.localhost',
        port: 3005,
    }
};
export default class Test {

    private _output: Output = new Output('Client.1');
    private _switcher: Switcher;
    private _defaultTransport: string = Switcher.Transports.ws;
    private _transport: TransportWS | TransportLP | undefined;
    private _consumer: Consumer | undefined;
    private _greetingMessageTimer: number = -1;
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
        this._bindTestProtocol();
        this._indicators.add(EIndicators.connected, 'Connection');
        this._indicators.add(EIndicators.disconnected, 'Disconnection');
        this._indicators.add(EIndicators.subscribeBroadcast, 'Subscribe to broadcast evennt');
        this._indicators.add(EIndicators.subscribeTrageted, 'Subscribe to targeted event');
        this._indicators.add(EIndicators.subscribeServerEvent, 'Subscribe to server event');
        this._indicators.add(EIndicators.catchBroadcast, 'Catch broadcast event');
        this._indicators.add(EIndicators.catchTargeted, 'Catch targeted event');
        this._indicators.add(EIndicators.catchServerEvent, 'Catch server event');
        this._indicators.add(EIndicators.getDemand, 'Get demand');
        this._indicators.add(EIndicators.registerAlias, 'Register aliases of client');
        this._indicators.add(EIndicators.subscribeAsRespondent, 'Register as respondent');
        this._indicators.add(EIndicators.unsubscribeAsRespondent, 'Unregister as respondent');
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
    // Transprt events: subscription
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
        this._consumer.subscribe(Consumer.Events.connected, this._onConnected);
        this._consumer.subscribe(Consumer.Events.disconnected, this._onDisconnected);
        this._consumer.subscribe(Consumer.Events.error, this._onError);
    }

    private _unsubsribeTransportEvents(){
        if (this._consumer === undefined) {
            return;
        }
        this._consumer.unsubscribe(Consumer.Events.connected, this._onConnected);
        this._consumer.unsubscribe(Consumer.Events.disconnected, this._onDisconnected);
        this._consumer.unsubscribe(Consumer.Events.error, this._onError);
    }
    
    //////////////////////////////////////////////////////////////////////////////////////////////
    // Transprt events: handlers
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _onConnected(){
        this._output.add(`Connected`);
        this._subscribeTestProtocol();
        this._subscribeTargetedTestProtocol();
        this._subscribeToServerEvent();
        this._subscribeAsRespondent();
        this._refClient();
        this._testDoneHandler(EClientTests.connection);
        this._indicators.state(EIndicators.connected, Indicators.States.success);
        this._indicators.increase(EIndicators.connected);
   }

    private _onDisconnected(){
        this._output.add(`Client is disconnected.`, { color: 'rgb(255,255,0)'});
        this._unsubscribeTestProtocol();
        this._unsubscribeTargetedTestProtocol();
        this._unsubscribeToServerEvent();
        this._unsubscribeAsRespondent();
        this._testDoneHandler(EClientTests.disconnection);
        this._indicators.state(EIndicators.disconnected, Indicators.States.success);
        this._indicators.increase(EIndicators.disconnected);
    }

    private _onError(error: any){
        this._output.add(`Error: ${error.message}; reason: ${error.reason}`, { color: 'rgb(255,0,0)'});
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Tests protocol: subscriptions
    //////////////////////////////////////////////////////////////////////////////////////////////

    private _bindTestProtocol(){
        this._onTestProtocolGreeting = this._onTestProtocolGreeting.bind(this);
        this._onTargetedTestProtocolGreeting = this._onTargetedTestProtocolGreeting.bind(this);
        this._onServerEvent = this._onServerEvent.bind(this);
        this._demandOnlineHandler = this._demandOnlineHandler.bind(this);
    }

    private _subscribeTestProtocol(){
        if (this._consumer === undefined) {
            return;
        }
        this._consumer.subscribeEvent(Protocol.Events.Ping, Protocol, this._onTestProtocolGreeting)
            .then((res) => {
                this._testDoneHandler(EClientTests.subscribeBroadcastEvent);
                this._output.add(`Subscription to ${Protocol.Events.Ping.name} was done. Subscription response: ${Tools.inspect(res)}`, { color: 'rgb(200,200,200)'});
                this._indicators.state(EIndicators.subscribeBroadcast, Indicators.States.success);
                this._indicators.increase(EIndicators.subscribeBroadcast);
            })
            .catch((e) => {
                this._testFailHandler(EClientTests.subscribeBroadcastEvent);
                this._output.add(`Error to subscribe to ${Protocol.Events.Ping.name}: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
                this._indicators.state(EIndicators.subscribeBroadcast, Indicators.States.fail);
            });
    }

    private _unsubscribeTestProtocol(){
        if (this._consumer === undefined) {
            return;
        }
        this._consumer.unsubscribeEvent(Protocol.Events.Ping, Protocol)
            .then((res) => {
                this._testDoneHandler(EClientTests.unsubscribeBroadcastEvent);
                this._output.add(`Unsubscription from ${Protocol.Events.Ping.name} was done. Unsubscription response: ${Tools.inspect(res)}`, { color: 'rgb(50,50,250)'});
            })
            .catch((e) => {
                this._testFailHandler(EClientTests.unsubscribeBroadcastEvent);
                this._output.add(`Error to unsubscribe to ${Protocol.Events.Ping.name}: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
            });
    }

    private _subscribeTargetedTestProtocol(){
        if (this._consumer === undefined) {
            return;
        }
        this._consumer.subscribeEvent(Protocol.Events.TargetedPing, Protocol, this._onTargetedTestProtocolGreeting)
            .then((res) => {
                this._testDoneHandler(EClientTests.subscribeTargetedEvent);
                this._output.add(`Subscription to ${Protocol.Events.TargetedPing.name} was done. Subscription response: ${Tools.inspect(res)}`, { color: 'rgb(200,200,200)'});
                this._indicators.state(EIndicators.subscribeTrageted, Indicators.States.success);
                this._indicators.increase(EIndicators.subscribeTrageted);
            })
            .catch((e) => {
                this._testFailHandler(EClientTests.subscribeTargetedEvent);
                this._output.add(`Error to subscribe to ${Protocol.Events.TargetedPing.name}: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
                this._indicators.state(EIndicators.subscribeTrageted, Indicators.States.fail);
            });
    }

    private _unsubscribeTargetedTestProtocol(){
        if (this._consumer === undefined) {
            return;
        }
        this._consumer.unsubscribeEvent(Protocol.Events.TargetedPing, Protocol)
            .then((res) => {
                this._testDoneHandler(EClientTests.unsubscribeTargetedEvent);
                this._output.add(`Unsubscription from ${Protocol.Events.TargetedPing.name} was done. Unsubscription response: ${Tools.inspect(res)}`, { color: 'rgb(50,50,250)'});
            })
            .catch((e) => {
                this._testFailHandler(EClientTests.unsubscribeTargetedEvent);
                this._output.add(`Error to unsubscribe to ${Protocol.Events.TargetedPing.name}: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
            });
    }

    private _subscribeToServerEvent(){
        if (this._consumer === undefined) {
            return;
        }
        this._consumer.subscribeEvent(Protocol.Events.EventFromServer, Protocol, this._onServerEvent)
            .then((res) => {
                this._testDoneHandler(EClientTests.subscribeServerEvent);
                this._output.add(`Subscription to ${Protocol.Events.EventFromServer.name} was done. Subscription response: ${Tools.inspect(res)}`, { color: 'rgb(200,222,222)'});
                this._indicators.state(EIndicators.subscribeServerEvent, Indicators.States.success);
                this._indicators.increase(EIndicators.subscribeServerEvent);
            })
            .catch((e) => {
                this._testFailHandler(EClientTests.subscribeServerEvent);
                this._output.add(`Error to subscribe to ${Protocol.Events.EventFromServer.name}: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
                this._indicators.state(EIndicators.subscribeServerEvent, Indicators.States.fail);
            });
    }

    private _unsubscribeToServerEvent(){
        if (this._consumer === undefined) {
            return;
        }
        this._consumer.unsubscribeEvent(Protocol.Events.EventFromServer, Protocol)
            .then((res) => {
                this._testDoneHandler(EClientTests.unsubscribeServerEvent);
                this._output.add(`Unsubscription from ${Protocol.Events.EventFromServer.name} was done. Unsubscription response: ${Tools.inspect(res)}`, { color: 'rgb(50,50,250)'});
            })
            .catch((e) => {
                this._testFailHandler(EClientTests.unsubscribeServerEvent);
                this._output.add(`Error to unsubscribe to ${Protocol.Events.EventFromServer.name}: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
            });
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Tests protocol: ref to aliases
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _refClient() {
        // Default #name=Bred;group=artist
        const hash: string = (typeof location.hash === 'string' ? location.hash : '').replace('#', '');
        const nameMatch = hash.match(/name=\w*/gi);
        const groupMatch = hash.match(/group=\w*/gi);
        const aliases: { [key: string]: string} = {
            name: nameMatch !== null ? (nameMatch.length === 1 ? nameMatch[0].replace('name=', '') : 'name') : 'name',
            group: groupMatch !== null ? (groupMatch.length === 1 ? groupMatch[0].replace('group=', '') : 'group') : 'group'
        };
        if (this._consumer === undefined) {
            return;
        }
        this._consumer.ref(aliases)
            .then((res) => {
                this._testDoneHandler(EClientTests.clientSetRef);
                this._output.add(`Ref client to "${aliases.name} / ${aliases.group}" was done. Response: ${Tools.inspect(res)}`, { color: 'rgb(50,50,250)'});
                this._indicators.state(EIndicators.registerAlias, Indicators.States.success);
                this._indicators.increase(EIndicators.registerAlias);
            })
            .catch((e) => {
                this._testFailHandler(EClientTests.clientSetRef);
                this._output.add(`Error to ref client due error: ${Tools.inspect(e)}`, { color: 'rgb(255,0,0)'});
                this._indicators.state(EIndicators.registerAlias, Indicators.States.fail);
            });
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Tests protocol: handlers
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _onTestProtocolGreeting(event: Protocol.Events.Ping){
        const color: string = typeof event.message === 'string' ? (event.message.indexOf('Bred') !== -1 ? 'rgb(170, 236, 236)' : 'rgb(170, 170, 236)') : 'rgb(170, 170, 236)';
        this._output.add(`get event: ${Tools.inspect(event)}`, { color: color});
        this._testDoneHandler(EClientTests.catchBroadcastEvent);
        this._indicators.state(EIndicators.catchBroadcast, Indicators.States.success);
        this._indicators.increase(EIndicators.catchBroadcast);
    }

    private _onTargetedTestProtocolGreeting(event: Protocol.Events.TargetedPing){
        const color: string = typeof event.message === 'string' ? (event.message.indexOf('Bred') !== -1 ? 'rgb(170, 236, 236)' : 'rgb(170, 170, 236)') : 'rgb(170, 170, 236)';
        this._output.add(`get event: ${Tools.inspect(event)}`, { color: color});
        this._testDoneHandler(EClientTests.catchTargetedEvent);
        this._indicators.state(EIndicators.catchTargeted, Indicators.States.success);
        this._indicators.increase(EIndicators.catchTargeted);
    }

    private _onServerEvent(event: Protocol.Events.EventFromServer){
        this._output.add(`get server event: ${Tools.inspect(event)}`, { color: 'rgb(200, 222, 247)'});
        this._testDoneHandler(EClientTests.catchServerEvent);
        this._indicators.state(EIndicators.catchServerEvent, Indicators.States.success);
        this._indicators.increase(EIndicators.catchServerEvent);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Tests protocol: demands
    //////////////////////////////////////////////////////////////////////////////////////////////
    private _subscribeAsRespondent() {
        if (this._consumer === undefined) {
            return;
        }
        this._consumer.subscribeToRequest(Protocol, Protocol.Requests.IsOnlineClient.Request, { type: 'online'}, this._demandOnlineHandler).then(() => {
            this._output.add(`client is subscribed as respontent to: ${Tools.inspect(Protocol.Requests.IsOnlineClient.Request.getSignature())}`, { color: 'rgb(50,50,250)' });
            this._testDoneHandler(EClientTests.subscribeAsRespondent);
            this._indicators.state(EIndicators.subscribeAsRespondent, Indicators.States.success);
            this._indicators.increase(EIndicators.subscribeAsRespondent);
        }).catch((error: Error) => {
            this._output.add(`Error to subscribe as respondent due error: ${error.message}`, { color: 'rgb(255,0,0)'});
            this._testFailHandler(EClientTests.subscribeAsRespondent);
            this._indicators.state(EIndicators.subscribeAsRespondent, Indicators.States.fail);
        });
    }

    private _unsubscribeAsRespondent() {
        if (this._consumer === undefined) {
            return;
        }
        this._consumer.unsubscribeToRequest(Protocol, Protocol.Requests.IsOnlineClient.Request).then(() => {
            this._output.add(`client is unsubscribed as respontent to: ${Tools.inspect(Protocol.Requests.IsOnlineClient.Request.getSignature())}`, { color: 'rgb(50,50,250)' });
            this._testDoneHandler(EClientTests.unsubscribeAsRespondent);
            this._indicators.state(EIndicators.unsubscribeAsRespondent, Indicators.States.success);
            this._indicators.increase(EIndicators.unsubscribeAsRespondent);
        }).catch((error: Error) => {
            this._output.add(`Error to unsubscribe as respondent due error: ${error.message}`, { color: 'rgb(255,0,0)'});
            this._testFailHandler(EClientTests.unsubscribeAsRespondent);
            this._indicators.state(EIndicators.unsubscribeAsRespondent, Indicators.States.fail);
        });
    }

    private _demandOnlineHandler(demand: Protocol.Requests.IsOnlineClient.Request, callback: (error: Error | null, results: Protocol.Requests.IsOnlineClient.Response) => any){
        this._output.add(`client has gotten a demand: ${Tools.inspect(demand.getSignature())}`, { color: 'rgb(50,50,250)' });
        callback(null, new Protocol.Requests.IsOnlineClient.Response({
            since: new Date(),
            message: `yes, I'm here`
        }));
        this._testDoneHandler(EClientTests.processDemand);
        this._indicators.state(EIndicators.getDemand, Indicators.States.success);
        this._indicators.increase(EIndicators.getDemand);
    }
}

const test: Test = new Test();