import * as Tools from '../../platform/tools/index';

export interface IMiddleware<TConnection> {
    auth?:      (clientId: string, request: TConnection) => Promise<void>;
    before?:    (clientId: string, request: TConnection) => Promise<void>;
    after?:     (clientId: string)                       => Promise<void>;
}

export class Middleware<TConnection> implements IMiddleware<TConnection> {

    constructor(middleware: IMiddleware<TConnection>) {

        middleware = Tools.objectValidate(middleware, {
            after   : this.after,
            auth    : this.auth,
            before  : this.before,
        }) as IMiddleware<TConnection>;

        typeof middleware.auth      === 'function' && (this.auth    = middleware.auth);
        typeof middleware.before    === 'function' && (this.before  = middleware.before);
        typeof middleware.after     === 'function' && (this.after   = middleware.after);

    }

    /**
     * Dummy implementation of middleware functions
     */

    public auth(clientId: string, request: TConnection): Promise<void> {
        return new Promise((resolve, reject) => {
            return resolve();
        });
    }

    public before(clientId: string, request: TConnection): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    public after(clientId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            return resolve();
        });
    }

}
