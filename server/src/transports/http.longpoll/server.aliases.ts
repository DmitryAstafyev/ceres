import * as Protocol from '../../protocols/connection/protocol.connection';

export type TAlias = { [key: string]: string };

export class Aliases {

    private _clients: Map<string, TAlias> = new Map();

    public ref(clientId: string, alias: TAlias): void {
        this._clients.set(clientId, alias);
    }

    public unref(clientId: string): boolean {
        if (!this._clients.has(clientId)) {
            return false;
        }
        this._clients.delete(clientId);
        return true;
    }

    public get(aliases: TAlias | Protocol.KeyValue[]): string[] {
        const _aliases: TAlias = {};
        if (aliases instanceof Array) {
            aliases.forEach((pair: Protocol.KeyValue) => {
                _aliases[pair.key] = pair.value;
            });
        }
        const clients: string[] = [];
        this._clients.forEach((storedAliases: TAlias, clientId: string) => {
            if (this._isInclude(storedAliases, _aliases)) {
                clients.push(clientId);
            }
        });
        return clients;
    }

    private _isInclude(base: TAlias, target: TAlias): boolean {
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

}
