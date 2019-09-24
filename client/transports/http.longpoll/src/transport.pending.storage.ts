import { Tools, Token } from 'ceres.consumer';
import * as TransportProtocol from './protocols/transports/httt.longpoll/protocol.transport.longpoll';
import { Pending, TPandingExpectedMessage } from './transport.pending.task';

type THandler = (...args: any[]) => any;

export class PendingTasks extends Tools.EventEmitter {

    public static EVENTS = {
        onDisconnect: Symbol(),
        onError: Symbol(),
        onTask: Symbol(),
    };

    private _pending: Map<string, Pending> = new Map();
    private _urlGet: THandler | undefined;
    private _urlFree: THandler | undefined;
    private _clientGUID: string | undefined;
    private _token: Token | undefined;

    constructor() {
        super();
    }

    public start(urlGet: () => string, urlFree: (url: string) => void, clientGUID: string, token: Token): Error | void {
        if (this._pending.size > 0) {
            return new Error(`Pending connections are already exist. Count: ${this._pending.size}`);
        }
        this._urlGet = urlGet;
        this._urlFree = urlFree;
        this._clientGUID = clientGUID;
        this._token = token;
        this._add();
    }

    public stop() {
        this._pending.forEach((pending: Pending) => {
            (this._urlFree as THandler)(pending.getURL());
            pending.drop();
        });
        this._pending.clear();
    }

    private _add() {
        if (this._urlGet === undefined || this._urlFree === undefined || this._clientGUID === undefined || this._token === undefined) {
            return;
        }
        const pending = new Pending();
        const guid = pending.getGUID();
        const url = this._urlGet();
        pending.create(url, this._clientGUID, this._token).then((messages: TPandingExpectedMessage[]) => {
            (this._urlFree as THandler)(url);
            // Remove current
            this._pending.delete(guid);
            // Add new pending imedeately, while current in process
            this._add();
            messages.forEach((message: TPandingExpectedMessage) => {
                // Check income task
                if (TransportProtocol.Disconnect.instanceOf(message)) {
                    return this.emit(PendingTasks.EVENTS.onDisconnect, message);
                }
                // Trigger event
                this.emit(PendingTasks.EVENTS.onTask, message);
            });
        })
        .catch((errors: Error[]) => {
            (this._urlFree as THandler)(url);
            if (!(errors instanceof Array)) {
                errors = [errors];
            }
            errors.forEach((error: Error) => {
                this.emit(PendingTasks.EVENTS.onError, error);
            });
        });
        this._pending.set(guid, pending);
    }

}
