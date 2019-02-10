import inspect from './tools.inspect';
import { LoggerParameters } from './tools.logger.parameters';
import { StdoutController } from './tools.logger.stdout';

export enum ELogLevels {
    INFO = 'INFO',
    DEBUG = 'DEBUG',
    WARNING = 'WARNING',
    VERBOS = 'VERBOS',
    ERROR = 'ERROR',
    ENV = 'ENV',
}

let aliasMaxLength = 0;
const typeMaxLength = 7;

// tslint:disable-next-line:only-arrow-functions
const stdout: StdoutController | undefined = (function() {
    if (typeof process !== 'object' || process === null || (process as any).stdout === void 0 ) {
        return undefined;
    }
    return new StdoutController(process.stdout);
}());

/**
 * @class
 * Logger
 */
export default class Logger {

    private _signature: string = '';
    private _parameters: LoggerParameters = new LoggerParameters({});
    private _area: string | undefined;
    /**
     * @constructor
     * @param {string} signature        - Signature of logger instance
     * @param {LoggerParameters} params - Logger parameters
     */
    constructor(signature: string, params?: LoggerParameters) {
        params instanceof LoggerParameters && (this._parameters = params);
        this._signature = signature;
        if (aliasMaxLength < signature.length) {
            aliasMaxLength = signature.length;
        }
    }

    /**
     * Publish info logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    public info(...args: any[]) {
        return this._log(this._getMessage(...args), ELogLevels.INFO);
    }

    /**
     * Publish warnings logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    public warn(...args: any[]) {
        return this._log(this._getMessage(...args), ELogLevels.WARNING);
    }

    /**
     * Publish verbose logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    public verbose(...args: any[]) {
        return this._log(this._getMessage(...args), ELogLevels.VERBOS);
    }

    /**
     * Publish error logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    public error(...args: any[]) {
        return this._log(this._getMessage(...args), ELogLevels.ERROR);
    }

    /**
     * Publish debug logs
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    public debug(...args: any[]) {
        return this._log(this._getMessage(...args), ELogLevels.DEBUG);
    }

    /**
     * Publish environment logs (low-level stuff, support or tools)
     * @param {any} args - Any input for logs
     * @returns {string} - Formatted log-string
     */
    public env(...args: any[]) {
        return this._log(this._getMessage(...args), ELogLevels.ENV);
    }

    /**
     * Define target area before posting logs
     * @param {string} area - ID of target area
     * @returns {Logger} - returns instance of current logger
     */
    public area(area: string): Logger {
        if (typeof area !== 'string' || area.trim() === '') {
            return this;
        }
        this._area = area;
        return this;
    }

    private _console(message: string, level: ELogLevels) {
        if (!this._parameters.console) {
            return false;
        }
        if (!this._parameters.allowedConsole[level]) {
            return false;
        }
        if (stdout) {
            const area = this._area;
            this._area = undefined;
            stdout.out(message, area);
        } else {
            /* tslint:disable */
            console.log(message);
            /* tslint:enable */
        }
    }

    private _output(message: string): boolean {
        if (typeof this._parameters.output === 'function') {
            this._parameters.output(message);
            return true;
        }
        return false;
    }

    private _getMessage(...args: any[]) {
        let message = ``;
        if (args instanceof Array) {
            args.forEach((smth: any, index: number) => {
                if (typeof smth !== 'string') {
                    message = `${message} (type: ${(typeof smth)}): ${inspect(smth)}`;
                } else {
                    message = `${message}${smth}`;
                }
                index < (args.length - 1) && (message = `${message},\n `);
            });
        }
        return message;
    }

    private _log(message: string, level: ELogLevels) {
        message = `[${Date.now()}][${this._signature}${' '.repeat(aliasMaxLength - this._signature.length)}][${level}${' '.repeat(typeMaxLength - level.length)}]: ${message}`;
        !this._output(message) && this._console(message, level);
        return message;
    }

}
