
export interface IPrimitiveType<T> {
    tsType          : string,
    init            : string,
    parse           : (value: string | number | T) => T,
    serialize       : (value: T) => string | number | boolean | T,
    validate        : (value: string | number | T) => boolean,
    implementation? : () => {}
}

export const PrimitiveTypes:  { [key: string]: IPrimitiveType<any> } = {

    string      : {
        tsType      : 'string',
        init        : '""',
        parse       : (value: string) => value,
        serialize   : (value: string) => value,
        validate    : (value: string) => {
            if (typeof value !== 'string') {
                return false;
            }
            return true;
        }
    } as IPrimitiveType<string>,

    integer     : {
        tsType      : 'number',
        init        : '-1',
        parse       : (value: number) => { return value; },
        serialize   : (value: number) => { return value; },
        validate    : (value: number) => { 
            if (typeof value !== 'number'){
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            if (!Number.isInteger(value)){
                return false;
            }
            return true;
        }
    } as IPrimitiveType<number>,

    float     : {
        tsType      : 'number',
        init        : '-1',
        parse       : (value: number) => { return value; },
        serialize   : (value: number) => { return value; },
        validate    : (value: number) => { 
            if (typeof value !== 'number'){
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            return true;
        }
    } as IPrimitiveType<number>,

    boolean     : {
        tsType      : 'boolean',
        init        : 'false',
        parse       : (value: boolean) => value,
        serialize   : (value: boolean) => value,
        validate    : (value: boolean) => { 
            if (typeof value !== 'boolean'){
                return false;
            }
            return true;
        }
    } as IPrimitiveType<boolean>,

    datetime    : {
        tsType      : 'Date',
        init        : 'new Date()',
        parse       : (value: number) => { 
            return new Date(value);
        },
        serialize   : (value: Date) => { return value.getTime(); },
        validate    : (value: number | Date) => {
            if (value instanceof Date) {
                return true;
            } 
            if (typeof value !== 'number'){
                return false;
            }
            if (isNaN(value)) {
                return false;
            }
            if (!Number.isInteger(value)){
                return false;
            }
            const date = new Date(value);
            if (!(date instanceof Date)){
                return false;
            }
            if (~date.toString().toLowerCase().indexOf('invalid date')){
                return false;
            }
            return !isNaN(date.getTime());
        }
    } as IPrimitiveType<Date>,

    guid     : {
        tsType          : 'string',
        init            : 'guid()',
        parse           : (value: string) => value,
        serialize       : (value: string) => value,
        validate        : (value: string) => { 
            return typeof value === 'string' ? (value.trim() !== '' ? true : false) : false;
        },
        implementation  : function guid(){
            const lengths = [4, 4, 4, 8];
            let guid = '';
            for (let i = lengths.length - 1; i >= 0; i -= 1){
                guid += (Math.round(Math.random() * Math.random() * Math.pow(10, lengths[i] * 2))
                            .toString(16)
                            .substr(0, lengths[i])
                            .toUpperCase() + '-');
            }
            guid += ((new Date()).getTime() * (Math.random() * 100))
                        .toString(16)
                        .substr(0, 12)
                        .toUpperCase();
            return guid;
        }
    } as IPrimitiveType<string>

};

