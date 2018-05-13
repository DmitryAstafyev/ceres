import * as Tools from '../tools/index';

export interface ITransportInterface {
    
    sendEvent: (protocolSignature: string, body: string) => Promise<any>;
    sendRequest: (protocolSignature: string, body: string) => Promise<any>;
    
}

export const TransportInterfaceDesc = {
    sendEvent: Tools.EPrimitiveTypes.function,
    sendRequest: Tools.EPrimitiveTypes.function
}