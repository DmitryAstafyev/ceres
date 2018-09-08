import * as Types from './tools.primitivetypes';
import EventEmitter from './tools.emitter';
import inspect from './tools.inspect';
import GUID from './tools.guid';

export default class EventHandlers {

    private _handlers: Map<string, EventEmitter>  = new Map();

    private _validate(protocol: string, event: string) {
        if (Types.getTypeOf(protocol) !== Types.ETypes.string) {
            return new Error(`Expect type of protocol will be {string}. Bug has gotten: ${inspect(protocol)}`);
        }
        if (Types.getTypeOf(event) !== Types.ETypes.string) {
            return new Error(`Expect type of event will be {string}. Bug has gotten: ${inspect(event)}`);
        }
        return null;
    }

    subscribe(protocol: string, event: string, handler: Function): boolean | Error {
        const error = this._validate(protocol, event);
        if (error !== null) {
            return error;
        }
        if (Types.getTypeOf(handler) !== Types.ETypes.function) {
            return new Error(`Expect type of handler will be {function}. Bug has gotten: ${inspect(handler)}`);
        }
        if (!this._handlers.has(protocol)) {
            this._handlers.set(protocol, new EventEmitter());
        }
        let emitter = this._handlers.get(protocol);
        (emitter as EventEmitter).subscribe(event, handler);
        return true;
    }

    unsubscribe(protocol: string, event?: string, handler?: Function): boolean | Error {
        const emitter = this._handlers.get(protocol);
        if (emitter === undefined){
            return false;
        }
        if (event === undefined){
            emitter.unsubscribeAll();
            this._handlers.delete(protocol);
            return true;
        }
        if (handler === void 0) {
            emitter.unsubscribeAll(event);
            this._handlers.set(protocol, emitter);
            return true;
        }
        emitter.unsubscribe(event, handler);
        return true;
    }

    emit(protocol: string, event: string, ...args: Array<any>): boolean {
        const emitter = this._handlers.get(protocol);
        if (emitter === undefined){
            return false;
        }
        emitter.emit(event, ...args);
        return true;
    }

    clear(){
        this._handlers.forEach((emitter: EventEmitter) => {
            emitter.clear();
        });
        this._handlers.clear();
    }
}