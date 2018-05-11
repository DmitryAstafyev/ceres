
/*
* This file generated automaticaly (UTC: Fri, 11 May 2018 14:30:48 GMT). 
* Do not remove or change this code.
*/


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Injections. This part of code is injected automaticaly. This functionlity is needed for normal 
* work of validation functionlity and for generic values.
* Do not remove or change this code.
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
class __Generic {

    guid(){
        const lengths = [4, 4, 4, 8];
        let result = '';
        for (let i = lengths.length - 1; i >= 0; i -= 1){
            result += (Math.round(Math.random() * Math.random() * Math.pow(10, lengths[i] * 2))
                        .toString(16)
                        .substr(0, lengths[i])
                        .toUpperCase() + '-');
        }
        result += ((new Date()).getTime() * (Math.random() * 100))
                    .toString(16)
                    .substr(0, 12)
                    .toUpperCase();
        return result;
    }

}

const __generic = new __Generic();

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
                if (SchemeEnums[list][properties[prop]] === void 0 && rule[__SCHEME.AVAILABILITY.required]){
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

const __SIGNATURE = '__signature';
const __RULES = '__rules';
const __TOKEN = { prop: '__token', setter: 'setToken' };

// declare var __SchemeClasses:any;

class __ProtocolTypes {

    Date(smth: any): Date | Error {
        if (smth instanceof Date) {
            return smth;
        }
        if (~['number', 'string'].indexOf(typeof smth)){
            try {
                const result = new Date(smth);
                if (~result.toString().toLowerCase().indexOf('invalid date')){
                    throw `Invalid Date is defined due value = "${smth}"`;
                }
                return result;
            } catch (e){
                return e;
            }
        }
        return new Error(`Cannot covert value of type = "${(typeof smth)}" to Date`);
    }
}

class __Parser {
    
    private types: __ProtocolTypes = new __ProtocolTypes();

    validate(json: any) {
        if (typeof json === 'string') {
            try {
                json = JSON.parse(json);
            } catch(e) {
                return new Error(`Cannot parse target due error: ${e.message}`);
            }
        }
        return json;
    }

    find(json: any) {
        if (typeof __SchemeClasses !== 'object' || __SchemeClasses === null) {
            return new Error(`Cannot find classes description.`);
        }
        if (typeof json !== 'object' || json === null) {
            return new Error(`Target isn't an object.`);
        }
        if (typeof json[__SIGNATURE] !== 'string'){
            return new Error(`Target doesn't have signature.`);
        }
        try {
            Object.keys(__SchemeClasses).forEach((className: string) => {
                const classImpl = __SchemeClasses[className];
                if (typeof classImpl[__SIGNATURE] !== 'string') {
                    throw new Error(`Cannot find signature for class "${className}".`);
                }
                if (classImpl[__SIGNATURE] === json[__SIGNATURE]) {
                    throw classImpl;
                }
            });
        } catch(smth) {
            return smth;
        }
        return null;
    }

    convert(json: any, root: boolean = true){
        //Conver to object
        json = this.validate(json);
        if (json instanceof Error){
            return json;
        }
        if (json === null || typeof json !== 'object'){
            return new Error(`Target should be an object and don't null.`);
        }
        //Try to find implementation
        const classImpl = this.find(json);
        if (classImpl instanceof Error){
            return classImpl;
        }
        if (classImpl === null){
            return new Error(`Implementation of class for target isn't found.`);
        }
        //Convert values to types
        Object.keys(json).forEach((prop: string) => {
            if (classImpl[__RULES][prop] === void 0){
                return;
            }
            if (typeof classImpl[__RULES][prop].type === 'string' && (this.types as any)[classImpl[__RULES][prop].type] !== void 0) {
                json[prop] = (this.types as any)[classImpl[__RULES][prop].type](json[prop]);
                if (json[prop] instanceof Error){
                    return new Error(`Cannot create convert values of target property "${prop}" due error: ${json[prop].message}`);
                }
            }
        });
        //Check nested implementations
        try {
            Object.keys(json).forEach((prop: string) => {
                const smth = json[prop];
                if (typeof smth === 'object' && smth !== null && typeof smth[__SIGNATURE] === 'string' && smth[__SIGNATURE].trim() !== ''){
                    //Probably it's implementation
                    json[prop] = this.convert(json[prop], false);
                }
            });
        } catch(e){
            return new Error(`Cannot create a nested instance of target due error: ${e.message}`);
        }
        //Try to make an instance
        let classInst;
        try {
            classInst = new classImpl(json);
        } catch(e){
            return new Error(`Cannot create instance of target due error: ${e.message}`);
        }
        if (root && json[__TOKEN.prop] !== void 0) {
            try {
                classInst[__TOKEN.setter](json[__TOKEN.prop]);
            } catch(e){
                return new Error(`Cannot set "${__TOKEN.prop}" of target's instance due error: ${e.message}`);
            }
        }
        return classInst;
    }

}

const __parser = new __Parser();

export const extract = __parser.convert.bind(__parser);

export function getToken(smth: any): string | Error {
    if (typeof smth === 'string') {
        try {
            smth = JSON.parse(smth);
        } catch (e){
            return e;
        }
    }
    if (typeof smth.getToken === 'function') {
        const token = smth.getToken();
        return typeof token === 'string' ? token.trim() : new Error('Wrong type of token.');
    }
    if (typeof smth.__token === 'string') {
        return smth.__token.trim();
    }
    return new Error(`No token found.`);
}


class ProtocolMessage {

    public __token: string = '';

    getToken(): string {
        return this.__token;
    }

    setToken(token: string) {
        if (typeof token !== 'string' || token.trim() === '') {
            throw new Error(`As value of token can be used only {string} type, but gotten: ${(typeof token)}`);
        }
        if (this.__token !== '') {
            throw new Error(`Token already has value. It's impossible to set value of token more then once.`);
        }
        this.__token = token;
    }

    getStr() {
        return JSON.stringify(this);
    }

    getJSON() {
        return JSON.parse(this.getStr());
    }

}



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Protocol implementation
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export enum Requests {
	HANDSHAKE = 0,
	HEARTBEAT = 1,
};
export enum Responses {
	HANDSHAKE = 0,
	HEARTBEAT = 1,
};
export enum Reasons {
	FAIL_AUTH = 0,
	NO_TOKEN_FOUND = 1,
	NO_CLIENT_ID_FOUND = 2,
	NO_TOKEN_PROVIDED = 3,
};

export class Message extends ProtocolMessage{

	public request: Requests | undefined;
	public response: Responses | undefined;
	public readonly guid: string = __generic.guid();
	public clientId: string;
    static __signature: string = '1EFD6368';
    public __signature: string = Message.__signature;
    static __rules : {[key:string]: any}   = {
		"request": { "in": "Requests", "optional": true },
		"response": { "in": "Responses", "optional": true },
		"clientId": { "type": "string", "required": true }
    };
    
    constructor(properties: { request?:Requests, response?:Responses, guid?:string, clientId:string }) {
        super();

        const name  : string = 'Message';

        const errors = getInstanceErrors(name,
            Message.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.request = properties.request;
		this.response = properties.response;
		this.clientId = properties.clientId;

    }

}


export class RequestHandshake extends Message{


    static __signature: string = '99E189F';
    public __signature: string = RequestHandshake.__signature;
    static __rules : {[key:string]: any}   = {

    };
    
    constructor(properties: { request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	request: Requests.HANDSHAKE
            }));

        const name  : string = 'RequestHandshake';

        const errors = getInstanceErrors(name,
            RequestHandshake.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }



    }

}


export class ResponseHandshake extends Message{

	public allowed: boolean;
	public token: string | undefined;
	public reason: Reasons | undefined;
	public error: string | undefined;
    static __signature: string = '5A3E1D6F';
    public __signature: string = ResponseHandshake.__signature;
    static __rules : {[key:string]: any}   = {
		"allowed": { "type": "boolean", "required": true },
		"token": { "type": "string", "optional": true },
		"reason": { "in": "Reasons", "optional": true },
		"error": { "type": "string", "optional": true }
    };
    
    constructor(properties: { allowed:boolean, token?:string, reason?:Reasons, error?:string, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	response: Responses.HANDSHAKE
            }));

        const name  : string = 'ResponseHandshake';

        const errors = getInstanceErrors(name,
            ResponseHandshake.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.allowed = properties.allowed;
		this.token = properties.token;
		this.reason = properties.reason;
		this.error = properties.error;

    }

}


export class Heartbeat extends Message{


    static __signature: string = '6918978B';
    public __signature: string = Heartbeat.__signature;
    static __rules : {[key:string]: any}   = {

    };
    
    constructor(properties: { request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	request: Requests.HEARTBEAT
            }));

        const name  : string = 'Heartbeat';

        const errors = getInstanceErrors(name,
            Heartbeat.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }



    }

}


const __SchemeClasses : {[key:string]: any} = {
	Message: Message,
	RequestHandshake: RequestHandshake,
	ResponseHandshake: ResponseHandshake,
	Heartbeat: Heartbeat
}       
        

const __SchemeEnums : {[key:string]: any} = {
	Requests: Requests,
	Responses: Responses,
	Reasons: Reasons
}     
        

export const Protocol : {[key:string]: any} = {
    //Classes
	Message: Message,
	RequestHandshake: RequestHandshake,
	ResponseHandshake: ResponseHandshake,
	Heartbeat: Heartbeat, 
    //Enums
	Requests: Requests,
	Responses: Responses,
	Reasons: Reasons,
    extract: __parser.convert.bind(__parser)
}     
        
        