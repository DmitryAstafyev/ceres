import { IConnectionParameters } from './interfaces';

import * as Tools from '../../../platform/tools/index';

const DEFAULTS = {
    CORS: true,
    maxSize: 1024 * 100, // 100 kB
    port: 3000,
    tokenLife: 1000 * 60 * 60 * 1, // 1 h
};

export class ConnectionParameters implements IConnectionParameters {

    public port:        number | undefined;
    public maxSize:     number | undefined;
    public tokenLife:   number | undefined;
    public CORS:        boolean | undefined;

    constructor( connection: IConnectionParameters ) {

        connection = Tools.objectValidate(connection, {
            CORS: DEFAULTS.CORS,
            maxSize: DEFAULTS.maxSize,
            port: DEFAULTS.port,
            tokenLife: DEFAULTS.tokenLife,
        }) as IConnectionParameters;

        this.port = connection.port;
        this.maxSize = connection.maxSize;
        this.tokenLife = connection.tokenLife;
        this.CORS = connection.CORS;
    }

    public getPort(): number {
        return this.port as number;
    }

    public getMaxSize(): number {
        return this.maxSize as number;
    }

    public getTokenLife(): number {
        return this.tokenLife as number;
    }

    public getCORS(): boolean {
        return this.CORS as boolean;
    }

}
