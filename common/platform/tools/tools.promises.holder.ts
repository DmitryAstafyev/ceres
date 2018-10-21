import * as Types from './tools.primitivetypes';

import inspect from './tools.inspect';

type TId = string;
type TResolve = (...args: any[]) => any;
type TReject = (error: Error) => any;
type THolder = {
    resolve: TResolve,
    reject: TReject,
    created: number,
};

type TStorage = Map<TId, THolder>;

export default class PromissesHolder {

    private _promises: TStorage  = new Map();

    public add(id: string, resolve: TResolve, reject: TReject): boolean | Error {
        const error = this._validate(id);
        if (error !== null) {
            return error;
        }
        if (Types.getTypeOf(resolve) !== Types.ETypes.function) {
            return new Error(`Expect type of resolve will be {function}. Bug has gotten: ${inspect(resolve)}`);
        }
        if (Types.getTypeOf(reject) !== Types.ETypes.function) {
            return new Error(`Expect type of reject will be {function}. Bug has gotten: ${inspect(reject)}`);
        }
        if (this._promises.has(id)) {
            return new Error(`Promise alreay exists with same id "${id}"`);
        }
        this._promises.set(id, {
            created: (new Date()).getTime(),
            reject: reject,
            resolve: resolve,
        });
        return true;
    }

    public remove(id: string): boolean {
        this._promises.delete(id);
        return true;
    }

    public resolve(id: string, ...args: any[]) {
        const holder = this._promises.get(id);
        if (holder === undefined) {
            return false;
        }
        holder.resolve(...args);
        this._promises.delete(id);
        return true;
    }

    public reject(id: string, error: Error) {
        const holder = this._promises.get(id);
        if (holder === undefined) {
            return false;
        }
        holder.reject(error);
        this._promises.delete(id);
        return true;
    }

    public has(id: string): boolean {
        return this._promises.has(id);
    }

    public clear() {
        this._promises.clear();
    }

    private _validate(id: string) {
        if (Types.getTypeOf(id) !== Types.ETypes.string) {
            return new Error(`Expect type of entity will be {string}. Bug has gotten: ${inspect(id)}`);
        }
        return null;
    }
}
