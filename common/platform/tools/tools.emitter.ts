import Logger from './tools.logger';

type TEmitterHandlers = Array<Function>;
type TEmitterSignature = Symbol | string;

const logger = new Logger('Emitter');

export default class Emitter {

    private __handlers: Map<TEmitterSignature, TEmitterHandlers> = new Map();

    constructor(){

    }

    private __getSymbolSignature(signature: Symbol | string | Function): TEmitterSignature {
        if (typeof signature === 'symbol'){
            return signature;
        } else if (typeof signature === 'string'){
            return signature;
        } else if (typeof signature === 'function'){
            return signature.name;
        } else {
            throw new Error(logger.error(`Emitter support type of signature: symbol or string only.`));
        }
    }   

    subscribe(signature: Symbol | string | Function, handler: Function): boolean {
        signature = this.__getSymbolSignature(signature);
        if (typeof handler !== 'function'){
            throw new Error(logger.error(`Handler of event should be a function.`));
        }
        let handlers = this.__handlers.get(signature);
        if (!(handlers instanceof Array)) {
            handlers = [];
        }
        handlers.push(handler);
        this.__handlers.set(signature, handlers);
        return true;
    }

    unsubscribe(signature: Symbol | string | Function, handler: Function): boolean {
        signature = this.__getSymbolSignature(signature);
        let handlers = this.__handlers.get(signature);
        if (!(handlers instanceof Array)) {
            return false;
        }
        this.__handlers.set(signature, handlers.filter((_handler) => {
            return _handler !== handler;
        }));
        return true;
    }

    unsubscribeAll(signature?: Symbol | string | Function) {
        if (signature === undefined) {
            this.__handlers.clear();
            return;
        }
        signature = this.__getSymbolSignature(signature);
        this.__handlers.delete(signature);
    }

    emit(signature: Symbol | string | Function, ...args: Array<any>) {
        signature = this.__getSymbolSignature(signature);
        let handlers = this.__handlers.get(signature);
        if (!(handlers instanceof Array)) {
            return false;
        }
        handlers.forEach((handler: Function) => {
            handler(...args);
        });
    }

    listeners(signature: Symbol | string | Function) {
        signature = this.__getSymbolSignature(signature);
        let handlers = this.__handlers.get(signature);
        return handlers instanceof Array ? this.__handlers.get(signature) : [];
    }

    clear(){
        this.__handlers.clear();
    }

}