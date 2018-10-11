type TProtocol = string;
type TEvent = string;
type TClientId = string;

export default class SubscriptionsHolder {

    private _subscriptions: Map<TProtocol, Map<TEvent, TClientId[]>> = new Map();

    public subscribe(protocol: string, event: string, clientID: string): boolean {
        let storage = this._subscriptions.get(protocol);
        if (storage === undefined) {
            storage = new Map();
        }
        let IDs = storage.get(event);
        if (IDs === undefined) {
            IDs = [];
        }
        if (IDs.indexOf(clientID) !== -1) {
            return false;
        }
        IDs.push(clientID);
        storage.set(event, IDs);
        this._subscriptions.set(protocol, storage);
        return true;
    }

    public unsubscribe(clientID: string, protocol: string, event?: string): boolean {
        const storage = this._subscriptions.get(protocol);
        if (storage === undefined) {
            return false;
        }
        if (event === undefined) {
            let changed = false;
            storage.forEach((storedIDs, storedEvent, map) => {
                if (storedIDs.indexOf(clientID) !== -1) {
                    storedIDs.splice(storedIDs.indexOf(clientID), 1);
                    storage !== undefined && storage.set(storedEvent, storedIDs);
                    changed = true;
                }
            });
            if (changed) {
                this._subscriptions.set(protocol, storage);
            }
            return changed;
        }
        const IDs = storage.get(event);
        if (IDs === undefined) {
            return false;
        }
        if (IDs.indexOf(clientID) === -1) {
            return false;
        }
        IDs.splice(IDs.indexOf(clientID), 1);
        storage.set(event, IDs);
        this._subscriptions.set(protocol, storage);
        return true;
    }

    public get(protocol: string, event: string): TClientId[] {
        const storage = this._subscriptions.get(protocol);
        if (storage === undefined) {
            return [];
        }
        const IDs = storage.get(event);
        if (IDs === undefined) {
            return [];
        }
        return IDs.slice();
    }

    public removeClient(clientID: string) {
        this._subscriptions.forEach((storage: Map<TEvent, TClientId[]>, protocolName: string) => {
            storage.forEach((storedIDs: TClientId[], storedEvent: string) => {
                if (storedIDs.indexOf(clientID) !== -1) {
                    this.unsubscribe(clientID, protocolName, storedEvent);
                }
            });
        });
    }

    public getInfo(): string {
        const info: TClientId[] = [];
        this._subscriptions.forEach((storage: Map<TEvent, TClientId[]>, protocolName: string) => {
            storage.forEach((IDs: TClientId[], storedEvent: string) => {
                info.push(`\t\t[${protocolName}:${storedEvent}]: ${IDs.length}`);
            });
        });
        return info.join(';\n');
    }

}
