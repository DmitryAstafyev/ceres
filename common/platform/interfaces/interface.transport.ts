import * as Tools from '../tools/index';

export interface ITransportInterface {
    
    eventEmit               : (event: any, protocol: any, aliases?: TClientAlias ) => Promise<any>;
    subscribeEvent          : (event: any, protocol: any, handler: Function) => Promise<any>;
    unsubscribeEvent        : (event: any, protocol: any) => Promise<any>;
    unsubscribeAllEvents    : (protocol: any) => Promise<any>;
    request                 : (request: any, protocol?: any) => Promise<any>;    
}

export type TClientAlias = { [key: string]: string };

export const TransportInterfaceDesc = {
    event: Tools.EPrimitiveTypes.function,
    request: Tools.EPrimitiveTypes.function
}