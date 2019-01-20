export class Token {

    private _token: string = '';

    /**
     * Set current token
     * @param token {string}
     * @returns {void}
     */
    public set(token: string) {
        this._token = token;
    }

    /**
     * Return current token
     * @returns {string}
     */
    public get(): string {
        return this._token;
    }

    /**
     * Drop current token
     * @returns {void}
     */
    public drop() {
        this.set('');
    }

}
