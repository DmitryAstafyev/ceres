import * as HTTP from 'http';
import { EventEmitter } from 'events';
import Logger from '../../platform/tools/tools.logger';
import objectValidate from '../../platform/tools/tools.object.validator';

const SETTINGS = {
	RESET_TIMEOUT: 30000 //30sec
};

class Lifecircle extends EventEmitter {

	public EVENTS = {
		onExpired: Symbol()
	};

	private _timer		: NodeJS.Timer | null = null;
	private _duration	: number;

	constructor(duration: number) {
		super();
		this._duration 	= duration;
	}

	public start(){
		this._timer = setTimeout(this._onEnd, this._duration);
	}

	public drop(){
		if (this._timer === null) {
			return false;
		}
		if (this._timer !== null) {
			this._timer.unref();
			this._timer = null;
		}
	}

	private _onEnd(){
		if (this._timer === null) {
			return false;
		}
		this._timer = null;
		this.emit(this.EVENTS.onExpired);
	}
}

export class Request extends EventEmitter {

	public EVENTS = {
		onExpired: Symbol(),
		onEnd: Symbol()
	};

    private _logger     : Logger 	= new Logger('Http.Server.Request');
	private _created 	: Date 		= new Date();
    private _request    : HTTP.IncomingMessage;
	private _response   : HTTP.ServerResponse;
	private _lifecircle : Lifecircle;
	private _id 		: symbol;

    constructor(id: symbol, request: HTTP.IncomingMessage, response: HTTP.ServerResponse) {
		super();
		this._id 			= id;
        this._request   	= request;
		this._response  	= response;
		this._lifecircle 	= new Lifecircle(SETTINGS.RESET_TIMEOUT);
		this._lifecircleSubscribe();
		this._lifecircle.start();
	}

	private _lifecircleSubscribe(){
		this._lifecircle.on(this._lifecircle.EVENTS.onExpired, this._onExpired);
	}
	
	private _lifecircleUnsubscribe(){
		this._lifecircle.drop();
		this._lifecircle.removeAllListeners(this._lifecircle.EVENTS.onExpired);
	}

	private _onExpired(){
		this.close();
	}

	public getId(){
		return this._id;
	}

	public close(): Promise<void> {
		return new Promise((resolve, reject) => {
			this._lifecircleUnsubscribe();
			this._response.writeHead(200, { "Content-Type": "text/plain" });
			this._response.end(() => {
				this.emit(this.EVENTS.onExpired);
				resolve();
			});
		});
	}

	public send(_package: { headers?: Array<HTTP.OutgoingHttpHeaders> | null, data: any}): Promise<void> {
		return new Promise((resolve, reject) => {
			this._lifecircleUnsubscribe();
			if (_package.headers instanceof Array && _package.headers.length > 0){ 
				_package.headers instanceof Array &&_package.headers.forEach((header: HTTP.OutgoingHttpHeaders) => {
					this._response.writeHead(200, header);
				});
			} else {
				this._response.writeHead(200, { "Content-Type": "text/plain" });
			}
			this._response.write(_package.data, () => {
				this._response.end(() => {
					this.emit(this.EVENTS.onEnd);
					resolve();
				});
			});
		});
	}
}