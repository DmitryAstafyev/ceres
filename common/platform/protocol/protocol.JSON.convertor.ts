import * as Tools from '../tools/index';
import { SCHEME             } from './protocol.scheme.definitions';
import { TYPES, getTSType   } from './protocol.types';


interface IConditionDescription {
    value   : any,
    property: string,
    type    : any
}

export class ProtocolJSONConvertor{

    private _JSON           : object;
    private _classes        : {[key:string]: string} = {};
    private _enums          : {[key:string]: string} = {};
    private _errors         : Array<Error> = [];
    private _logger         : Tools.Logger = new Tools.Logger('ProtocolJSONConvertor');
    private _implementation : string = '';

    constructor(JSON: any){
        
        if (Tools.getTypeOf(JSON) !== Tools.EPrimitiveTypes.object){
            throw new Error(this._logger.error(`Expects {object} as parameter, but was gotten: ${Tools.inspect(JSON)}`));
        }

        if (Object.keys(JSON).length !== 1){
            throw new Error(this._logger.error(`Expects {object} with one root property as parameter, but was gotten: ${Tools.inspect(JSON)}`));
        }

        const className = Object.keys(JSON)[0];
        const root      = JSON[className];

        if (!this._isComplexEntity(root)){
            throw new Error(this._logger.error(`root level should be entity with next sections: ${Object.keys(SCHEME.ENTITY).join(', ')}`));
        }

        this._parseComplexEtity(className, root);

        this._implementation = this._getModuleStr();
    }

    private _isDeclaredAlready(property: string){
        if (this._enums[property] !== void 0){
            this._errors.push(new Error(this._logger.error(`Section "${SCHEME.ENTITY.definitions}", property "${property}" declared twice as {Enum}.`))); 
            return true;
        }
        if (this._classes[property] !== void 0){
            this._errors.push(new Error(this._logger.error(`Section "${SCHEME.ENTITY.definitions}", property "${property}" declared twice as {Enum} and as {Class}.`))); 
            return true;
        }
        return false;
    }

    private _isComplexEntity(smth: any){
        if (Tools.getTypeOf(smth) !== Tools.EPrimitiveTypes.object){
            return false;
        }
        if (Tools.getTypeOf(smth[SCHEME.ENTITY.default]) !== Tools.EPrimitiveTypes.object){
            return false;
        }
        return true;
    }

    private _isPremitive(smth: any){
        if (Tools.getTypeOf(smth) !== Tools.EPrimitiveTypes.object){
            return false;
        }
        if (Tools.getTypeOf(smth[SCHEME.TYPE_DEF.in]) !== Tools.EPrimitiveTypes.string && 
            Tools.getTypeOf(smth[SCHEME.TYPE_DEF.type]) !== Tools.EPrimitiveTypes.string){
            return false;
        }
        return true;
    }

    private _getTypeOfPrimitive(property: string, smth: any){
        if (Tools.getTypeOf(smth[SCHEME.TYPE_DEF.in]) === Tools.EPrimitiveTypes.string){
            return smth[SCHEME.TYPE_DEF.in];
        }
        if (Tools.getTypeOf(smth[SCHEME.TYPE_DEF.type]) === Tools.EPrimitiveTypes.string){
            return getTSType(smth[SCHEME.TYPE_DEF.type]);
        }
        if (Tools.getTypeOf(smth[SCHEME.TYPE_DEF.type]) === Tools.EPrimitiveTypes.array){
            if (smth[SCHEME.TYPE_DEF.type].length !== 1){
                this._errors.push(new Error(this._logger.error(`Property "${property}" has wrong type definition: as an array it can have only one item, but it has: ${Tools.inspect(smth)}.`)));
                return;
            }
            return `Array<${getTSType(smth[SCHEME.TYPE_DEF.type][0])}>`;
        }
        this._errors.push(new Error(this._logger.error(`Property "${property}" has wrong type definition (not supported): ${Tools.inspect(smth)}.`))); 
    }

    private _isSimpleEntity(smth: any){
        if (Tools.getTypeOf(smth) !== Tools.EPrimitiveTypes.object){
            return false;
        }
        let result = true;
        Object.keys(smth).forEach((prop: string)=>{
            !this._isPremitive(smth[prop]) && (result = false);
        });
        return result;
    }

    private _validatePrimitive(smth: any){
        if (!this._isPremitive(smth)){
            return new Error(`Property isn't premitive.`);
        }
        if (Tools.getTypeOf(smth[SCHEME.AVAILABILITY.required]) !== Tools.EPrimitiveTypes.boolean && 
            Tools.getTypeOf(smth[SCHEME.AVAILABILITY.optional]) !== Tools.EPrimitiveTypes.boolean){
            return new Error(`Property should have definition for availability (${Object.keys(SCHEME.AVAILABILITY).join(' or ')})`);
        }
        if (smth[SCHEME.AVAILABILITY.required] === smth[SCHEME.AVAILABILITY.optional]){
            return new Error(`"required" and "optional" cannot be defined in same time.`);
        }
        if (Tools.getTypeOf(smth[SCHEME.TYPE_DEF.in]) === Tools.EPrimitiveTypes.string && this._enums[smth[SCHEME.TYPE_DEF.in]] === void 0){
            return new Error(`Enum "${smth[SCHEME.TYPE_DEF.in]}" isn't defined.`);
        }
        if (Tools.getTypeOf(smth[SCHEME.TYPE_DEF.type]) === Tools.EPrimitiveTypes.string && TYPES[smth[SCHEME.TYPE_DEF.type]] === void 0){
            return new Error(`Type "${smth[SCHEME.TYPE_DEF.type]}" is unknown.`);
        }
    }

    private _getConditionReferences(condition: any, rootProperties: any) : IConditionDescription | Error {
        if (Tools.getTypeOf(rootProperties) !== Tools.EPrimitiveTypes.object){
            return new Error(`Expected description of root properties will be {[key:string]: any}, but gotten: ${Tools.inspect(rootProperties)}.`);
        }
        if (Tools.getTypeOf(condition) !== Tools.EPrimitiveTypes.object){
            return new Error(`Condition has wrong description, expected {[key:string]: any}, but gotten: ${Tools.inspect(condition)}.`);
        }
        if (Object.keys(condition).length !== 1){
            return new Error(`Condition has wrong description, expected only one key for {[key:string]: any}, but gotten: ${Tools.inspect(condition)}.`);
        }
        const property = Object.keys(condition)[0];
        if (rootProperties[property] === void 0){
            return new Error(`Condition has wrong description: cannot find a property "${property}" in root class description: ${Tools.inspect(rootProperties)}.`);
        }
        if (!this._isPremitive(rootProperties[property])){
            return new Error(`Condition has wrong description: property "${property}" in root class has complex type, but conditions are supported only primitive types.`);
        }
        return {
            property: property,
            value: condition[property],
            type: rootProperties[property]
        };
    }

    private _parseComplexEtity(className: string, entity: any){
        //Processing definition section first
        if (Tools.getTypeOf(entity[SCHEME.ENTITY.definitions]) === Tools.EPrimitiveTypes.object){            
            const definitions = entity[SCHEME.ENTITY.definitions];
            //Stage #0. Check for basic errors
            Object.keys(definitions).forEach((property: string)=>{
                const description = definitions[property];
                if (!~[Tools.EPrimitiveTypes.array, Tools.EPrimitiveTypes.object].indexOf(Tools.getTypeOf(description))){
                    this._errors.push(new Error(this._logger.error(`Section "${SCHEME.ENTITY.definitions}", property "${property}" has wrong description. Expected: {array} or {object}.`))); 
                    return false;
                }
            });
            if (this._errors.length > 0) {
                throw new Error(`Cannot continue parsing due errors: ${this._errors.map((error: Error)=>{ return error.message;}).join('; ')}`);
            }
            //Stage #1. Processing only enums first
            Object.keys(definitions).forEach((property: string)=>{
                const description = definitions[property];
                //Enum is detected
                if (Tools.getTypeOf(description) === Tools.EPrimitiveTypes.array){
                    if (this._isDeclaredAlready(property)){
                        return false;
                    }
                    this._enums[property] = this._getEnumStr(description, property);
                    return true;
                }
            });
            //Stage #2. Processing simple classes
            Object.keys(definitions).forEach((property: string)=>{
                const description = definitions[property];
                //Simple entity is detected
                if (this._isSimpleEntity(description)){
                    if (this._isDeclaredAlready(property)){
                        return false;
                    }
                    this._classes[property] = this._getClassStr(description, property);
                    return true;
                }
            });
            //Stage #3. Processing complex classes
            Object.keys(definitions).forEach((property: string)=>{
                const description = definitions[property];
                //Complex entity is detected
                if (this._isComplexEntity(description)){
                    if (this._isDeclaredAlready(property)){
                        return false;
                    }
                    this._parseComplexEtity(property, description);
                    return true;
                }
            });
        }
        if (this._errors.length > 0) {
            throw new Error(`Cannot continue parsing due errors: ${this._errors.map((error: Error)=>{ return error.message;}).join('; ')}`);
        }

        //Create root class
        if (this._isDeclaredAlready(className)){
            return;
        }
        
        this._classes[className] = this._getClassStr(entity[SCHEME.ENTITY.default], className);

        //Proccessing cases section
        if (Tools.getTypeOf(entity[SCHEME.ENTITY.cases]) === Tools.EPrimitiveTypes.object){
            const cases = entity[SCHEME.ENTITY.cases];
            Object.keys(cases).forEach((caseClassName: string) => {
                if (this._isDeclaredAlready(caseClassName)){
                    return false;
                }
                const caseDesc = cases[caseClassName];
                if (Tools.getTypeOf(caseDesc) !== Tools.EPrimitiveTypes.array || caseDesc.length !== 2){
                    this._errors.push(new Error(this._logger.error(`Section "${SCHEME.ENTITY.cases}", case "${caseClassName}" has wrong description. Expected: array<Object>[2].`))); 
                    return false;
                }
                const conditions = caseDesc[0];
                const properties = caseDesc[1];
                let validConditions: any = {};
                Object.keys(conditions).forEach((condition: string) => {
                    const references = this._getConditionReferences({[condition]: conditions[condition]}, entity[SCHEME.ENTITY.default]);
                    if (references instanceof Error){
                        this._errors.push(references);
                        return false;
                    }
                    if (validConditions[references.property] !== void 0){
                        this._errors.push(new Error(this._logger.error(`Section "${SCHEME.ENTITY.cases}", case "${caseClassName}" condition "${references.property}" is defined more than once.`))); 
                        return false;
                    }
                    validConditions[references.property] = {
                        property: references.property,
                        value: references.value,
                        type: references.type
                    } as IConditionDescription;
                });
                if (this._errors.length > 0) {
                    return false;
                }
                this._classes[caseClassName] = this._getClassStr(properties, caseClassName, className, validConditions, entity[SCHEME.ENTITY.default]);
            });

        }
        if (this._errors.length > 0) {
            throw new Error(`Cannot continue parsing due errors: ${this._errors.map((error: Error)=>{ return error.message;}).join('; ')}`);
        }
    }

    private _getEnumStr(enumArray: Array<string>, property: string){
        return `enum ${property} {
${enumArray.map((key: string, index: number)=>{
            return `\t${key} = ${index},`;
        }).join('\n')}\n};`;
    }

    private _getParametersDeclaration(properties: any, conditions: { [key:string] : IConditionDescription } = {}, parentProps: { [key:string] : any } = {}){
        let parameters = Object.keys(properties).map((prop) => {
            return `${prop}${properties[prop][SCHEME.AVAILABILITY.optional]? '?' :''}:${this._getTypeOfPrimitive(prop, properties[prop])}`;
        });
        if (Tools.getTypeOf(parentProps) === Tools.EPrimitiveTypes.object){
            parameters.push(...Object.keys(parentProps).map((prop: string) => {
                const description = parentProps[prop];
                const optional = parentProps[prop][SCHEME.AVAILABILITY.optional] ? '?' :'';
                if (Tools.getTypeOf(description[SCHEME.TYPE_DEF.in]) === Tools.EPrimitiveTypes.string){
                    return `${prop}${optional}: ${description[SCHEME.TYPE_DEF.in]}`;
                }
                if (Tools.getTypeOf(description[SCHEME.TYPE_DEF.type]) === Tools.EPrimitiveTypes.string){
                    return `${prop}${optional}: ${this._getTypeOfPrimitive(prop, description)}`;
                }
                return null;
            }).filter((str: string) => {
                return str !== null;
            }));
        }
        return parameters;
    }

    private _getClassStr(properties: any, property: string, parent: string = '', conditions: { [key:string] : IConditionDescription } = {}, parentProps: any = {}){
        return `
export class ${property} ${parent !== '' ? ('extends ' + parent) : ''}{

${Object.keys(properties).map((prop) => {
        return `\tpublic ${prop}: ${this._getTypeOfPrimitive(prop, properties[prop])};`
    }).join('\n')}

    constructor(properties: { ${this._getParametersDeclaration(properties, conditions, parentProps).join(', ')} }) {
${parent !== '' ? this._getConditionsDefinitions('properties', conditions).map((str: string)=>{
            return `\t\t${str}`;
        }).join('\n') : ''}
        ${parent !== '' ? 'super(properties);' : ''}
        const name  : string = '${property}';
        const rules : {[key:string]: any}   = {
${Object.keys(properties).map((prop) => {
                const description = properties[prop];
                return `\t\t\t"${prop}": { ${Object.keys(description).map((prop) => {
                    if (Tools.getTypeOf(description[prop]) === Tools.EPrimitiveTypes.array){
                        return `"${prop}": ["${description[prop][0]}"]`;
                    } else {
                        return `"${prop}": "${description[prop]}"`;
                    }
                }).join(', ')} }`
            }).join(',\n')}
        }; 

        if (ProtocolClassValidator === null) {
            throw new Error(\`Instance of "\${name}" cannot be initialized due ProtocolClassValidator isn't defined.\`);
        }
        const protocolClassValidator = new ProtocolClassValidator(
            name,
            rules,
            __SchemeEnums,
            __SchemeClasses,
            properties
        );

        if (protocolClassValidator.getErrors().length > 0){
            throw new Error(\`Cannot initialize \${name} due errors: \${protocolClassValidator.getErrors().map((error: Error)=>{ return error.message; }).join(', ')}\`);
        }

${Object.keys(properties).map((prop) => {
            return `\t\tthis.${prop} = properties.${prop};`
        }).join('\n')}

    }
}
`;
    }

    private _getConditionsDefinitions(alias: string, conditions: { [key:string] : IConditionDescription }): Array<string> {
        return Object.keys(conditions).map((prop: string) => {
            const description = conditions[prop];
            if (Tools.getTypeOf(description.type[SCHEME.TYPE_DEF.in]) === Tools.EPrimitiveTypes.string){
                return `${alias}.${prop} = ${description.type[SCHEME.TYPE_DEF.in]}.${description.value};`;
            }
            if (Tools.getTypeOf(description.type[SCHEME.TYPE_DEF.type]) === Tools.EPrimitiveTypes.string){
                if (description.type[SCHEME.TYPE_DEF.type] === Tools.EPrimitiveTypes.string) {
                    return `${alias}.${prop} = "${description.value}";`;
                } else {
                    return `${alias}.${prop} = ${description.value};`;
                }
            }
            this._errors.push(new Error(this._logger.error(`Cannot parse next condition: ${Tools.inspect(description)}`)));
            return null;
        }).filter((str: string) => {
            return str !== null;
        });
    }

    private _getSchemeOfClasses(){
        return `
const __SchemeClasses : {[key:string]: any} = {
${Object.keys(this._classes).map((className: string)=>{
        return `\t${className}: ${className}`;
    }).join(',\n')}
}       
        `;
    }

    private _getSchemeOfEnums(){
        return `
const __SchemeEnums : {[key:string]: any} = {
${Object.keys(this._enums).map((enumName: string)=>{
        return `\t${enumName}: ${enumName}`;
    }).join(',\n')}
}     
        `;
    }

    private _getModuleStr(){
        return `
/*
* This file generated automaticaly (UTC: ${(new Date()).toUTCString()}). 
* Do not change it.
*/

let ProtocolClassValidator: any = null;

export function register(ProtocolClassValidatorRef: any) {
    ProtocolClassValidator = ProtocolClassValidatorRef;
};

${Object.keys(this._enums).map((enumName: string)=>{
            return this._enums[enumName];
        }).join('\n')}
${Object.keys(this._classes).map((className: string)=>{
            return this._classes[className];
        }).join('\n')}
${this._getSchemeOfClasses()}
${this._getSchemeOfEnums()}
        `;
    }

    public getErrors(){
        return this._errors;
    }

    public getImplementation(){
        return this._implementation;
    }

}