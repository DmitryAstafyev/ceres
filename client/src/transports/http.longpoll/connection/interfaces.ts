import * as PlatformTypes from '../../../platform/enums/index';

export interface IConnectionParameters {
    host?: string,
    port?: number,
    type?: PlatformTypes.TRequestType
}