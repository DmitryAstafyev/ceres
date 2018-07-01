
export default class ProtocolsHolder {

    private _protocols: Map<string, any>  = new Map();

    public add(protocolImplementation: any){
        return new Promise((resolve, reject) => {
            const protocolSignature = this._getProtocolSignature(protocolImplementation);
            if (protocolSignature instanceof Error){
                return reject(protocolSignature);
            }
            if (this._protocols.has(protocolSignature)){
                return resolve(protocolSignature);
            }
            this._protocols.set(protocolSignature, protocolImplementation);
            return resolve(protocolSignature);
        });
    }

    public getImplementationFromStr(protocolSignature: string, json: string){
        return new Promise((resolve, reject) => {
            if (!this._protocols.has(protocolSignature)) {
                return reject(new Error(`Protocol ${protocolSignature} is unknown. Be sure, this protocol is registered.`));
            }
            const protocolImplementation = this._protocols.get(protocolSignature);
            const implementation = protocolImplementation.extract(json);
            if (implementation instanceof Error){
                return reject(implementation);
            }
            resolve(implementation);
        });
    }

    private _getProtocolSignature(protocol: any): string | Error {
        if (typeof protocol !== 'object' || protocol === null) {
            return new Error('No protocol found');
        }
        if (typeof protocol.__signature !== 'string' || protocol.__signature.trim() === ''){
            return new Error('No sigature of protocol found');
        }
        return protocol.__signature;
    }

}