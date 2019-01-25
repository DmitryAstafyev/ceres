import { Tools } from 'ceres.server.provider';

export type Token = { token: string, timestamp: number };

export class Tokens {

    private _tokenLife: number;
    private _tokens: Map<string, Token> = new Map();

    constructor(tokenLife: number) {
        this._tokenLife = tokenLife;
    }

    public set(clientId: string): string {
        const token = Tools.guid();
        this._tokens.set(clientId, {
            timestamp: (new Date()).getTime(),
            token: token,
        });
        return token;
    }

    public get(clientId: string): string | null {
        const token: Token | undefined = this._tokens.get(clientId);
        if (token === undefined) {
            return null;
        }
        return token.token;
    }

    public generateClientGuid(): string {
        let guid: string;
        do {
            guid = Tools.guid();
        } while (this.getClientId(guid) !== null);
        return guid;
    }

    public getClientId(token: string): string | null {
        let clientId: string | null = null;
        this._tokens.forEach((storedToken: Token, key: string) => {
            if (storedToken.token === token) {
                clientId = key;
            }
        });
        return clientId;
    }

    public isActual(clientId: string): boolean {
        const token: Token | undefined = this._tokens.get(clientId);
        if (token === undefined) {
            return false;
        }
        if (((new Date()).getTime() - token.timestamp) > this._tokenLife) {
            this._tokens.delete(clientId);
            return false;
        }
        return true;
    }

}
