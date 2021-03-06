import { Tools } from 'ceres.consumer';
import ImpXMLHTTPRequest from './xmlhttprequest';

const SETTINGS = {
	DEFAULT_TIMEOUT: 30000, // 30sec
};

export class Request {

	private _request: 	ImpXMLHTTPRequest;
	private _timeout: 	Tools.TimerEmitter;
	private _id: 		string;

    constructor(
		url: 			string,
		post: 		string | Uint8Array,
		timeout: 	number = SETTINGS.DEFAULT_TIMEOUT,
	) {
		this._id 			= Tools.guid();
		this._timeout 		= new Tools.TimerEmitter(timeout);
		this._request   	= new ImpXMLHTTPRequest(url, post);
		this._timeout.subscribe(Tools.TimerEmitter.EVENTS.onTimeout, this._onTimeout.bind(this));
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	public getId() {
		return this._id;
	}

	public getXMLHttpRequest(): XMLHttpRequest {
		return this._request.getXMLHttpRequest();
	}

	public close() {
		this._destroy();
	}

	public send(modificator?: (request: XMLHttpRequest) => XMLHttpRequest): Promise<string | Uint8Array> {
		return this._request.send(modificator);
	}

	private _destroy() {
		this._timeout.drop();
		this._timeout.unsubscribeAll(Tools.TimerEmitter.EVENTS.onTimeout);
		this._request.close();
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Timer handlers
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	private _onTimeout() {
		this._destroy();
	}
}
