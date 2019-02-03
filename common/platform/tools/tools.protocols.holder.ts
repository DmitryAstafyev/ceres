
export default class ProtocolsHolder {

    private _protocols: Map<string, any>  = new Map();

    public add(protocolImplementation: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const protocolSignature = this._getProtocolSignature(protocolImplementation);
            if (protocolSignature instanceof Error) {
                return reject(protocolSignature);
            }
            if (this._protocols.has(protocolSignature)) {
                return resolve(protocolSignature);
            }
            this._protocols.set(protocolSignature, protocolImplementation);
            return resolve(protocolSignature);
        });
    }

    public parse(protocolSignature: string, json: string | Uint8Array | number[]): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this._protocols.has(protocolSignature)) {
                return reject(new Error(`Protocol ${protocolSignature} is unknown. Be sure, this protocol is registered.`));
            }
            const protocolImplementation = this._protocols.get(protocolSignature);
            const implementation = protocolImplementation.parse(json);
            if (implementation instanceof Error) {
                return reject(implementation);
            }
            resolve(implementation);
        });
    }

    private _getProtocolSignature(smth: any): string | Error {
        if ((typeof smth !== 'object' || smth === null) && typeof smth !== 'function') {
            return new Error('No protocol found. As protocol expecting: constructor or instance of protocol.');
        }
        if (typeof smth.getSignature !== 'function' || typeof smth.getSignature() !== 'string' || smth.getSignature().trim() === '') {
            return new Error('No sigature of protocol found');
        }
        return smth.getSignature();
    }

}
