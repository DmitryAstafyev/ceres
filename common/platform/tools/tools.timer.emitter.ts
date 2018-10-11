import Emitter from './tools.emitter';

export default class TimerEmitter extends Emitter {

    public static EVENTS = {
        onTimeout: Symbol(),
	};

	private _timer: 	any | null = null;
	private _timeout: 	number;

	constructor(timeout: number) {
		super();
		if (typeof timeout !== 'number') {
			throw new Error(`Expecting as timeout {number}.`);
		}
		if (timeout === 0) {
			throw new Error(`Expecting as timeout {number} > 0.`);
		}
		this._timeout = timeout;
		this.start();
	}

	public drop() {
		if (this._timer === null) {
			return false;
		}
		if (this._timer !== null) {
			clearTimeout(this._timer);
			this._timer = null;
		}
    }

    public reset() {
        this.drop();
        this.start();
    }

    public start() {
        if (this._timer === null) {
            return false;
        }
        this._timer = setTimeout(this._onTimeout.bind(this), this._timeout);
    }

	private _onTimeout() {
		if (this._timer === null) {
			return false;
		}
		this._timer = null;
		this.emit(TimerEmitter.EVENTS.onTimeout);
	}

}
