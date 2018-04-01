import inspect from './tools.inspect';

const LEVELS = {
    INFO: Symbol(),
    DEBUG: Symbol(),
    WARNING: Symbol(),
    VERBOS: Symbol(),
    ERROR: Symbol()
};

/**
 * @class
 * Settings of logger
 * 
 * @property {boolean} console - Show / not show logs in console
 * @property {Function} output - Sends ready string message as argument to output functions
 */
export class LoggerParameters {

    public console: boolean = true;
    public output: Function | null = null;

    constructor({ console = true, output = null } : { console?: boolean , output?: Function }){
        this.console = console;
        this.output = output;
    }
}

/**
 * @class
 * Logger
 */
export default class Logger {
    
    private _signature: string = '';
    private _parameters: LoggerParameters = new LoggerParameters({});

    /**
     * @constructor
     * @param {string} signature        - Signature of logger instance
     * @param {LoggerParameters} params - Logger parameters
     */
    constructor(signature: string, params?: LoggerParameters) {
        params instanceof LoggerParameters && (this._parameters = params);
        this._signature = signature;
    }

    /**
     * Publish info logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    info(...args: Array<any>){
        return this._log(this._getMessage(...args), LEVELS.INFO);
    }

    /**
     * Publish warnings logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    warn(...args: Array<any>){
        return this._log(this._getMessage(...args), LEVELS.WARNING);
    }

    /**
     * Publish verbose logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    verbose(...args: Array<any>){
        return this._log(this._getMessage(...args), LEVELS.VERBOS);
    }

    /**
     * Publish error logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    error(...args: Array<any>){
        return this._log(this._getMessage(...args), LEVELS.ERROR);
    }

    /**
     * Publish debug logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    debug(...args: Array<any>){
        return this._log(this._getMessage(...args), LEVELS.DEBUG);
    }

    _console(message: string){
        this._parameters.console && console.log(message);
    }

    _output(message: string){
        typeof this._parameters.output === 'function' && this._parameters.output(message);

    }

    _getMessage(...args: Array<any>){
        let message = ``;
        if (args instanceof Array) {
            args.forEach((smth: any, index: number) => {
                if (typeof smth !== 'string'){
                    message = `${message} (type: ${(typeof smth)}): ${inspect(smth)}`;
                } else {
                    message = `${message}${smth}`;
                }
                index < (args.length - 1) && (message = `${message},\n `);
            });
        }
        return message;
    }

    _log(message: string, level: symbol){
        message = `[${this._signature}]: ${message}`;
        this._console(message);
        this._output(message);
        return message;
    }

}
