export const AdvancedTypes: { [key:string]: any} = {
    byte: {
        binaryType  : 'uint8',
        init        : '-1',
        parse       : (value: number) => { return value; },
        serialize   : (value: number) => { return value; },
        tsType      : 'number',
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
            if (value < 0 || value > 255) {
                return false;
            }
            return true;
        },
    }
};