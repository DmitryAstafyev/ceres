import { IConnectionParameters } from './transport.parameters.interfaces';

import { Tools } from 'ceres.server.provider';

const DEFAULTS = {
    CORS: true,
    maxSize: 1024 * 100, // 100 kB
    port: 3000,
    tokenLife: 1000 * 60 * 60 * 1, // 1 h
    wsPackageMaxSize: 1024 * 1024, // bytes
    wsProtocol: 'ceres',
};

export class ConnectionParameters implements IConnectionParameters {

    public port:                number | undefined;
    public maxSize:             number | undefined;
    public tokenLife:           number | undefined;
    public CORS:                boolean | undefined;
    public wsProtocol:          string | undefined;
    public wsPackageMaxSize:    number | undefined;

    constructor( connection: IConnectionParameters ) {

        connection = Tools.objectValidate(connection, {
            CORS: DEFAULTS.CORS,
            maxSize: DEFAULTS.maxSize,
            port: DEFAULTS.port,
            tokenLife: DEFAULTS.tokenLife,
            wsPackageMaxSize: DEFAULTS.wsPackageMaxSize,
            wsProtocol: DEFAULTS.wsProtocol,
        }) as IConnectionParameters;

        this.port = connection.port;
        this.maxSize = connection.maxSize;
        this.tokenLife = connection.tokenLife;
        this.CORS = connection.CORS;
        this.wsPackageMaxSize = connection.wsPackageMaxSize;
        this.wsProtocol = connection.wsProtocol;
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
