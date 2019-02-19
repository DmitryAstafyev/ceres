import { Tools } from 'ceres.consumer';
import { IConnectionParameters } from './transport.parameters.interface';

const logger = new Tools.Logger('ConnectionParameters');

const DEFAULTS = {
    broadcast: 'CERES_BROADCAST_SUBDOMAINS_DATA_EXCHANGE',
    host: undefined,
    port: 3000,
};

export class ConnectionParameters implements IConnectionParameters {

    public host: string;
    public port: number | undefined;
    public broadcast: string;

    constructor( connection: IConnectionParameters ) {

        connection = Tools.objectValidate(connection, {
            broadcast: DEFAULTS.broadcast,
            host: DEFAULTS.host,
            port: DEFAULTS.port,
        }) as IConnectionParameters;

        this.host = connection.host !== undefined ? connection.host : '';
        this.port = connection.port;
        this.broadcast = connection.broadcast !== undefined ? connection.broadcast : '';

        if (typeof this.host !== 'string' || this.host.trim() === '') {
            throw new Error(logger.error(`Host should be defined at least. Check property [host] of connection parameters.`));
        }
    }

    public getURL() {
        return this.port !== undefined ? (this.host + ':' + this.port) : this.host;
    }

}
