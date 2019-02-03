
export interface IPrimitiveType<T> {
    tsType: string;
    binaryType: string;
    init: string;
    parse: (value: string | number | T) => T;
    serialize: (value: T) => string | number | boolean | T;
    validate: (value: string | number | T) => boolean;
    implementation?: () => {};
}

export const PrimitiveTypes:  { [key: string]: IPrimitiveType<any> } = {

    uint8     : {
        binaryType  : 'uint8',
        init        : '0',
        parse       : (value: number) => value,
        serialize   : (value: number) => value,
        tsType      : 'number',
        validate    : (value: number) => {
            if (typeof value !== 'number') {
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            if (!Number.isInteger(value)) {
                return false;
            }
            if (value < 0) {
                return false;
            }
            return true;
        },
    } as IPrimitiveType<number>,

    uint16     : {
        binaryType  : 'uint16',
        init        : '0',
        parse       : (value: number) => value,
        serialize   : (value: number) => value,
        tsType      : 'number',
        validate    : (value: number) => {
            if (typeof value !== 'number') {
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            if (!Number.isInteger(value)) {
                return false;
            }
            if (value < 0) {
                return false;
            }
            return true;
        },
    } as IPrimitiveType<number>,

    uint32     : {
        binaryType  : 'uint32',
        init        : '0',
        parse       : (value: number) => value,
        serialize   : (value: number) => value,
        tsType      : 'number',
        validate    : (value: number) => {
            if (typeof value !== 'number') {
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            if (!Number.isInteger(value)) {
                return false;
            }
            if (value < 0) {
                return false;
            }
            return true;
        },
    } as IPrimitiveType<number>,

    int8     : {
        binaryType  : 'int8',
        init        : '-1',
        parse       : (value: number) => value,
        serialize   : (value: number) => value,
        tsType      : 'number',
        validate    : (value: number) => {
            if (typeof value !== 'number') {
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            if (!Number.isInteger(value)) {
                return false;
            }
            return true;
        },
    } as IPrimitiveType<number>,

    int16     : {
        binaryType  : 'int16',
        init        : '-1',
        parse       : (value: number) => value,
        serialize   : (value: number) => value,
        tsType      : 'number',
        validate    : (value: number) => {
            if (typeof value !== 'number') {
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            if (!Number.isInteger(value)) {
                return false;
            }
            return true;
        },
    } as IPrimitiveType<number>,

    int32     : {
        binaryType  : 'int32',
        init        : '-1',
        parse       : (value: number) => value,
        serialize   : (value: number) => value,
        tsType      : 'number',
        validate    : (value: number) => {
            if (typeof value !== 'number') {
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            if (!Number.isInteger(value)) {
                return false;
            }
            return true;
        },
    } as IPrimitiveType<number>,

    float32     : {
        binaryType  : 'float32',
        init        : '-1',
        parse       : (value: number) => value,
        serialize   : (value: number) => value,
        tsType      : 'number',
        validate    : (value: number) => {
            if (typeof value !== 'number') {
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            if (!Number.isInteger(value)) {
                return false;
            }
            return true;
        },
    } as IPrimitiveType<number>,

    float64     : {
        binaryType  : 'float64',
        init        : '-1',
        parse       : (value: number) => value,
        serialize   : (value: number) => value,
        tsType      : 'number',
        validate    : (value: number) => {
            if (typeof value !== 'number') {
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            if (!Number.isInteger(value)) {
                return false;
            }
            return true;
        },
    } as IPrimitiveType<number>,

    string      : {
        binaryType  : 'utf8String',
        init        : '""',
        parse       : (value: string) => value,
        serialize   : (value: string) => value,
        tsType      : 'string',
        validate    : (value: string) => {
            if (typeof value !== 'string') {
                return false;
            }
            return true;
        },
    } as IPrimitiveType<string>,

    integer     : {
        binaryType  : 'int32',
        init        : '-1',
        parse       : (value: number) => value,
        serialize   : (value: number) => value,
        tsType      : 'number',
        validate    : (value: number) => {
            if (typeof value !== 'number') {
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            if (!Number.isInteger(value)) {
                return false;
            }
            return true;
        },
    } as IPrimitiveType<number>,

    float     : {
        binaryType  : 'float64',
        init        : '-1',
        parse       : (value: number) => value,
        serialize   : (value: number) => value,
        tsType      : 'number',
        validate    : (value: number) => {
            if (typeof value !== 'number') {
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            return true;
        },
    } as IPrimitiveType<number>,

    boolean     : {
        binaryType  : 'boolean',
        init        : 'false',
        parse       : (value: boolean) => value,
        serialize   : (value: boolean) => value,
        tsType      : 'boolean',
        validate    : (value: boolean) => {
            if (typeof value !== 'boolean') {
                return false;
            }
            return true;
        },
    } as IPrimitiveType<boolean>,

    datetime    : {
        binaryType  : 'float64',
        init        : 'new Date()',
        parse       : (value: number) => {
            return new Date(value);
        },
        serialize   : (value: Date) => value.getTime(),
        tsType      : 'Date',
        validate    : (value: number | Date) => {
            if (value instanceof Date) {
                return true;
            }
            if (typeof value !== 'number') {
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            if (!Number.isInteger(value)) {
                return false;
            }
            const date = new Date(value);
            if (!(date instanceof Date)) {
                return false;
            }
            if (date.toString().toLowerCase().indexOf('invalid date') !== -1) {
                return false;
            }
            return !isNaN(date.getTime());
        },
    } as IPrimitiveType<Date>,

    guid     : {
        binaryType  : 'asciiString',
        implementation  : function guid() {
            const lengths = [4, 4, 4, 8];
            let resultGuid = '';
            for (let i = lengths.length - 1; i >= 0; i -= 1) {
                resultGuid += (Math.round(Math.random() * Math.random() * Math.pow(10, lengths[i] * 2))
                            .toString(16)
                            .substr(0, lengths[i])
                            .toUpperCase() + '-');
            }
            resultGuid += ((new Date()).getTime() * (Math.random() * 100))
                        .toString(16)
                        .substr(0, 12)
                        .toUpperCase();
            return resultGuid;
        },
        init            : 'guid()',
        parse           : (value: string) => value,
        serialize       : (value: string) => value,
        tsType          : 'string',
        validate        : (value: string) => {
            return typeof value === 'string' ? (value.trim() !== '' ? true : false) : false;
        },

    } as IPrimitiveType<string>,

};
