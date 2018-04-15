import * as Tools from '../../platform/tools/index';
import { SCHEME } from './protocol.scheme.definitions';

export class ProtocolClassValidator {
    
    private _errors: Array<Error> = [];

    constructor(
        name            : string, 
        rules           : {[key:string]: any}, 
        SchemeEnums     : any, 
        SchemeClasses   : any, 
        properties      : any) {

        const logger = new Tools.Logger(`ProtocolClassValidator:${name}`);

        if (Tools.getTypeOf(properties) !== Tools.EPrimitiveTypes.object){
            this._errors.push(new Error(logger.error(`Entity "${name}" isn't defined any parameters.`)));
        }
        if (Object.keys(rules).length === 0){
            this._errors.push(new Error(logger.error(`Entity "${name}" doens't have defined rules.`)));
        }
        if (this._errors.length > 0){
            return;
        }
        Object.keys(rules).forEach((prop)=>{
            const rule = rules[prop];
            //Check availablity
            if (Tools.getTypeOf(rule[SCHEME.AVAILABILITY.required]) !== Tools.EPrimitiveTypes.boolean && 
                Tools.getTypeOf(rule[SCHEME.AVAILABILITY.optional]) !== Tools.EPrimitiveTypes.boolean) {
                this._errors.push(new Error(logger.error(`Entity "${name}", property "${prop}" not defined availability (required or optional)`)));
            }
            if (rule[SCHEME.AVAILABILITY.required] === rule[SCHEME.AVAILABILITY.optional]){
                this._errors.push(new Error(logger.error(`Entity "${name}", property "${prop}" an availability defined incorrectly`)));
            }
            if (rule[SCHEME.AVAILABILITY.required] && properties[prop] === void 0){
                this._errors.push(new Error(logger.error(`Entity "${name}", property "${prop}" is required, but not defined.`)));
            }
            if (rule[SCHEME.AVAILABILITY.optional] && properties[prop] === void 0){
                return true;
            }
            //Check availability of types
            if (rule[SCHEME.TYPE_DEF.in] === void 0 && rule[SCHEME.TYPE_DEF.type] === void 0){
                this._errors.push(new Error(logger.error(`Entity "${name}", property "${prop}" is defined incorrectly. Not [type] not [in] aren't defined.`)));
            }
            //Check type / value
            if (rule[SCHEME.TYPE_DEF.in] !== void 0) {
                if (Tools.getTypeOf(rule[SCHEME.TYPE_DEF.in]) !== Tools.EPrimitiveTypes.string) {
                    this._errors.push(new Error(logger.error(`Entity "${name}", property "${prop}" defined incorrectly. Expected [in] {string}.`)));
                }
                if (rule[SCHEME.TYPE_DEF.in].trim() === '') {
                    this._errors.push(new Error(logger.error(`Entity "${name}", property "${prop}" defined incorrectly. Value of [in] cannot be empty.`)));
                }
                const list = rule[SCHEME.TYPE_DEF.in].trim();
                if (SchemeEnums[list] === void 0){
                    this._errors.push(new Error(logger.error(`Entity "${name}", enum "${list}" isn't defined. Property "${prop}" cannot be intialized.`)));
                }
                if (SchemeEnums[list][properties[prop]] === void 0){
                    this._errors.push(new Error(logger.error(`Entity "${name}", property "${prop}" should have value from enum "${list}", but has value ${Tools.inspect(properties[prop])}.`)));
                }
                return true;
            } else if (rule[SCHEME.TYPE_DEF.type] !== void 0){
                if (Tools.getTypeOf(rule[SCHEME.TYPE_DEF.type]) !== Tools.EPrimitiveTypes.string){
                    this._errors.push(new Error(logger.error(`Entity "${name}", property "${prop}" defined incorrectly. Expected [type] {string}.`)));
                }
                if (rule[SCHEME.TYPE_DEF.type].trim() === '') {
                    this._errors.push(new Error(logger.error(`Entity "${name}", property "${prop}" defined incorrectly. Value of [type] cannot be empty.`)));
                }
                //Check primitive types
                const PrimitiveTypes = [Tools.EPrimitiveTypes.boolean, Tools.EPrimitiveTypes.number, Tools.EPrimitiveTypes.string, Tools.EPrimitiveTypes.date];
                if (!~PrimitiveTypes.indexOf(rule[SCHEME.TYPE_DEF.type]) && SchemeClasses[rule[SCHEME.TYPE_DEF.type]] === void 0){
                    this._errors.push(new Error(logger.error(`Entity "${name}", property "${prop}" defined incorrectly. [type] isn't primitive type (${PrimitiveTypes.join(', ')}) and isn't instance of nested types (${Object.keys(SchemeClasses).join(', ')}).`)));
                }
                if (~PrimitiveTypes.indexOf(rule[SCHEME.TYPE_DEF.type])){
                    if (Tools.getTypeOf(properties[prop]) !== rule[SCHEME.TYPE_DEF.type]){
                        this._errors.push(new Error(logger.error(`Entity "${name}", property "${prop}" defined incorrectly. Expected type of property is: ${'{' + rule[SCHEME.TYPE_DEF.type] + '}'}, but actual type is: ${Tools.inspect(properties[prop])}`)));
                    }
                    return true;
                } else if (SchemeClasses[rule[SCHEME.TYPE_DEF.type]] !== void 0){
                    let found = false;
                    //console.log(SchemeClasses);
                    Object.keys(SchemeClasses).forEach((schemeClass: any)=>{
                        SchemeClasses[schemeClass].name === properties[prop].constructor.name && (found = true);
                    });
                    if (!found){
                        this._errors.push(new Error(logger.error(`Entity "${name}", property "${prop}" defined incorrectly. Expected property will be an instance of nested types (${Object.keys(SchemeClasses).join(', ')}), but actual type is: ${Tools.inspect(properties[prop])}.`)));
                    }
                    return true;
                } 
            }
        });
    }

    public getErrors(){
        return this._errors;
    }
}
