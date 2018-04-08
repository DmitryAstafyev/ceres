import * as Tools from '../tools/index';
import { SCHEME } from './protocol.scheme.definitions';
import { ProtocolClassValidator } from './protocol.class.validator';


const logger: Tools.Logger = new Tools.Logger('Protocol');

const DEMO = {

    "default": {
        "event"     : { "type": "Event",   "optional": true },
        "request"   : { "type": "Request", "optional": true }
    },

    "cases": {

    },

    "definitions": {
        "Event":{
            "default": {
                "event"     : { "in"    : "Events",     "required": true },
                "guid"      : { "type"  : "string",     "required": true },
                "timestamp" : { "type"  : "datetime",   "optional": true }
            },
        
            "cases":{
                "EventMessageCreated":[{ "event": "MESSAGE_CREATED"}, {
                    "message"   : { "type"  : "string",     "required": true },
                    "time"      : { "type"  : "datetime",   "required": true },
                    "authorId"  : { "type"  : "string",     "required": true }
                }],
                "EventMessageChanged":[{ "event": "MESSAGE_CHANGED"}, {
                    "messageId" : { "type"  : "number",     "required": true },
                    "message"   : { "type"  : "string",     "required": true },
                    "time"      : { "type"  : "datetime",   "required": true }
                }],
                "EventMessageRemoved":[{ "event": "MESSAGE_REMOVED"}, {
                    "messageId" : { "type"  : "number",     "required": true },
                    "reason"    : { "in"    : "Reasons",    "required": true }
                }]
            },
        
            "definitions": {
                "Events"    : ["MESSAGE_CREATED", "MESSAGE_CHANGED", "MESSAGE_REMOVED"],
                "Reasons"   : ["BY_AUTHOR", "BY_MODERATOR", "BY_ADMINISTRATOR"]
            }
        },
        "Request": {
            "default": {
                "request"   : { "in"    : "Requests",   "required": true },
                "guid"      : { "type"  : "string",     "required": true }
            },
        
            "cases":{
                "RequestGetMessage":[{ "event": "GET_MESSAGES"}, {
                    "authorId"  : { "type"  : "string",     "required": true }
                }],
                "RequestGetProfile":[{ "event": "GET_PROFILE"}, {
                    "authorId"  : { "type"  : "string",     "required": true }
                }],
                "RequestSetProfile":[{ "event": "SET_PROFILE"}, {
                    "authorId"  : { "type"  : "string",     "required": true },
                    "nickname"  : { "type"  : "string",     "optional": true },
                    "firstName" : { "type"  : "string",     "optional": true },
                    "lastName"  : { "type"  : "string",     "optional": true },
                    "birthday"  : { "type"  : "datetime",   "optional": true },
                    "email"     : { "type"  : ["Email"],    "optional": true },
                    "phone"     : { "type"  : ["Phone"],    "optional": true }
                }]
            },
        
            "definitions": {
                "Requests"  : ["GET_MESSAGES", "GET_PROFILE", "SET_PROFILE"],
                "PhoneTypes": ["HOME", "GSM", "WORK"],
                "Email"     : { 
                    "address"   : { "type"  : "string",     "required": true },
                    "primary"   : { "type"  : "boolean",    "required": true }
                 },
                 "Phone"    : { 
                    "address"   : { "type"  : "string",     "required": true },
                    "type"      : { "in"    : "PhoneTypes", "required": true }
                 }
            }
        }
    }

};

const DEMO_ONE_LEVEL = {
    "Event":{
        "default": {
            "event"     : { "in"    : "Events",     "required": true },
            "guid"      : { "type"  : "string",     "required": true },
            "timestamp" : { "type"  : "datetime",   "optional": true }
        },
    
        "cases":{
            "EventMessageCreated":[{ "event": "MESSAGE_CREATED"}, {
                "message"   : { "type"  : "string",     "required": true },
                "time"      : { "type"  : "datetime",   "required": true },
                "authorId"  : { "type"  : "string",     "required": true }
            }],
            "EventMessageChanged":[{ "event": "MESSAGE_CHANGED"}, {
                "messageId" : { "type"  : "number",     "required": true },
                "message"   : { "type"  : "string",     "required": true },
                "time"      : { "type"  : "datetime",   "required": true }
            }],
            "EventMessageRemoved":[{ "event": "MESSAGE_REMOVED"}, {
                "messageId" : { "type"  : "number",     "required": true },
                "reason"    : { "in"    : "Reasons",    "required": true }
            }]
        },
    
        "definitions": {
            "Events"    : ["MESSAGE_CREATED", "MESSAGE_CHANGED", "MESSAGE_REMOVED"],
            "Reasons"   : ["BY_AUTHOR", "BY_MODERATOR", "BY_ADMINISTRATOR"]
        }
    }
};

const DEMO_EVENT = {
    "EventMessageChanged": {
        "event": "MESSAGE_CHANGED",
        "guid": "xxx-xxx-xxx-xxx",
        "messageId": 10000,
        "message": "test",
        "time": 100000000
    }
}

export class Protocol {

    private _implementation: any = null;
    private _scheme: object = null;
    private _url: string = '';

    constructor(implementation: any) { 
        this._implementation = implementation;
        this._implementation.register(ProtocolClassValidator);
    }

    public setSchemeByURL(url: string){

    }

    public setScheme(scheme: object){
        this._scheme = scheme;
    }

    public getFromString(str: string){
        if (this._scheme === null){
            throw new Error(logger.error(`Scheme should be setup first (before parsing operations).`));
        }

    }

    public getFromBuffer(){
        if (this._scheme === null){
            throw new Error(logger.error(`Scheme should be setup first (before parsing operations).`));
        }
    }


}

const TYPES: any = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    date: 'date'
}

export class ProtocolJSONConvertor{

    private _JSON: object;
    private _classes: {[key:string]: string} = {};
    private _enums: {[key:string]: string} = {};
    private _errors: Array<Error> = [];

    constructor(JSON: any){
        const logger = new Tools.Logger('ProtocolJSONConvertor');
        
        if (Tools.getTypeOf(JSON) !== Tools.EPrimitiveTypes.object){
            throw new Error(logger.error(`Expects {object} as parameter, but was gotten: ${Tools.inspect(JSON)}`));
        }

        if (Object.keys(JSON).length !== 1){
            throw new Error(logger.error(`Expects {object} with one root property as parameter, but was gotten: ${Tools.inspect(JSON)}`));
        }

        const className = Object.keys(JSON)[0];
        const root = JSON[className];

        if (!this._isComplexEntity(root)){
            throw new Error(logger.error(`root level should be entity with next sections: ${Object.keys(SCHEME.ENTITY).join(', ')}`));
        }

        //Processing definition section first
        if (Tools.getTypeOf(root[SCHEME.ENTITY.definitions]) === Tools.EPrimitiveTypes.object){
            const definitions = root[SCHEME.ENTITY.definitions];
            Object.keys(definitions).forEach((property: string)=>{
                const description = definitions[property];
                if (!~[Tools.EPrimitiveTypes.array, Tools.EPrimitiveTypes.object].indexOf(Tools.getTypeOf(description))){
                    this._errors.push(new Error(logger.error(`Section "${SCHEME.ENTITY.definitions}", property "${property}" has wrong description. Expected: {array} or {object}.`))); 
                    return false;
                }
                //Complex entity is detected
                if (this._isComplexEntity(description)){
                    if (this._isDeclaredAlready(property)){
                        return false;
                    }
                    
                    return true;
                }
                //Complex entity is detected
                if (this._isSimpleEntity(description)){
                    if (this._isDeclaredAlready(property)){
                        return false;
                    }
                    this._classes[property] = this._getClassStr(description, property);
                    return true;
                }
                //Enum is detected
                if (Tools.getTypeOf(description) === Tools.EPrimitiveTypes.array){
                    if (this._isDeclaredAlready(property)){
                        return false;
                    }
                    this._enums[property] = this._getEnumStr(description, property);
                    return true;
                }
            });
        }

        //Create root class
        if (this._isDeclaredAlready(className)){
            return;
        }
        
        this._classes[className] = this._getClassStr(root[SCHEME.ENTITY.default], className);

        console.log(this._enums);

        console.log(this._classes);

        console.log(this._errors);


    }

    private _isDeclaredAlready(property: string){
        if (this._enums[property] !== void 0){
            this._errors.push(new Error(logger.error(`Section "${SCHEME.ENTITY.definitions}", property "${property}" declared twice as {Enum}.`))); 
            return true;
        }
        if (this._classes[property] !== void 0){
            this._errors.push(new Error(logger.error(`Section "${SCHEME.ENTITY.definitions}", property "${property}" declared twice as {Enum} and as {Class}.`))); 
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

    private _getTypeOfPrimitive(smth: any){
        if (Tools.getTypeOf(smth[SCHEME.TYPE_DEF.in]) === Tools.EPrimitiveTypes.string){
            return smth[SCHEME.TYPE_DEF.in];
        }
        if (Tools.getTypeOf(smth[SCHEME.TYPE_DEF.type]) === Tools.EPrimitiveTypes.string){
            return smth[SCHEME.TYPE_DEF.type];
        }
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

    private _getEnumStr(enumArray: Array<string>, property: string){
        return `enum ${property} {\n${enumArray.map((key: string, index: number)=>{
            return `\t${key} = ${index},`;
        }).join('\n')}\n};`;
    }

    private _getClassStr(properties: any, property: string){
        return `
export class ${property} {

    ${Object.keys(properties).map((prop) => {
        return `\tpublic ${prop}: ${this._getTypeOfPrimitive(properties[prop])};`
    }).join('\n')}

    constructor(properties: any) {
        const name  : string = '${property}';
        const rules : {[key:string]: any}   = {
            ${Object.keys(properties).map((prop) => {
                const description = properties[prop];
                return `\t\t"${prop}": { ${Object.keys(description).map((prop) => {
                    if (Tools.getTypeOf(description[prop]) === Tools.EPrimitiveTypes.string){
                        return `"${prop}": "${description[prop]}"`;
                    } else {
                        return `"${prop}": ${description[prop]}`;
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
            return `\t\tthis.${prop} = parameters.${prop};`
        }).join('\n')}
    }
}
`;
    }

}

const convertor = new ProtocolJSONConvertor(DEMO_ONE_LEVEL);
/*
import * as Implementation from './protocol.generated';
const inst = new Protocol(Implementation);
const event = new Implementation.Event({});
console.log(inst);
*/
