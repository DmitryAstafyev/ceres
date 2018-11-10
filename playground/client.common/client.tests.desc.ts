export type TTestHandler = { [key: string]: Function };
export type TTestStates = { [key: string]: boolean };

export enum EClientTests {
    connection = 'connection',
    disconnection = 'disconnection',
    subscribeBroadcastEvent = 'subscribeBroadcastEvent',
    subscribeTargetedEvent= 'subscribeTargetedEvent',
    unsubscribeBroadcastEvent = 'unsubscribeBroadcastEvent',
    unsubscribeTargetedEvent= 'unsubscribeTargetedEvent',
    triggerBroadcastEvent = 'triggerBroadcastEvent',
    triggerTargetedEvent = 'triggerTargetedEvent',
    catchBroadcastEvent = 'catchBroadcastEvent',
    catchTargetedEvent = 'catchTargetedEvent',
    processDemand = 'processDemand',
    getDemandResponse = 'getDemandResponse',
    clientSetRef = 'clientSetRef',
    subscribeAsRespondent = 'subscribeAsRespondent'
};

export enum EServerTests {
    
};