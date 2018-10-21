import * as Types from './tools.primitivetypes';

import inspect from './tools.inspect';

type TGroup = string;
type TId = string;
type THandler = (...args: any[]) => any;
type THolder = Map<TId, THandler>;
type TStorage = Map<TGroup, THolder>;

export default class HandlersHolder {

    private _handlers: TStorage  = new Map();

    public add(group: string, id: string, handler: THandler): boolean | Error {
        const error = this._validate(group, id);
        if (error !== null) {
            return error;
        }
        if (Types.getTypeOf(handler) !== Types.ETypes.function) {
            return new Error(`Expect type of handler will be {function}. Bug has gotten: ${inspect(handler)}`);
        }
        let holder = this._handlers.get(group);
        if (holder === undefined) {
            holder = new Map();
        }
        holder.set(id, handler);
        this._handlers.set(group, holder);
        return true;
    }

    public remove(group: string, id?: string): boolean | Error {
        const holder = this._handlers.get(group);
        if (holder === undefined) {
            return false;
        }
        if (id === undefined) {
            this._handlers.delete(group);
            return true;
        }
        holder.delete(id);
        return true;
    }

    public get(group: string, id: string): THandler | undefined {
        const holder = this._handlers.get(group);
        if (holder === undefined) {
            return void 0;
        }
        return holder.get(id);
    }

    public has(group: string, id: string): boolean {
        const holder = this._handlers.get(group);
        if (holder === undefined) {
            return false;
        }
        return holder.has(id);
    }

    public clear() {
        this._handlers.clear();
    }

    private _validate(group: string, id: string) {
        if (Types.getTypeOf(group) !== Types.ETypes.string) {
            return new Error(`Expect type of protocol will be {string}. Bug has gotten: ${inspect(group)}`);
        }
        if (Types.getTypeOf(id) !== Types.ETypes.string) {
            return new Error(`Expect type of entity will be {string}. Bug has gotten: ${inspect(id)}`);
        }
        return null;
    }
}
