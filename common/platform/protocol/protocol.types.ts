import * as Tools from '../tools/index';

const logger: Tools.Logger = new Tools.Logger('ProtocolTypes');

export const TYPES: any = {
    string      : 'string',
    number      : 'number',
    boolean     : 'boolean',
    datetime    : 'datetime',
    date        : 'date',
    time        : 'time'
}

export const TYPES_CONVERTING: any = {
    datetime: { alias: 'Date' },
    date    : { alias: 'Date' },
    time    : { alias: 'Date' }
}

export function getTSType(protocolType: string){
    if (TYPES_CONVERTING[protocolType] !== void 0){
        return TYPES_CONVERTING[protocolType].alias;
    }
    return TYPES[protocolType] === void 0 ? protocolType : TYPES[protocolType];
}