import * as Tools from '../../platform/tools/index';

export interface IMiddleware<TRequest, TResponse> {
    auth?    : (GUID: symbol, request: TRequest)                        => Promise<boolean>,
    before?  : (GUID: symbol, request: TRequest, response: TResponse)   => Promise<void>,
    after?   : (GUID: symbol)                                           => Promise<void>
}

export class Middleware<TRequest, TResponse> implements IMiddleware<TRequest, TResponse> {

    constructor(middleware: IMiddleware<TRequest, TResponse>){

        middleware = Tools.objectValidate(middleware, {
            auth    : this.auth,
            before  : this.before,
            after   : this.after
        }) as IMiddleware<TRequest, TResponse>;

        typeof middleware.auth      === 'function' && (this.auth    = middleware.auth);
        typeof middleware.before    === 'function' && (this.before  = middleware.before);
        typeof middleware.after     === 'function' && (this.after   = middleware.after);

    }

    /**
     * Dummy implementation of middleware functions
     */

    public auth(GUID: symbol, request: TRequest): Promise<boolean> {
        return new Promise((resolve, reject) => {
            return resolve(true);
        });
    }

    public before(GUID: symbol, request: TRequest, response: TResponse): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    public after(GUID: symbol): Promise<void>{
        return new Promise((resolve, reject) => {
            return resolve();
        });
    }

}