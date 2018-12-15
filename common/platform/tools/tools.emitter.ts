import GUID from './tools.guid';
import Logger from './tools.logger';

// Types
type THandler = (...args: any[]) => any;
type TEmitterHandlers = THandler[];
type TEmitterSignature = symbol | string;

// Interfaces
interface IEmitterOptions {
    strict?: boolean;
    maxSubscribersCount?: number;
}

// Decorations
export function EventHandler() {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        target[propertyKey]._bind = target[propertyKey].bind;
        target[propertyKey].bind = (context: any, ...args: any[]) => {
            const func = target[propertyKey]._bind(context, ...args);
            func[EVENT_HANDLER_GUID] = GUID();
            return func;
        };
        target[propertyKey][EVENT_HANDLER_GUID] = GUID();
        return target[propertyKey];
    };
}

const logger = new Logger('Emitter');
const EVENT_HANDLER_GUID = '__eventHandlerGUID';

export default class Emitter {

    private _handlers: Map<TEmitterSignature, TEmitterHandlers> = new Map();
    private _strict: boolean = false;
    private _maxSubscribersCount: number = 10;

    constructor(params?: IEmitterOptions) {
        if (typeof params !== 'object' || params === null) {
            return;
        }
        (typeof params.strict === 'boolean') && (this._strict = params.strict);
        (typeof params.maxSubscribersCount === 'number') && (this._maxSubscribersCount = params.maxSubscribersCount);
    }

    public subscribe(signature: any, handler: THandler): boolean {
        signature = this.__getSymbolSignature(signature);
        if (typeof handler !== 'function') {
            throw new Error(logger.error(`Handler of event should be a function.`));
        }
        if (this._strict && (handler as any)[EVENT_HANDLER_GUID] === void 0) {
            logger.warn(`Handler of event ${this._getStringSignature(signature)} should be declareted via decoration @EventHandler(), because emitter is in strict mode.`);
        }
        let handlers = this._handlers.get(signature);
        if (!(handlers instanceof Array)) {
            handlers = [];
        }
        if (handlers.length + 1 > this._maxSubscribersCount) {
            throw new Error(logger.error(`Cannot make subscription for ${signature}, because limit of listeners. Max is ${this._maxSubscribersCount}`));
        }
        handlers.push(handler);
        this._handlers.set(signature, handlers);
        return true;
    }

    public unsubscribe(signature: any, handler: THandler): boolean {
        signature = this.__getSymbolSignature(signature);
        const handlers = this._handlers.get(signature);
        if (!(handlers instanceof Array)) {
            return false;
        }
        this._handlers.set(signature, handlers.filter((_handler) => {
            return _handler !== handler;
        }));
        return true;
    }

    public unsubscribeAll(signature?: any) {
        if (signature === undefined) {
            this._handlers.clear();
            return;
        }
        signature = this.__getSymbolSignature(signature);
        this._handlers.delete(signature);
    }

    public emit(signature: any, ...args: any[]) {
        signature = this.__getSymbolSignature(signature);
        const handlers = this._handlers.get(signature);
        if (!(handlers instanceof Array)) {
            return false;
        }
        handlers.forEach((handler: THandler) => {
            handler(...args);
        });
    }

    public listeners(signature: any) {
        signature = this.__getSymbolSignature(signature);
        const handlers = this._handlers.get(signature);
        return handlers instanceof Array ? this._handlers.get(signature) : [];
    }

    public clear() {
        this._handlers.clear();
    }

    private __getSymbolSignature(signature: any): TEmitterSignature {
        if (typeof signature === 'symbol') {
            return signature;
        } else if (typeof signature === 'string') {
            return signature;
        } else if (typeof signature === 'function') {
            return signature.name;
        } else {
            throw new Error(logger.error(`Emitter support type of signature: symbol or string only.`));
        }
    }

    private _getStringSignature(signature: any): string {
        if (typeof signature === 'string') {
            return signature;
        } else if (signature.toString !== void 0) {
            return signature.toString();
        } else {
            return `signature type is "${typeof signature}"`;
        }
    }

}
