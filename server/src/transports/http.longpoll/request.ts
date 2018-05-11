
import * as HTTP from 'http';
import * as Tools from '../../platform/tools/index';
import { EventEmitter } from 'events';

const SETTINGS = {
	/*
	* Timeout should be twise less then timeout on client. For example client has 30 sec -> server should have 15 sec.
	*/
	RESET_TIMEOUT: 5000, //15sec
    SAFELY_SEND_TIMEOUT: 3000, //ms
};

const CORS = {
	key: 'Access-Control-Allow-Origin',
	value: '*'
};

const DEFAULT_HEADERS = {
	"Content-Type": "text/plain" 
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
		this._onEnd 	= this._onEnd.bind(this);
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
		onSent: Symbol(),
		onClose: Symbol()
	};

    private _logger     : Tools.Logger 	= new Tools.Logger('Http.Server.Request');
	private _created 	: Date 			= new Date();
    private _request    : HTTP.IncomingMessage;
	private _response   : HTTP.ServerResponse;
	private _lifecircle : Lifecircle;
	private _id 		: symbol;
	private _CORS 		: boolean;

    constructor(id: symbol, request: HTTP.IncomingMessage, response: HTTP.ServerResponse, CORS: boolean = true) {
		super();
		this._id 			= id;
        this._request   	= request;
		this._response  	= response;
		this._CORS 			= CORS;
		this._lifecircle 	= new Lifecircle(SETTINGS.RESET_TIMEOUT);
		this._lifecircleSubscribe();
		this._lifecircle.start();
	}

	private _lifecircleSubscribe(){
		this._lifecircle.on(this._lifecircle.EVENTS.onExpired, this._onExpired.bind(this));
	}
	
	private _lifecircleUnsubscribe(){
		this._lifecircle.drop();
		this._lifecircle.removeAllListeners(this._lifecircle.EVENTS.onExpired);
	}

	private _onExpired(){
		this.emit(this.EVENTS.onExpired);
		this.close();
	}

	private _isCORSDefined(headers: { [key: string]: string }): boolean {
		let result = false;
		if (Tools.getTypeOf(headers) === Tools.EPrimitiveTypes.object){
			let alias = CORS.key.toLowerCase();
			Object.keys(headers).forEach((key: string) => {
				if (key.toLowerCase() === alias){
					result = true;
				}
			});
		}
		return result;
	}

	private _addCORSToHeaders(headers: { [key: string]: string }) {
		if (Tools.getTypeOf(headers) === Tools.EPrimitiveTypes.object && this._CORS && !this._isCORSDefined(headers)){ 
			headers[CORS.key] = CORS.value;
		}
		return headers;
	}

	public getId(){
		return this._id;
	}

	public close(): Promise<void> {
		return new Promise((resolve, reject) => {
			this._lifecircleUnsubscribe();
			this._response.writeHead(200, this._addCORSToHeaders(DEFAULT_HEADERS));
			this._response.end('', () => {
				this.emit(this.EVENTS.onClose);
				resolve();
			});
		});
	}

	public send({ headers = {}, data = '', safely = false} : { headers?: { [key: string]: string }, data?: string, safely?: boolean}): Promise<void> {
		return new Promise((resolve, reject) => {
			this._lifecircleUnsubscribe();
			if (Tools.getTypeOf(headers) === Tools.EPrimitiveTypes.object && Object.keys(headers).length > 0){ 
				this._response.writeHead(200, this._addCORSToHeaders(headers));
			} else {
				this._response.writeHead(200, this._addCORSToHeaders(DEFAULT_HEADERS));
			}
			if (safely) {
				setTimeout(() => {
					this._response.write(data, () => {
						this._response.end(() => {
							this.emit(this.EVENTS.onSent);
							this.emit(this.EVENTS.onClose);
							resolve();
						});
					});
				}, SETTINGS.SAFELY_SEND_TIMEOUT);
			} else {
				this._response.write(data, () => {
					this._response.end(() => {
						this.emit(this.EVENTS.onSent);
						this.emit(this.EVENTS.onClose);
						resolve();
					});
				});
			}
		});
	}
}