
/*
* This file generated automaticaly (UTC: Mon, 30 Apr 2018 20:29:15 GMT). 
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
    error = 'error',
    date = 'date'
};

function __getTypeOf(smth: any){
    if (typeof smth === __ETypes.undefined) {
        return __ETypes.undefined;
    } else if (smth === null) {
        return __ETypes.null;
    } else if (smth.constructor !== void 0 && typeof smth.constructor.name === __ETypes.string){
        return smth.constructor.name.toLowerCase();
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
                const PrimitiveTypes = [__ETypes.boolean, __ETypes.number, __ETypes.string, __ETypes.date];
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



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Protocol implementation
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
enum Requests {
	HANDSHAKE = 0,
	AUTH = 1,
};
enum Responses {
	HANDSHAKE = 0,
	AUTH = 1,
};

export class message {

	public request: Requests | undefined;
	public response: Responses | undefined;
	public readonly guid: string = __generic.guid();
	public __key?: string = "";
    static signature: string = '38EB0007';
    constructor(properties: { request?:Requests, response?:Responses, guid:string }) {
        

        const name  : string = 'message';
        const rules : {[key:string]: any}   = {
			"request": { "in": "Requests", "optional": true },
			"response": { "in": "Responses", "optional": true }
        }; 

        const errors = getInstanceErrors(name,
            rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.request = properties.request;
		this.response = properties.response;

    }

    public getKey() {
        return this.__key;
    }

	public setKey(value: string) {
        this.__key = value;
    }

}


export class RequestHandshake extends message{

	public clientId: string;
	public __key?: string = "";
    static signature: string = '599A7F41';
    constructor(properties: { clientId:string, request?: Requests, response?: Responses, guid: string }) {
        super(Object.assign(properties, { 
        	request: Requests.HANDSHAKE
        }));

        const name  : string = 'RequestHandshake';
        const rules : {[key:string]: any}   = {
			"clientId": { "type": "string", "required": true }
        }; 

        const errors = getInstanceErrors(name,
            rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.clientId = properties.clientId;

    }

    public getKey() {
        return this.__key;
    }

	public setKey(value: string) {
        this.__key = value;
    }

}


export class RequestAuth extends message{

	public clientId: string;
	public obj: any;
	public __key?: string = "";
    static signature: string = '394E8770';
    constructor(properties: { clientId:string, obj:any, request?: Requests, response?: Responses, guid: string }) {
        super(Object.assign(properties, { 
        	request: Requests.AUTH
        }));

        const name  : string = 'RequestAuth';
        const rules : {[key:string]: any}   = {
			"clientId": { "type": "string", "required": true },
			"obj": { "type": "any", "required": true }
        }; 

        const errors = getInstanceErrors(name,
            rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.clientId = properties.clientId;
		this.obj = properties.obj;

    }

    public getKey() {
        return this.__key;
    }

	public setKey(value: string) {
        this.__key = value;
    }

}


export class ResponseHandshake extends message{

	public clientId: string;
	public status: boolean;
	public __key?: string = "";
    static signature: string = '42894AB1';
    constructor(properties: { clientId:string, status:boolean, request?: Requests, response?: Responses, guid: string }) {
        super(Object.assign(properties, { 
        	response: Responses.HANDSHAKE
        }));

        const name  : string = 'ResponseHandshake';
        const rules : {[key:string]: any}   = {
			"clientId": { "type": "string", "required": true },
			"status": { "type": "boolean", "required": true }
        }; 

        const errors = getInstanceErrors(name,
            rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.clientId = properties.clientId;
		this.status = properties.status;

    }

    public getKey() {
        return this.__key;
    }

	public setKey(value: string) {
        this.__key = value;
    }

}


export class ResponseAuth extends message{

	public clientId: string;
	public status: boolean;
	public __key?: string = "";
    static signature: string = '655331C2';
    constructor(properties: { clientId:string, status:boolean, request?: Requests, response?: Responses, guid: string }) {
        super(Object.assign(properties, { 
        	response: Responses.AUTH
        }));

        const name  : string = 'ResponseAuth';
        const rules : {[key:string]: any}   = {
			"clientId": { "type": "string", "required": true },
			"status": { "type": "boolean", "required": true }
        }; 

        const errors = getInstanceErrors(name,
            rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.clientId = properties.clientId;
		this.status = properties.status;

    }

    public getKey() {
        return this.__key;
    }

	public setKey(value: string) {
        this.__key = value;
    }

}


const __SchemeClasses : {[key:string]: any} = {
	message: message,
	RequestHandshake: RequestHandshake,
	RequestAuth: RequestAuth,
	ResponseHandshake: ResponseHandshake,
	ResponseAuth: ResponseAuth
}       
        

const __SchemeEnums : {[key:string]: any} = {
	Requests: Requests,
	Responses: Responses
}     
        

export const Protocol : {[key:string]: any} = {
    //Classes
	message: message,
	RequestHandshake: RequestHandshake,
	RequestAuth: RequestAuth,
	ResponseHandshake: ResponseHandshake,
	ResponseAuth: ResponseAuth, 
    //Enums
	Requests: Requests,
	Responses: Responses
}     
        
        