export interface IClientInterface {
    
    sendEvent: (protocolSignature: string, body: string) => Promise<any>;
    sendRequest: (protocolSignature: string, body: string) => Promise<any>;
    
}