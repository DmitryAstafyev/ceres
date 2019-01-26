import * as Types from './tools.primitivetypes';

import inspect from './tools.inspect';

export type TId = string;
export type TResolve = (...args: any[]) => any;
export type TReject = (error: Error) => any;
export type THolder = {
    resolve: TResolve,
    reject: TReject,
    created: number,
};

export type TStorage = Map<TId, THolder>;

export default class PromissesHolder {
    // TODO: here should be clean up by timer
    private _promises: TStorage  = new Map();
    private _alreadyRequested: { [key: string]: boolean } = {};

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
        if (this._alreadyRequested[id] !== void 0) {
            this.resolve(id);
        }
        return true;
    }

    public remove(id: string): boolean {
        this._promises.delete(id);
        return true;
    }

    public resolve(id: string, ...args: any[]) {
        const holder = this._promises.get(id);
        if (holder === undefined) {
            this._alreadyRequested[id] = true;
            return false;
        } else {
            delete this._alreadyRequested[id];
        }
        this._promises.delete(id);
        holder.resolve(...args);
        return true;
    }

    public reject(id: string, error: Error) {
        const holder = this._promises.get(id);
        if (holder === undefined) {
            return false;
        }
        this._promises.delete(id);
        holder.reject(error);
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
