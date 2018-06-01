import * as Tools from '../tools/index';

export interface ITransportInterface {
    
    event: (event: any, protocol?: any) => Promise<any>;
    request: (request: any, protocol?: any) => Promise<any>;
    
}

export const TransportInterfaceDesc = {
    event: Tools.EPrimitiveTypes.function,
    request: Tools.EPrimitiveTypes.function
}