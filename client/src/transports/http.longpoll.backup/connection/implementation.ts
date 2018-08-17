import { IConnectionParameters } from './interfaces';
import { TRequestType, ERequestTypes } from '../../../platform/enums/enum.http.request.types';
import * as Tools from '../../../platform/tools/index';


const logger = new Tools.Logger('ConnectionParameters');

const DEFAULTS = {
    host: undefined,
    port: 3000,
    type: ERequestTypes.post
};

export class ConnectionParameters implements IConnectionParameters {

    public host : string;
    public port : number        | undefined;
    public type : TRequestType  | undefined;

    constructor( connection : IConnectionParameters ) {

        connection = Tools.objectValidate(connection, {
            host: DEFAULTS.host,
            port: DEFAULTS.port,
            type: DEFAULTS.type
        }) as IConnectionParameters;

        this.host = connection.host !== undefined ? connection.host : '';
        this.port = connection.port;
        this.type = connection.type;

        if (typeof this.host !== 'string' || this.host.trim() === ''){
            throw new Error(logger.error(`Host should be defined at least. Check property [host] of connection parameters.`));
        }
    }

    public getURL(){
        return this.port !== undefined ? (this.host + ':' + this.port) : this.host;
    }

}