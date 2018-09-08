import inspect from './tools.inspect';

const DEFAUT_ALLOWED_CONSOLE = {
    INFO: true,
    DEBUG: true,
    WARNING: true,
    VERBOS: false,
    ERROR: true,
    ENV: false,
    DEVELOP: true
};

enum ELogLevels {
    INFO = 'INFO',
    DEBUG = 'DEBUG',
    WARNING = 'WARNING',
    VERBOS = 'VERBOS',
    ERROR = 'ERROR',
    ENV = 'ENV',
    DEVELOP = 'DEVELOP'
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
    public allowedConsole: {[key:string]: boolean} = {};
    public output: Function | null = null;

    constructor(
        { 
            console         = true, 
            output          = null, 
            allowedConsole  = DEFAUT_ALLOWED_CONSOLE 
        } : { 
            console?        : boolean , 
            output?         : Function | null, 
            allowedConsole? : {[key:string]: boolean} 
        }){
        this.console = console;
        this.output = output;
        this.allowedConsole = allowedConsole;
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
        return this._log(this._getMessage(...args), ELogLevels.INFO);
    }

    /**
     * Publish warnings logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    warn(...args: Array<any>){
        return this._log(this._getMessage(...args), ELogLevels.WARNING);
    }

    /**
     * Publish verbose logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    verbose(...args: Array<any>){
        return this._log(this._getMessage(...args), ELogLevels.VERBOS);
    }

    /**
     * Publish error logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    error(...args: Array<any>){
        return this._log(this._getMessage(...args), ELogLevels.ERROR);
    }

    /**
     * Publish debug logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    debug(...args: Array<any>){
        return this._log(this._getMessage(...args), ELogLevels.DEBUG);
    }

    /**
     * Publish develop logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    dev(...args: Array<any>){
        return this._log(this._getMessage(...args), ELogLevels.DEVELOP);
    }

    /**
     * Publish environment logs (low-level stuff, support or tools)
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    env(...args: Array<any>){
        return this._log(this._getMessage(...args), ELogLevels.ENV);
    }

    _console(message: string, level: ELogLevels){
        if (!this._parameters.console){
            return false;
        }
        this._parameters.allowedConsole[level] && console.log(message);
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

    _log(message: string, level: ELogLevels){
        message = `[${this._signature}]: ${message}`;
        this._console(message, level);
        this._output(message);
        return message;
    }

}
