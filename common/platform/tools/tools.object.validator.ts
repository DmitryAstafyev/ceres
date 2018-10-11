/**
 * @class
 * Settings object validator
 *
 * @property {boolean} throwOnError         - Throw exeption on validation error
 * @property {boolean} recursive            - Check types nested objects also
 * @property {boolean} replaceIfMissed      - Replace value by default if missed on target object
 * @property {boolean} replaceIfWrongType   - Replace value by default if target object value has wrong type
 */

export class ObjectValidateParameters {

    public throwOnError: boolean;
    public recursive: boolean;
    public replaceIfMissed: boolean;
    public replaceIfWrongType: boolean;

    constructor(
        {
            throwOnError = true,
            recursive = true,
            replaceIfMissed = true,
            replaceIfWrongType = true,
        }: {
            throwOnError?: boolean,
            recursive?: boolean,
            replaceIfMissed?: boolean,
            replaceIfWrongType?: boolean,
        }) {
        this.throwOnError = throwOnError;
        this.recursive = recursive;
        this.replaceIfMissed = replaceIfMissed;
        this.replaceIfWrongType = replaceIfWrongType;
    }
}

export default function objectValidate(obj: any, defaults: any, params?: ObjectValidateParameters) {

    const parameters = params instanceof ObjectValidateParameters ? params : (new ObjectValidateParameters({}));

    let error: Error | null = null;

    if (typeof obj !== 'object' || obj === null) {
        error = new Error('Property [obj] expected to be [object].');
        if (parameters.throwOnError) {
            throw error;
        }
        return error;
    }

    if (typeof defaults !== 'object' || defaults === null) {
        error = new Error('Property [defaults] expected to be [object].');
        if (parameters.throwOnError) {
            throw error;
        }
        return error;
    }

    const objectValidator = (nestedObj: any, nestedDefaults: any) => {
        Object.keys(nestedDefaults).forEach((key) => {
            if (error !== null) {
                return false;
            }
            if (nestedObj[key] === void 0) {
                if (parameters.replaceIfMissed) {
                    nestedObj[key] = nestedDefaults[key];
                } else {
                    error = new Error(`key [${key}] isn't found in target object.`);
                }
            } else if (nestedObj[key] !== void 0 && typeof nestedDefaults[key] !== 'undefined' && typeof nestedDefaults[key] !== typeof nestedObj[key]) {
                if (parameters.replaceIfWrongType) {
                    nestedObj[key] = nestedDefaults[key];
                } else {
                    error = new Error(`key [${key}] has type <${(typeof nestedObj[key])}>, but expected: <${(typeof nestedDefaults[key])}>.`);
                }
            } else if (nestedDefaults[key] === null) {
                // Nothing to do
            } else if (nestedDefaults[key] instanceof Array) {
                arrayValidator(nestedObj[key], nestedDefaults[key], key);
            } else if (typeof nestedDefaults[key] === 'object') {
                objectValidator(nestedObj[key], nestedDefaults[key]);
            }
        });
    };

    const arrayValidator = (nestedObj: any[], nestedDefaults: any[], key: string) => {
        // Expecting that defaults[key][0] is a pattern of items in an array
        if (nestedDefaults.length !== 0) {
            error = new Error(`key [${key}] should have only one item, which is a pattern for validation target array in object.`);
            return false;
        }

        const itemPattern = nestedDefaults[0];

        nestedObj.forEach((item, index) => {
            if (typeof item !== typeof itemPattern) {
                if (parameters.replaceIfWrongType) {
                    nestedObj[index] = itemPattern;
                } else {
                    error = new Error(`key [${key}], array item #${index} has not expected type <${(typeof item)}>, but expected <${(typeof itemPattern)}>.`);
                }
            } else if (itemPattern instanceof Array) {
                arrayValidator(item, itemPattern, key);
            } else if (typeof itemPattern === 'object' && itemPattern !== null) {
                objectValidate(item, itemPattern);
            }
        });
    };

    objectValidator(obj, defaults);

    if (error !== null && parameters.throwOnError) {
        throw error;
    }
    return error !== null ? error : obj;

}
