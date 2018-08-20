
class ProtocolMessage {

    public __token: string = '';

    getToken(): string {
        return this.__token;
    }

    setToken(token: string) {
        if (typeof token !== 'string') {
            throw new Error(`As value of token can be used only {string} type, but gotten: ${(typeof token)}`);
        }
        if (this.__token !== '') {
            throw new Error(`Token already has value. It's impossible to set value of token more then once.`);
        }
        this.__token = token;
        return this;
    }

    getStr() {
        return JSON.stringify(this);
    }

    getJSON() {
        return JSON.parse(this.getStr());
    }

}
