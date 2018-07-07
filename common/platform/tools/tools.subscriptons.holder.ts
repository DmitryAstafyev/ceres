type protocol = string;
type event = string;
type clientId = string;

export default class SubscriptionsHolder{
    
    private _subscriptions: Map<protocol, Map<event, Array<clientId>>> = new Map();

    subscribe(protocol: string, event: string, clientID: string): boolean {
        let storage = this._subscriptions.get(protocol);
        if (storage === undefined){
            storage = new Map();
        }
        let IDs = storage.get(event);
        if (IDs === undefined){
            IDs = [];
        }
        if (~IDs.indexOf(clientID)){
            return false;
        }
        IDs.push(clientID);
        storage.set(event, IDs);
        this._subscriptions.set(protocol, storage);
        return true;
    }

    unsubscribe(clientID: string, protocol: string, event?: string): boolean {
        let storage = this._subscriptions.get(protocol);
        if (storage === undefined){
            return false;
        }
        if (event === undefined){
            let changed = false;
            storage.forEach((IDs, event, map) => {
                if (~IDs.indexOf(clientID)) {
                    IDs.splice(IDs.indexOf(clientID), 1);
                    storage !== undefined && storage.set(event, IDs);
                    changed = true;
                }
            });
            if (changed){
                this._subscriptions.set(protocol, storage);
            }
            return changed;
        }
        let IDs = storage.get(event);
        if (IDs === undefined){
            return false;
        }
        if (!~IDs.indexOf(clientID)){
            return false;
        }
        IDs.splice(IDs.indexOf(clientID), 1);
        storage.set(event, IDs);
        this._subscriptions.set(protocol, storage);
        return true;
    }

    get(protocol: string, event: string): Array<clientId> {
        let storage = this._subscriptions.get(protocol);
        if (storage === undefined){
            return [];
        }
        let IDs = storage.get(event);
        if (IDs === undefined){
            return [];
        }
        return IDs.slice();
    }

    removeClient(clientID: string){
        this._subscriptions.forEach((storage: Map<event, Array<clientId>>, protocol: string) => {
            storage.forEach((IDs: Array<clientId>, event: string) => {
                if (IDs.indexOf(clientID) !== -1){
                    this.unsubscribe(clientID, protocol, event);
                }
            });
        });
    }

    getInfo(){
        let info: Array<string> = [];
        this._subscriptions.forEach((storage: Map<event, Array<clientId>>, protocol: string) => {
            storage.forEach((IDs: Array<clientId>, event: string) => {
                info.push(`[${protocol}:${event}]: ${IDs.length}`)
            });
        });
        return info.join('; ');
    }
}