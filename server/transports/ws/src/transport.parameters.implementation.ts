import { IConnectionParameters } from './transport.parameters.interfaces';

import { Tools } from 'ceres.provider';

const DEFAULTS = {
    CORS: true,
    allowedHeaders: [],
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
    public allowedHeaders:      string[] | undefined;

    constructor( connection: IConnectionParameters ) {

        const _connection = Tools.objectValidate(connection, {
            CORS: DEFAULTS.CORS,
            maxSize: DEFAULTS.maxSize,
            port: DEFAULTS.port,
            tokenLife: DEFAULTS.tokenLife,
            wsPackageMaxSize: DEFAULTS.wsPackageMaxSize,
            wsProtocol: DEFAULTS.wsProtocol,
        }) as IConnectionParameters;

        this.port = _connection.port;
        this.maxSize = _connection.maxSize;
        this.tokenLife = _connection.tokenLife;
        this.CORS = _connection.CORS;
        this.wsPackageMaxSize = _connection.wsPackageMaxSize;
        this.wsProtocol = _connection.wsProtocol;
        this.allowedHeaders = connection.allowedHeaders instanceof Array ? connection.allowedHeaders : DEFAULTS.allowedHeaders;
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

    public getAllowedHeaders(): string[] | undefined {
        return this.allowedHeaders;
    }

}
