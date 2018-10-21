import * as Tools from '../tools/index';

export interface ITransportInterface {

    eventEmit: (event: any, protocol: any, aliases?: TClientAlias ) => Promise<any>;
    subscribeEvent: (event: any, protocol: any, handler: (...args: any[]) => any) => Promise<any>;
    unsubscribeEvent: (event: any, protocol: any) => Promise<any>;
    unsubscribeAllEvents: (protocol: any) => Promise<any>;
    demand: (protocol: any, demand: any, expected: any, query: any, options?: any) => Promise<any>;
}

export type TClientAlias = { [key: string]: string };

export const TransportInterfaceDesc = {
    demand: Tools.EPrimitiveTypes.function,
    event: Tools.EPrimitiveTypes.function,
};
