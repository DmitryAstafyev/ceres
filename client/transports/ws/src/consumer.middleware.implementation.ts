import { Tools } from 'ceres.consumer';

import { IMiddleware, TConnectingMethod, TTouchMethod } from './consumer.middleware.interfaces';

export default class Middleware implements IMiddleware {

    constructor(middleware: IMiddleware) {

        middleware = Tools.objectValidate(middleware, {
            connecting: this.connecting,
            touch: this.touch,
        }) as IMiddleware;

        this.connecting = middleware.connecting as TConnectingMethod;
        this.touch = middleware.touch as TTouchMethod;

    }

    /**
     * Dummy implementation of middleware functions
     */

    public touch(request: XMLHttpRequest): XMLHttpRequest {
        return request;
    }

    public connecting(response: XMLHttpRequest, message: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            return resolve(true);
        });
    }

}
