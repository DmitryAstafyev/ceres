export enum EClientStates {
    created = 'created',
    connecting = 'connecting',
    reconnecting = 'reconnecting',
    connected = 'connected',
}

export class State {

    private _state: EClientStates = EClientStates.created;

    /**
     * Set current state
     * @param state {string}
     * @returns {void}
     */
    public set(state: EClientStates) {
        this._state = state;
    }

    /**
     * Return current state
     * @returns {EClientStates}
     */
    public get(): EClientStates {
        return this._state;
    }

}
