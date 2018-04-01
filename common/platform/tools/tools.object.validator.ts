/**
 * @class
 * Settings object validator
 * 
 * @property {boolean} throwOnError         - Throw exeption on validation error
 * @property {boolean} recursive            - Check types nested objects also
 * @property {boolean} replaceIfMissed      - Replace value by default if missed on target object
 * @property {boolean} replaceIfWrongType   - Replace value by default if target object value has wrong type

 */
export class ObjectValidateParameters{

    public throwOnError: boolean;
    public recursive: boolean;
    public replaceIfMissed: boolean;
    public replaceIfWrongType: boolean;

    constructor(
        { 
            throwOnError = true, 
            recursive = true, 
            replaceIfMissed = true, 
            replaceIfWrongType = true 
        } : { 
            throwOnError?: boolean, 
            recursive?: boolean, 
            replaceIfMissed?: boolean, 
            replaceIfWrongType?: boolean 
        }){
        this.throwOnError = throwOnError;
        this.recursive = recursive;
        this.replaceIfMissed = replaceIfMissed;
        this.replaceIfWrongType = replaceIfWrongType;
    }
}

export default function objectValidate(obj: Object, defaults: Object, params?: ObjectValidateParameters){
    
    const parameters = params instanceof ObjectValidateParameters ? params : (new ObjectValidateParameters({}));
    
    let error : Error | null = null;
    
    if (typeof obj !== 'object' || obj === null){
        error = new Error('Property [obj] expected to be [object].');
        if (parameters.throwOnError) {
            throw error;
        }
        return error;
    }

    if (typeof defaults !== 'object' || defaults === null){
        error = new Error('Property [defaults] expected to be [object].');
        if (parameters.throwOnError) {
            throw error;
        }
        return error;
    }

    let objectValidator = (obj: any, defaults: any) => {
        Object.keys(defaults).forEach((key) => {
            if (error !== null){
                return false;
            }
            if (obj[key] === void 0) {
                if (parameters.replaceIfMissed) {
                    obj[key] = defaults[key];
                } else {
                    error = new Error(`key [${key}] isn't found in target object.`);
                }
            } else if (obj[key] !== void 0 && typeof defaults[key] !== 'undefined' && typeof defaults[key] !== typeof obj[key]){
                if (parameters.replaceIfWrongType) {
                    obj[key] = defaults[key];
                } else {
                    error = new Error(`key [${key}] has type <${(typeof obj[key])}>, but expected: <${(typeof defaults[key])}>.`);
                }
            } else if (defaults[key] === null) {
                //Nothing to do
            } else if (defaults[key] instanceof Array) {
                arrayValidator(obj[key], defaults[key], key);
            } else if (typeof defaults[key] === 'object'){
                objectValidator(obj[key], defaults[key]);
            }
        });    
    };

    let arrayValidator = (obj: Array<any>, defaults: Array<any>, key: string) => {
        //Expecting that defaults[key][0] is a pattern of items in an array
        if (defaults.length !== 0){
            error = new Error(`key [${key}] should have only one item, which is a pattern for validation target array in object.`);
            return false;
        }

        const itemPattern = defaults[0];

        obj.forEach((item, index) => {
            if (typeof item !== typeof itemPattern){
                if (parameters.replaceIfWrongType) {
                    obj[index] = itemPattern;
                } else {
                    error = new Error(`key [${key}], array item #${index} has not expected type <${(typeof item)}>, but expected <${(typeof itemPattern)}>.`);
                }
            } else if (itemPattern instanceof Array){
                arrayValidator(item, itemPattern, key);
            } else if (typeof itemPattern === 'object' && itemPattern !== null){
                objectValidate(item, itemPattern);
            }
        });
    };

    objectValidator(obj, defaults);

    if (error !== null && parameters.throwOnError) {
        throw error;
    }
    return error !== null ? error : obj;

};

