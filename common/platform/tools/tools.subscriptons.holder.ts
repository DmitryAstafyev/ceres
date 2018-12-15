type TProtocol = string;
type TEvent = string;
type TClientId = string;
type TClientIdStorage = TClientId[];
type TEventsStorage = Map<TEvent, TClientIdStorage>;
type TProtocolsStorage = Map<TProtocol, TEventsStorage>;

export default class SubscriptionsHolder {

    private _subscriptions: TProtocolsStorage = new Map();

    public subscribe(protocol: string, event: string, clientID: string): boolean {
        let events: TEventsStorage | undefined = this._subscriptions.get(protocol);
        if (events === undefined) {
            events = new Map();
        }
        let IDs: TClientIdStorage | undefined = events.get(event);
        if (IDs === undefined) {
            IDs = [];
        }
        if (IDs.indexOf(clientID) !== -1) {
            return false;
        }
        IDs.push(clientID);
        events.set(event, IDs);
        this._subscriptions.set(protocol, events);
        return true;
    }

    public unsubscribe(clientID: string, protocol: string, event?: string): boolean {
        const events: TEventsStorage | undefined = this._subscriptions.get(protocol);
        if (events === undefined) {
            return false;
        }
        if (event === undefined) {
            let changed = false;
            events.forEach((storedIDs: TClientIdStorage, storedEvent: TEvent) => {
                if (storedIDs.indexOf(clientID) !== -1) {
                    storedIDs.splice(storedIDs.indexOf(clientID), 1);
                    events.set(storedEvent, storedIDs);
                    changed = true;
                }
            });
            if (changed) {
                this._subscriptions.set(protocol, events);
            }
            return changed;
        }
        const IDs: TClientIdStorage | undefined = events.get(event);
        if (IDs === undefined) {
            return false;
        }
        if (IDs.indexOf(clientID) === -1) {
            return false;
        }
        IDs.splice(IDs.indexOf(clientID), 1);
        events.set(event, IDs);
        this._subscriptions.set(protocol, events);
        return true;
    }

    public get(protocol: string, event: string): TClientId[] {
        const events: TEventsStorage | undefined = this._subscriptions.get(protocol);
        if (events === undefined) {
            return [];
        }
        const IDs: TClientIdStorage | undefined = events.get(event);
        if (IDs === undefined) {
            return [];
        }
        return IDs.slice();
    }

    public removeClient(clientID: string) {
        this._subscriptions.forEach((events: TEventsStorage, protocol: TProtocol) => {
            events.forEach((storedIDs: TClientIdStorage, event: TEvent) => {
                if (storedIDs.indexOf(clientID) !== -1) {
                    storedIDs.splice(storedIDs.indexOf(clientID), 1);
                    events.set(event, storedIDs);
                    this._subscriptions.set(protocol, events);
                }
            });
        });
    }

    public clear() {
        this._subscriptions.clear();
    }

    public getInfo(): string {
        const info: TClientId[] = [];
        this._subscriptions.forEach((events: TEventsStorage, protocolName: TProtocol) => {
            events.forEach((IDs: TClientIdStorage, storedEvent: TEvent) => {
                info.push(`\t\t[${protocolName}:${storedEvent}]: ${IDs.length}`);
            });
        });
        return info.join(';\n');
    }

}
