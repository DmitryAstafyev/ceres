import inspect from './tools.inspect';

export interface IKeyValue {
    key: string;
    value: string;
}

export type TProtocol = string;
export type TDemand = string;
export type TClientId = string;
export type TQuery = { [key: string ]: string };
export type TQueryArray = IKeyValue[];
export type TQuerysStorage = Map<TClientId, TQuery>;
export type TDemandsStorage = Map<TDemand, TQuerysStorage>;
export type TProtocolsStorage = Map<TProtocol, TDemandsStorage>;

export default class DemandsHolder {

    private _subscriptions: TProtocolsStorage = new Map();

    public subscribe(protocol: string, demand: string, clientID: string, query: TQuery | TQueryArray): Error | boolean {
        // Validate query
        const validQuery: TQuery | Error = this._serialize(query);
        if (validQuery instanceof Error) {
            return validQuery;
        }
        /*
        if (Object.keys(validQuery).length === 0) {
            return new Error(`Query cannot be empty.`);
        }
        */
        // Create / update subscription
        let demands: TDemandsStorage | undefined = this._subscriptions.get(protocol);
        if (demands === undefined) {
            demands = new Map();
        }
        let querys: TQuerysStorage | undefined = demands.get(demand);
        if (querys === undefined) {
            querys = new Map();
        }
        querys.set(clientID, validQuery);
        demands.set(demand, querys);
        this._subscriptions.set(protocol, demands);
        return true;
    }

    public unsubscribe(clientID: string, protocol: string, demand?: string): boolean {
        const demands: TDemandsStorage | undefined = this._subscriptions.get(protocol);
        if (demands === undefined) {
            return false;
        }
        if (demand === undefined) {
            let changed = false;
            demands.forEach((storedQuerys: TQuerysStorage, storedDemand: string) => {
                if (storedQuerys.has(clientID)) {
                    storedQuerys.delete(clientID);
                    demands.set(storedDemand, storedQuerys);
                    changed = true;
                }
            });
            if (changed) {
                this._subscriptions.set(protocol, demands);
            }
            return changed;
        }
        const querys: TQuerysStorage | undefined = demands.get(demand);
        if (querys === undefined || !querys.has(clientID)) {
            return false;
        }
        querys.delete(clientID);
        demands.set(clientID, querys);
        this._subscriptions.set(protocol, demands);
        return true;
    }

    public removeClient(clientID: string) {
        this._subscriptions.forEach((demands: TDemandsStorage, protocol: TProtocol) => {
            demands.forEach((querys: TQuerysStorage, demand: TDemand) => {
                if (querys.has(clientID)) {
                    querys.delete(clientID);
                    demands.set(demand, querys);
                    this._subscriptions.set(protocol, demands);
                }
            });
        });
    }

    public clear() {
        this._subscriptions.clear();
    }

    public get(protocol: string, demand: string, query: TQuery | TQueryArray): string[] | Error {
        const validQuery: TQuery | Error = this._serialize(query);
        if (validQuery instanceof Error) {
            return validQuery;
        }
        const demands: TDemandsStorage | undefined = this._subscriptions.get(protocol);
        if (demands === undefined) {
            return [];
        }
        const querys: TQuerysStorage | undefined = demands.get(demand);
        if (querys === undefined) {
            return [];
        }
        const clientIds: string[] = [];
        querys.forEach((sotredQuery: TQuery, clientId: TClientId) => {
            if (this._isInclude(sotredQuery, validQuery)) {
                clientIds.push(clientId);
            }
        });
        return clientIds;
    }

    public getAll(protocol: string, demand: string): string[] | Error {
        const demands: TDemandsStorage | undefined = this._subscriptions.get(protocol);
        if (demands === undefined) {
            return [];
        }
        const querys: TQuerysStorage | undefined = demands.get(demand);
        if (querys === undefined) {
            return [];
        }
        const clientIds: string[] = [];
        querys.forEach((query: TQuery, clientId: string) => {
            clientIds.push(clientId);
        });
        return clientIds;
    }

    public getInfo(): string {
        const info: TClientId[] = [];
        this._subscriptions.forEach((demands: TDemandsStorage, protocol: string) => {
            demands.forEach((quiries: TQuerysStorage, demand: string) => {
                info.push(`\t\t[${protocol}:${demand}]: ${quiries.keys.length}`);
            });
        });
        return info.join(';\n');
    }

    private _isInclude(base: TQuery, target: TQuery): boolean {
        let result = true;
        Object.keys(target).forEach((key: string) => {
            if (!result) {
                return;
            }
            if (base[key] !== target[key]) {
                result = false;
            }
        });
        return result;
    }

    private _serialize(query: TQuery | TQueryArray): TQuery | Error {
        if (!(query instanceof Array) && (typeof query !== 'object' || query === null)) {
            return new Error(`Inncorrect format of query`);
        }
        // Validate query as array
        if (query instanceof Array) {
            const validQuery: TQuery = {};
            let errorTQueryArray: Error | undefined;
            query.forEach((pair: IKeyValue, index: number) => {
                if (errorTQueryArray instanceof Error) {
                    return;
                }
                if (typeof pair !== 'object' || pair === null ||
                    typeof pair.value !== 'string' || typeof pair.key !== 'string' ||
                    pair.value.trim() === '' || pair.key.trim() === '') {
                    errorTQueryArray = new Error(`Incorrect values in TKeyValue, index: ${index}; value: ${inspect(pair)}`);
                    return;
                }
                validQuery[pair.key] = pair.value;
            });
            if (errorTQueryArray instanceof Error) {
                return errorTQueryArray;
            }
            return validQuery;
        }
        // Validate query as object
        let errorTQuery: Error | undefined;
        Object.keys(query).forEach((key: string) => {
            if (errorTQuery instanceof Error) {
                return;
            }
            if (key.trim() === '' || typeof query[key] !== 'string' || query[key].trim() === '') {
                errorTQuery = new Error(`Incorrect values in query, key: ${key}; value: ${inspect(query[key])}`);
            }
        });
        if (errorTQuery instanceof Error) {
            return errorTQuery;
        }
        return query;
    }

}
