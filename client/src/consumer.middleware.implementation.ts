import { TRequestBody } from './consumer.middleware.types';
import * as Tools from './platform/tools/index';

import { IMiddleware } from './consumer.middleware.interfaces';

import {
    TMiddlewareAuthRequestBuilderFunction,
    TMiddlewareAuthRequestBuilderReturn,
    TMiddlewareAuthResponseParserFunction,
    TMiddlewareAuthResponseParserReturn,
} from './consumer.middleware.types';

export default class Middleware implements IMiddleware {

    constructor(middleware: IMiddleware) {

        middleware = Tools.objectValidate(middleware, {
            getAuthRequest      : this.getAuthRequest,
            processAuthRequest  : this.processAuthRequest,
        }) as IMiddleware;

        this.getAuthRequest = middleware.getAuthRequest as TMiddlewareAuthRequestBuilderFunction;
        this.processAuthRequest = middleware.processAuthRequest as TMiddlewareAuthResponseParserFunction;

    }

    /**
     * Dummy implementation of middleware functions
     */

    public getAuthRequest(GUID: symbol): TMiddlewareAuthRequestBuilderReturn {
        return new Promise((resolve, reject) => {
            return resolve({});
        });
    }

    public processAuthRequest(GUID: symbol, response: TRequestBody): TMiddlewareAuthResponseParserReturn {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }

}
