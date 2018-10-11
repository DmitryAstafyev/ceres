import Logger from './tools.logger';
type THandler = (...args: any[]) => any;
type TEmitterHandlers = THandler[];
type TEmitterSignature = symbol | string;

const logger = new Logger('Emitter');

export default class Emitter {

    private _handlers: Map<TEmitterSignature, TEmitterHandlers> = new Map();

    public subscribe(signature: any, handler: THandler): boolean {
        signature = this.__getSymbolSignature(signature);
        if (typeof handler !== 'function') {
            throw new Error(logger.error(`Handler of event should be a function.`));
        }
        let handlers = this._handlers.get(signature);
        if (!(handlers instanceof Array)) {
            handlers = [];
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

}
