import { Tools } from 'ceres.client.consumer';

import { IMiddleware, TConnectingMethod } from './consumer.middleware.interfaces';

export default class Middleware implements IMiddleware {

    constructor(middleware: IMiddleware) {

        middleware = Tools.objectValidate(middleware, {
            connecting: this.connecting,
        }) as IMiddleware;

        this.connecting = middleware.connecting as TConnectingMethod;
    }

    /**
     * Dummy implementation of middleware functions
     */

    public connecting(response: XMLHttpRequest, message: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            return resolve(true);
        });
    }

}
