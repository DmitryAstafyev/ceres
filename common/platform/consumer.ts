import { ITransportInterface, TransportInterfaceDesc } from './interfaces/interface.transport';
import * as Tools from './tools/index';

const SIGNATURE = '__signature';
const HANDLER_ID = '__handler_id';

export class Consumer {

    private _transport: ITransportInterface;
    private _signature: string;
    private _events: {[key: string]: Array<() => void>} = {};
    private _sequence: number = 0; 

    constructor(transport: ITransportInterface, protocolImplementation: any) {
        if (Tools.getTypeOf(protocolImplementation) !== Tools.EPrimitiveTypes.object || protocolImplementation === null) {
            throw new Error(`Wrong typeof of protocol implementation. Was gotten: ${Tools.getTypeOf(protocolImplementation)}, expected {object}.`);
        }
        if (!this._validateTransport(transport)){
            throw new Error(`Wrong format of transport. Cannot continue.`);
        }
        this._transport = transport;
        this._signature = this._getProtocolSignature(protocolImplementation);
    }

    private _validateTransport(transport: ITransportInterface): boolean {
        let result = true;
        if (typeof transport !== 'object' || transport === null) {
            result = false;
        }
        Object.keys(TransportInterfaceDesc).forEach((prop: string) => {
            if (Tools.getTypeOf((transport as any)[prop]) !== (TransportInterfaceDesc as any)[prop]) {
                result = false;
            }
        });
        return result;
    }

    private _getProtocolSignature(protocolImplementation: any): string {
        if (Tools.getTypeOf(protocolImplementation[SIGNATURE]) !== Tools.EPrimitiveTypes.string || protocolImplementation[SIGNATURE].trim() === '') {
            throw new Error(`Fail to detect ${SIGNATURE} of protocol implementation. Wrong value is: ${protocolImplementation[SIGNATURE]}.`);
        }
        return protocolImplementation[SIGNATURE];
    }

    private _getSequence(): string {
        return (this._sequence++).toString();
    }

    private _getClassRef(ClassRef: any): string {
        if (Tools.getTypeOf(ClassRef[SIGNATURE]) !== Tools.EPrimitiveTypes.string || ClassRef[SIGNATURE].trim() === ''){
            throw new Error(`Cannot detect signature of event's class.`);
        }
        return ClassRef[SIGNATURE];
    }

    /**
     * Subscribe handler to event
     * @param {class} EventClass - Reference to event's class
     * @param {function} handler - Handler of event
     * @param {options} options - Sunscription options
     * @returns {string} - ID of subscription
     */    
    public subscribe(EventClass: any, hanlder: () => void, options?: any): string {
        const signature = this._getClassRef(EventClass);
        if (Tools.getTypeOf(hanlder) !== Tools.EPrimitiveTypes.function){
            throw new Error(`Only function can be used as handler.`);
        }
        if ((hanlder as any)[HANDLER_ID] !== void 0){
            throw new Error(`Defined function (handler) is already used as handler for event.`);
        }
        const id = this._getSequence();
        if (this._events[signature] === void 0) {
            this._events[signature] = [];
        }
        this._events[signature].push(hanlder);
        (hanlder as any)[HANDLER_ID] = id;
        return id;
    }

    /**
     * Unsubscribe all handlers or defined handler from event
     * @param {class} EventClass - Reference to event's class
     * @param {function} handler - Handler of event (if defined will be unsubscribed only defined handler)
     * @returns {boolean} - results of operation
     */  
    public unsubscribe(EventClass: any, hanlder?: () => void) {
        const signature = this._getClassRef(EventClass);
        let handlerId: string | null = null;
        if (Tools.getTypeOf(hanlder) === Tools.EPrimitiveTypes.function && Tools.getTypeOf((hanlder as any)[HANDLER_ID]) === Tools.EPrimitiveTypes.string){
            handlerId = (hanlder as any)[HANDLER_ID];
        }
        if (this._events[signature] === void 0){
            return false;
        }
        if (handlerId === null) {
            delete this._events[signature];
            return null;
        }
        const length = this._events[signature].length;
        this._events[signature] = this._events[signature].filter((handler: () => void) => {
            return (hanlder as any)[HANDLER_ID] !== handlerId;
        });
        return length !== this._events[signature].length;
    }



}