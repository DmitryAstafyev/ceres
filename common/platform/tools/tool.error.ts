
export default class ExtError<T> {

    public error: Error;
    public info: T | undefined;

    constructor (message: string, info?: T) {
        this.error = new Error(message);
        this.info = typeof info === 'object' ? (info !== null ? info : void 0) : void 0;
    }

}