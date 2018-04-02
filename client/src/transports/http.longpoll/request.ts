import * as Tools from '../../platform/tools/index';
import ImpXMLHTTPRequest from '../common/xmlhttprequest';
import { TTransportEvents } from '../../infrastructure/transport.events';
import { IRequest, TRequestBody } from '../../platform/interfaces/interface.request';
import * as Enums from '../../platform/enums/index';

const SETTINGS = {
	/*
	* Timeout should be twise less then timeout on client. For example client has 30 sec -> server should have 15 sec.
	*/
	RESET_TIMEOUT: 30000 //30sec
};

class Lifecircle extends Tools.EventEmitter {

	public EVENTS = {
		onExpired: Symbol()
	};

	private _timer		: number | null = null;
	private _duration	: number;

	constructor(duration: number) {
		super();
		this._duration 	= duration;
	}

	public start(){
		this._timer = setTimeout(this._onEnd.bind(this), this._duration);
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

	private _onEnd(){
		if (this._timer === null) {
			return false;
		}
		this._timer = null;
		this.emit(this.EVENTS.onExpired);
	}
}

const EVENTS = {
	expired: Symbol(),
	done: Symbol(),
	error: Symbol()
};

export class Request extends Tools.EventEmitter {

	static EVENTS = EVENTS;

    private _logger     : Tools.Logger = new Tools.Logger('Http.Server.Request');
	private _created 	: Date = new Date();
	private _request    : ImpXMLHTTPRequest | null;
	private _url 		: string;
	private _lifecircle : Lifecircle;
	private _id 		: string;
	private _clientGUID : string;
	private _method 	: Enums.ERequestTypes;

    constructor(clientGUID: string, url: string, method: Enums.ERequestTypes, post: TRequestBody) {
		super();
		this._clientGUID 	= clientGUID;
		this._method 		= method;
		this._id 			= Tools.guid();
		this._url  			= url;
		this._lifecircle 	= new Lifecircle(SETTINGS.RESET_TIMEOUT);
		this._lifecircleSubscribe();
		this._request   	= new ImpXMLHTTPRequest({
			url: this._url,
			method: this._method,
			post: {
				clientGUID: this._clientGUID,
				request: post
			} as IRequest
		});
		this._requestSubscribe();
		this._lifecircle.start();
	}

	private _lifecircleSubscribe(){
		this._lifecircle.subscribe(this._lifecircle.EVENTS.onExpired, this._onExpired.bind(this));
	}
	
	private _lifecircleUnsubscribe(){
		this._lifecircle.drop();
		this._lifecircle.unsubscribeAll(this._lifecircle.EVENTS.onExpired);
	}

	private _requestSubscribe(){
		if (this._request === null) {
			return false;
		}
		this._request.subscribe(TTransportEvents.done, this._onXMLHTTPRequestDone.bind(this));
		this._request.subscribe(TTransportEvents.error, this._onXMLHTTPRequestError.bind(this));
	}

	private _requestUnsubscribe(){
		if (this._request === null) {
			return false;
		}
		this._request.unsubscribeAll(TTransportEvents.done);
		this._request.unsubscribeAll(TTransportEvents.error);
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * ImpXMLHTTPRequest handlers
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	private _onXMLHTTPRequestDone(response: any){
		this.emit(EVENTS.done, response);
		this._destroy();
	}

	private _onXMLHTTPRequestError(error: Error, status: number, responseText: string){
		this.emit(EVENTS.error, error, status, responseText);
		this._destroy();
	}

	private _onExpired(){
		this.emit(EVENTS.expired);
		this._destroy();
	}

	private _destroy(){
		this._requestUnsubscribe();
		this._lifecircleUnsubscribe();
		this._request !== null && this._request.close();
		this._request = null;
	}

	public getId(){
		return this._id;
	}

	public close() {
		this._destroy();
	}

	public send(callback?: Function): Promise<void> {
		if (this._request === null) {
			return new Promise(( resolve, reject)=>{
				const error = new Error(this._logger.debug(`XMLHTTPRequest for ${this._url} isn't created.`));
				this._destroy();
				this.emit(EVENTS.error, error);
				reject(error);
			});
		}
		return this._request.send(callback);
	}
}