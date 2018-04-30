import * as HTTP from 'http';
import * as Tools from '../../platform/tools/index';
import { IMiddleware } from './interfaces';
import { 
    TMiddlewareAfterFunction, 
    TMiddlewareValidFunction,
    TMiddlewareBeforeFunction, 
    TMiddlewareAuthFunction,
    TMiddlewareAuthReturn,
    TMiddlewareValidReturn,
    TMiddlewareBeforeReturn,
    TMiddlewareAfterReturn
} from './types';

export class Middleware implements IMiddleware {

    constructor(middleware: IMiddleware){

        middleware = Tools.objectValidate(middleware, {
            auth    : this.auth,
            valid   : this.valid,
            before  : this.before,
            after   : this.after
        }) as IMiddleware;

        this.auth   = middleware.auth   as TMiddlewareAuthFunction;
        this.valid  = middleware.valid  as TMiddlewareValidFunction;
        this.before = middleware.before as TMiddlewareBeforeFunction;
        this.after  = middleware.after  as TMiddlewareAfterFunction;

    }

    /**
     * Dummy implementation of middleware functions
     */

    public auth(GUID: symbol, request: HTTP.IncomingMessage): TMiddlewareAuthReturn {
        return new Promise((resolve, reject) => {
            return resolve(Tools.guid());
        });
    }

    public valid(GUID: symbol, request: HTTP.IncomingMessage): TMiddlewareValidReturn {
        return new Promise((resolve, reject) => {
            return resolve(true);
        });
    }

    public before(GUID: symbol, request: HTTP.IncomingMessage, response: HTTP.ServerResponse): TMiddlewareBeforeReturn {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    public after(GUID: symbol): TMiddlewareAfterReturn{
        return new Promise((resolve, reject) => {
            return resolve();
        });
    }

}