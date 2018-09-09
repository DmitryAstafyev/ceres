export const AdvancedTypes: { [key:string]: any} = {
    byte: {
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
            if (value < 0 || value > 255) {
                return false;
            }
            return true;
        }
    }
};