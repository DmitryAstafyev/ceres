import * as Types from './tools.primitivetypes';

import inspect from './tools.inspect';

export type TGroup = string;
export type TId = string;
export type THandler = (...args: any[]) => any;
export type THandlerEntity = { handler: THandler, created: number };
export type THolder = Map<TId, THandlerEntity>;
export type TStorage = Map<TGroup, THolder>;

export default class HandlersHolder {
    // TODO: here should be clean up by timer
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
        holder.set(id, { handler: handler, created: Date.now() });
        this._handlers.set(group, holder);
        return true;
    }

    public remove(group: string, id?: string): boolean | Error {
        const holder = this._handlers.get(group);
        if (!holder) {
            return false;
        }
        if (id === undefined) {
            this._handlers.delete(group);
            return true;
        }
        holder.delete(id);
        return true;
    }

    public get(group: string, id?: string): THandler | Map<string, THandler> | undefined {
        const holder = this._handlers.get(group);
        if (holder === undefined) {
            return undefined;
        }
        if (typeof id !== 'string') {
            const map: Map<string, THandler> = new Map();
            holder.forEach((storedEntity: THandlerEntity, key: string) => {
                map.set(key, storedEntity.handler);
            });
            return map;
        }
        const entity: THandlerEntity | undefined = holder.get(id);
        return entity === undefined ? undefined : entity.handler;
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

    public removeOlderThen(age: number) {
        const now: number = Date.now();
        this._handlers.forEach((storedHandlers: Map<string, THandlerEntity>, storeKey: string) => {
            const storeSize: number = storedHandlers.size;
            storedHandlers.forEach((entity: THandlerEntity, entityKey: string) => {
                if (now - entity.created < age) {
                    return;
                }
                storedHandlers.delete(entityKey);
            });
            if (storedHandlers.size === 0) {
                this._handlers.delete(storeKey);
                return;
            }
            if (storeSize !== storedHandlers.size) {
                this._handlers.set(storeKey, storedHandlers);
            }
        });
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
