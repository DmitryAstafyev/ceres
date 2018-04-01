import * as HTTP from 'http';
import * as Tools from '../../platform/tools/index';
import { IMiddleware } from './interfaces';
import { 
    TMiddlewareAfterFunction, 
    TMiddlewareBeforeFunction, 
    TMiddlewareAuthFunction,
    TMiddlewareAuthReturn,
    TMiddlewareBeforeReturn,
    TMiddlewareAfterReturn
} from './types';

export class Middleware implements IMiddleware {

    constructor(middleware: IMiddleware){

        middleware = Tools.objectValidate(middleware, {
            auth    : this.auth,
            before  : this.before,
            after   : this.after
        }) as IMiddleware;

        this.auth   = middleware.auth   as TMiddlewareAuthFunction;
        this.before = middleware.before as TMiddlewareBeforeFunction;
        this.after  = middleware.after  as TMiddlewareAfterFunction;

    }

    /**
     * Dummy implementation of middleware functions
     */

    public auth(GUID: symbol, request: HTTP.IncomingMessage): TMiddlewareAuthReturn {
        return new Promise((resolve, reject) => {
            return resolve();
        });
    }

    public before(GUID: symbol, request: HTTP.IncomingMessage, response: HTTP.ServerResponse): TMiddlewareBeforeReturn {
        return new Promise((resolve, reject) => {
            resolve({ request: request, response: response});
        });
    }

    public after(GUID: symbol): TMiddlewareAfterReturn{
        return new Promise((resolve, reject) => {
            return resolve();
        });
    }

}