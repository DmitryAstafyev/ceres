import * as Protocol from '../../protocols/connection/protocol.connection';

export type TAlias = { [key: string]: string };

export function isInclude(base: TAlias, target: TAlias | Protocol.KeyValue[]): boolean {
    let result = true;
    const _target: TAlias = convert(target);
    Object.keys(_target).forEach((key: string) => {
        if (!result) {
            return;
        }
        if (base[key] !== _target[key]) {
            result = false;
        }
    });
    return result;
}

export function convert(aliases: TAlias | Protocol.KeyValue[]): TAlias {
    let _aliases: TAlias = {};
    if (aliases instanceof Array) {
        aliases.forEach((pair: Protocol.KeyValue) => {
            _aliases[pair.key] = pair.value;
        });
    } else {
        _aliases = aliases;
    }
    return _aliases;
}

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
        const _aliases: TAlias = convert(aliases);
        const clients: string[] = [];
        this._clients.forEach((storedAliases: TAlias, clientId: string) => {
            if (isInclude(storedAliases, _aliases)) {
                clients.push(clientId);
            }
        });
        return clients;
    }

}
