import { IConnectionParameters } from './interfaces';
import { TRequestType, ERequestTypes } from '../../../platform/enums/index';
import * as Tools from '../../../platform/tools/index';

const DEFAULTS = {
    port: 3000,
    type: ERequestTypes.post
};

export class ConnectionParameters implements IConnectionParameters {

    public port : number        | undefined;
    public type : TRequestType  | undefined;

    constructor( connection : IConnectionParameters ) {

        connection = Tools.objectValidate(connection, {
            port: DEFAULTS.port,
            type: DEFAULTS.type
        }) as IConnectionParameters;

        this.port = connection.port;
        this.type = connection.type;
    }

}