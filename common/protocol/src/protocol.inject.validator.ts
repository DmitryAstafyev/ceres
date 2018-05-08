const __SCHEME = {
    ENTITY: {
        default     : 'default',
        cases       : 'cases',
        definitions : 'definitions'
    },
    TYPE_DEF: {
        in          : 'in',
        type        : 'type'
    },
    AVAILABILITY: {
        required    : 'required',
        optional    : 'optional'
    },
    FIELDS: {
        findin      : 'findin'
    }
};

enum __ETypes {
    string = 'string',
    number = 'number',
    function = 'function',
    array = 'array',
    object = 'object',
    boolean = 'boolean',
    undefined = 'undefined',
    null = 'null',
    Error = 'Error',
    Date = 'Date'
};

function __getTypeOf(smth: any){
    if (typeof smth === __ETypes.undefined) {
        return __ETypes.undefined;
    } else if (smth === null) {
        return __ETypes.null;
    } else if (smth.constructor !== void 0 && typeof smth.constructor.name === __ETypes.string){
        return __ETypes[smth.constructor.name.toLowerCase()] !== void 0 ? smth.constructor.name.toLowerCase() : smth.constructor.name;
    } else {
        return (typeof smth);
    }
}

function getInstanceErrors(
    name            : string, 
    rules           : {[key:string]: any}, 
    SchemeEnums     : any, 
    SchemeClasses   : any, 
    properties      : any){
        const logger = (message: string) => {
            const msg = `ProtocolClassValidator:${name}:: ${message}.`;
            console.log(msg);
            return msg;
        };

        let _errors: Array<Error> = [];
        
        if (__getTypeOf(properties) !== __ETypes.object){
            _errors.push(new Error(logger(`Entity "${name}" isn't defined any parameters.`)));
        }
        if (Object.keys(rules).length === 0){
            _errors.push(new Error(logger(`Entity "${name}" doens't have defined rules.`)));
        }
        if (_errors.length > 0){
            return;
        }
        Object.keys(rules).forEach((prop)=>{
            const rule = rules[prop];
            //Check availablity
            if (__getTypeOf(rule[__SCHEME.AVAILABILITY.required]) !== __ETypes.boolean && 
                __getTypeOf(rule[__SCHEME.AVAILABILITY.optional]) !== __ETypes.boolean) {
                _errors.push(new Error(logger(`Entity "${name}", property "${prop}" not defined availability (required or optional)`)));
            }
            if (rule[__SCHEME.AVAILABILITY.required] === rule[__SCHEME.AVAILABILITY.optional]){
                _errors.push(new Error(logger(`Entity "${name}", property "${prop}" an availability defined incorrectly`)));
            }
            if (rule[__SCHEME.AVAILABILITY.required] && properties[prop] === void 0){
                _errors.push(new Error(logger(`Entity "${name}", property "${prop}" is required, but not defined.`)));
            }
            if (rule[__SCHEME.AVAILABILITY.optional] && properties[prop] === void 0){
                return true;
            }
            //Check availability of types
            if (rule[__SCHEME.TYPE_DEF.in] === void 0 && rule[__SCHEME.TYPE_DEF.type] === void 0){
                _errors.push(new Error(logger(`Entity "${name}", property "${prop}" is defined incorrectly. Not [type] not [in] aren't defined.`)));
            }
            //Check type / value
            if (rule[__SCHEME.TYPE_DEF.in] !== void 0) {
                if (__getTypeOf(rule[__SCHEME.TYPE_DEF.in]) !== __ETypes.string) {
                    _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. Expected [in] {string}.`)));
                }
                if (rule[__SCHEME.TYPE_DEF.in].trim() === '') {
                    _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. Value of [in] cannot be empty.`)));
                }
                const list = rule[__SCHEME.TYPE_DEF.in].trim();
                if (SchemeEnums[list] === void 0){
                    _errors.push(new Error(logger(`Entity "${name}", enum "${list}" isn't defined. Property "${prop}" cannot be intialized.`)));
                }
                if (SchemeEnums[list][properties[prop]] === void 0){
                    _errors.push(new Error(logger(`Entity "${name}", property "${prop}" should have value from enum "${list}".`)));
                }
                return true;
            } else if (rule[__SCHEME.TYPE_DEF.type] !== void 0){
                if (__getTypeOf(rule[__SCHEME.TYPE_DEF.type]) !== __ETypes.string){
                    _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. Expected [type] {string}.`)));
                }
                if (rule[__SCHEME.TYPE_DEF.type].trim() === '') {
                    _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. Value of [type] cannot be empty.`)));
                }
                //Check primitive types
                const PrimitiveTypes = [__ETypes.boolean, __ETypes.number, __ETypes.string, __ETypes.Date];
                if (!~PrimitiveTypes.indexOf(rule[__SCHEME.TYPE_DEF.type]) && SchemeClasses[rule[__SCHEME.TYPE_DEF.type]] === void 0){
                    _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. [type] isn't primitive type (${PrimitiveTypes.join(', ')}) and isn't instance of nested types (${Object.keys(SchemeClasses).join(', ')}).`)));
                }
                if (~PrimitiveTypes.indexOf(rule[__SCHEME.TYPE_DEF.type])){
                    if (__getTypeOf(properties[prop]) !== rule[__SCHEME.TYPE_DEF.type]){
                        _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. Expected type of property is: ${'{' + rule[__SCHEME.TYPE_DEF.type] + '}'}.`)));
                    }
                    return true;
                } else if (SchemeClasses[rule[__SCHEME.TYPE_DEF.type]] !== void 0){
                    let found = false;
                    //console.log(SchemeClasses);
                    Object.keys(SchemeClasses).forEach((schemeClass: any)=>{
                        SchemeClasses[schemeClass].name === properties[prop].constructor.name && (found = true);
                    });
                    if (!found){
                        _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. Expected property will be an instance of nested types (${Object.keys(SchemeClasses).join(', ')}).`)));
                    }
                    return true;
                } 
            }
        });
        return _errors.length === 0 ? null : _errors;
}
