import Emitter from './tools.emitter';

export default class TimerEmitter extends Emitter {

	static EVENTS = {
		onTimeout: Symbol()
	};

	private _timer		: number | null = null;
	private _timeout	: number;

	constructor(timeout: number) {
		super();
		if (typeof this._timeout !== 'number') {
			throw new Error(`Expecting as timeout {number}.`);
		}
		if (this._timeout === 0) {
			return;
		}
        this._timeout = timeout;
        this.start();
	}

	public drop(){
		if (this._timer === null) {
			return false;
		}
		if (this._timer !== null) {
			clearTimeout(this._timer);
			this._timer = null;
		}
    }
    
    public reset(){
        this.drop();
        this.start();
    }

    public start(){
        if (this._timer === null) {
            return false;
        }
        this._timer = setTimeout(this._onTimeout.bind(this), this._timeout);
    }

	private _onTimeout(){
		if (this._timer === null) {
			return false;
		}
		this._timer = null;
		this.emit(TimerEmitter.EVENTS.onTimeout);
	}
}