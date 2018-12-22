export type TTestHandler = { [key: string]: Function };
export type TTestStates = { [key: string]: boolean };

export enum EClientTests {
    connection = 'connection',
    disconnection = 'disconnection',
    subscribeBroadcastEvent = 'subscribeBroadcastEvent',
    subscribeTargetedEvent= 'subscribeTargetedEvent',
    subscribeServerEvent= 'subscribeServerEvent',
    unsubscribeBroadcastEvent = 'unsubscribeBroadcastEvent',
    unsubscribeTargetedEvent= 'unsubscribeTargetedEvent',
    unsubscribeServerEvent= 'unsubscribeServerEvent',
    triggerBroadcastEvent = 'triggerBroadcastEvent',
    triggerTargetedEvent = 'triggerTargetedEvent',
    triggerServerEvent = 'triggerServerEvent',
    catchBroadcastEvent = 'catchBroadcastEvent',
    catchTargetedEvent = 'catchTargetedEvent',
    catchServerEvent = 'catchServerEvent',
    processDemand = 'processDemand',
    getDemandResponse = 'getDemandResponse',
    getServerDemandResponse = 'getServerDemandResponse',
    getClientDemandResponse = 'getClientDemandResponse',
    clientSetRef = 'clientSetRef',
    subscribeAsRespondent = 'subscribeAsRespondent',
    unsubscribeAsRespondent = 'unsubscribeAsRespondent'
};

export enum EServerTests {
    
};