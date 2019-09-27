// tslint:disable:object-literal-sort-keys
declare var process: any;

export type TOutputFunc = (...args: any[]) => any;

export function getDefaultLogLevel(): { [key: string]: boolean } {
    const levels: { [key: string]: boolean } = {
        ERROR: true,
        WARNING: false,
        DEBUG: false,
        INFO: false,
        ENV: false,
        VERBOS: false,
    };
    let level: any = 0;
    if (typeof process !== 'undefined' && process !== null && typeof process.env === 'object' && process.env !== null && process.env.CERES_LOGS_LEVEL !== void 0) {
        level = process.env.CERES_LOGS_LEVEL;
    } else if (typeof window !== 'undefined' && window !== null && (window as any).CERES_LOGS_LEVEL !== void 0) {
        level = (window as any).CERES_LOGS_LEVEL;
    }
    switch (level) {
        case 0:
        case '0':
            break;
        case 1:
        case '1':
            levels.WARNING = true;
            break;
        case 2:
        case '2':
            levels.WARNING = true; levels.DEBUG = true;
            break;
        case 3:
        case '3':
            levels.WARNING = true; levels.DEBUG = true; levels.INFO = true;
            break;
        case 4:
        case '4':
            levels.WARNING = true; levels.DEBUG = true; levels.INFO = true; levels.ENV = true;
            break;
        case 5:
        case '5':
            levels.WARNING = true; levels.DEBUG = true; levels.INFO = true; levels.ENV = true; levels.VERBOS = true;
            break;
        }
    return levels;
}

/**
 * @class
 * Settings of logger
 *
 * @property {boolean} console - Show / not show logs in console
 * @property {Function} output - Sends ready string message as argument to output functions
 */

export class LoggerParameters {

    public console: boolean = true;
    public allowedConsole: {[key: string]: boolean} = {};
    public output: TOutputFunc | null = null;

    constructor(
        {
            console         = true,
            output          = null,
            allowedConsole  = getDefaultLogLevel(),
        }: {
            console?: boolean,
            output?: TOutputFunc | null,
            allowedConsole?: {[key: string]: boolean },
        }) {
        this.console = console;
        this.output = output;
        this.allowedConsole = allowedConsole;
    }
}
