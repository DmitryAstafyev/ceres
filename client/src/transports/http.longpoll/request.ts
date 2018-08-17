import * as Tools from '../../platform/tools/index';
import ImpXMLHTTPRequest from '../common/xmlhttprequest';

const SETTINGS = {
	DEFAULT_TIMEOUT: 30000 //30sec
};

export { IRequestError } from '../common/xmlhttprequest';

export class Request {

	private _request    : ImpXMLHTTPRequest;
	private _timeout  	: Tools.TimerEmitter;
	private _id 		: string;

    constructor(
		url: string, 
		post: string, 
		timeout: number = SETTINGS.DEFAULT_TIMEOUT
	) {
		this._id 			= Tools.guid();
		this._timeout 		= new Tools.TimerEmitter(timeout);
		this._request   	= new ImpXMLHTTPRequest(url, post);
		this._timeout.subscribe(Tools.TimerEmitter.EVENTS.onTimeout, this._onTimeout.bind(this));
	}

	private _destroy(){
		this._timeout.drop();
		this._timeout.unsubscribeAll(Tools.TimerEmitter.EVENTS.onTimeout);
		this._request.close();
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Timer handlers
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	private _onTimeout(){
		this._destroy();
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	public getId(){
		return this._id;
	}

	public close() {
		this._destroy();
	}

	public send(): Promise<string> {
		return this._request.send();
	}
}