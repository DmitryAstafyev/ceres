import { IConnectionParameters } from './interfaces';
import * as Tools from '../../../platform/tools/index';

const DEFAULTS = {
    port: 3000,
    maxSize: 1024 * 100, //100 kB
    tokenLife: 1000 * 60 * 60 * 1, //1 h
    CORS: true
};

export class ConnectionParameters implements IConnectionParameters {

    public port         : number | undefined;
    public maxSize      : number | undefined;
    public tokenLife    : number | undefined;
    public CORS         : boolean | undefined;

    constructor( connection : IConnectionParameters ) {

        connection = Tools.objectValidate(connection, {
            port: DEFAULTS.port,
            maxSize: DEFAULTS.maxSize,
            tokenLife: DEFAULTS.tokenLife,
            CORS: DEFAULTS.CORS
        }) as IConnectionParameters;

        this.port = connection.port;
        this.maxSize = connection.maxSize;
        this.tokenLife = connection.tokenLife;
        this.CORS = connection.CORS;
    }

    public getPort(): number{
        return this.port as number;
    }

    public getMaxSize(): number{
        return this.maxSize as number;
    }

    public getTokenLife(): number{
        return this.tokenLife as number;
    }

    public getCORS(): boolean{
        return this.CORS as boolean;
    }

}