
/*
* This file generated automaticaly (UTC: Sat, 28 Apr 2018 21:54:48 GMT). 
* Do not change it.
*/


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
Validation tools
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
const SCHEME = {
	ENTITY: {
		default: "default",
		cases: "cases",
		definitions: "definitions"
	},
	TYPE_DEF: {
		in: "in",
		type: "type"
	},
	AVAILABILITY: {
		required: "required",
		optional: "optional"
	},
	FIELDS: {
		findin: "findin"
	}
}
enum ETypes {
	string = "string",
	number = "number",
	function = "function",
	array = "array",
	object = "object",
	boolean = "boolean",
	undefined = "undefined",
	null = "null",
	error = "error",
	date = "date"
}

function getTypeOf(smth) {
    if (typeof smth === ETypes.undefined) {
        return ETypes.undefined;
    }
    else if (smth === null) {
        return ETypes.null;
    }
    else if (smth.constructor !== void 0 && typeof smth.constructor.name === ETypes.string) {
        return smth.constructor.name.toLowerCase();
    }
    else {
        return (typeof smth);
    }
}

function getInstanceErrors(name, rules, SchemeEnums, SchemeClasses, properties) {
    const logger = (message) => {
        const msg = `ProtocolClassValidator:${name}:: ${message}.`;
        console.log(msg);
        return msg;
    };
    let _errors = [];
    if (getTypeOf(properties) !== ETypes.object) {
        _errors.push(new Error(logger(`Entity "${name}" isn't defined any parameters.`)));
    }
    if (Object.keys(rules).length === 0) {
        _errors.push(new Error(logger(`Entity "${name}" doens't have defined rules.`)));
    }
    if (_errors.length > 0) {
        return;
    }
    Object.keys(rules).forEach((prop) => {
        const rule = rules[prop];
        //Check availablity
        if (getTypeOf(rule[SCHEME.AVAILABILITY.required]) !== ETypes.boolean &&
            getTypeOf(rule[SCHEME.AVAILABILITY.optional]) !== ETypes.boolean) {
            _errors.push(new Error(logger(`Entity "${name}", property "${prop}" not defined availability (required or optional)`)));
        }
        if (rule[SCHEME.AVAILABILITY.required] === rule[SCHEME.AVAILABILITY.optional]) {
            _errors.push(new Error(logger(`Entity "${name}", property "${prop}" an availability defined incorrectly`)));
        }
        if (rule[SCHEME.AVAILABILITY.required] && properties[prop] === void 0) {
            _errors.push(new Error(logger(`Entity "${name}", property "${prop}" is required, but not defined.`)));
        }
        if (rule[SCHEME.AVAILABILITY.optional] && properties[prop] === void 0) {
            return true;
        }
        //Check availability of types
        if (rule[SCHEME.TYPE_DEF.in] === void 0 && rule[SCHEME.TYPE_DEF.type] === void 0) {
            _errors.push(new Error(logger(`Entity "${name}", property "${prop}" is defined incorrectly. Not [type] not [in] aren't defined.`)));
        }
        //Check type / value
        if (rule[SCHEME.TYPE_DEF.in] !== void 0) {
            if (getTypeOf(rule[SCHEME.TYPE_DEF.in]) !== ETypes.string) {
                _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. Expected [in] {string}.`)));
            }
            if (rule[SCHEME.TYPE_DEF.in].trim() === '') {
                _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. Value of [in] cannot be empty.`)));
            }
            const list = rule[SCHEME.TYPE_DEF.in].trim();
            if (SchemeEnums[list] === void 0) {
                _errors.push(new Error(logger(`Entity "${name}", enum "${list}" isn't defined. Property "${prop}" cannot be intialized.`)));
            }
            if (SchemeEnums[list][properties[prop]] === void 0) {
                _errors.push(new Error(logger(`Entity "${name}", property "${prop}" should have value from enum "${list}".`)));
            }
            return true;
        }
        else if (rule[SCHEME.TYPE_DEF.type] !== void 0) {
            if (getTypeOf(rule[SCHEME.TYPE_DEF.type]) !== ETypes.string) {
                _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. Expected [type] {string}.`)));
            }
            if (rule[SCHEME.TYPE_DEF.type].trim() === '') {
                _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. Value of [type] cannot be empty.`)));
            }
            //Check primitive types
            const PrimitiveTypes = [ETypes.boolean, ETypes.number, ETypes.string, ETypes.date];
            if (!~PrimitiveTypes.indexOf(rule[SCHEME.TYPE_DEF.type]) && SchemeClasses[rule[SCHEME.TYPE_DEF.type]] === void 0) {
                _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. [type] isn't primitive type (${PrimitiveTypes.join(', ')}) and isn't instance of nested types (${Object.keys(SchemeClasses).join(', ')}).`)));
            }
            if (~PrimitiveTypes.indexOf(rule[SCHEME.TYPE_DEF.type])) {
                if (getTypeOf(properties[prop]) !== rule[SCHEME.TYPE_DEF.type]) {
                    _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. Expected type of property is: ${'{' + rule[SCHEME.TYPE_DEF.type] + '}'}.`)));
                }
                return true;
            }
            else if (SchemeClasses[rule[SCHEME.TYPE_DEF.type]] !== void 0) {
                let found = false;
                //console.log(SchemeClasses);
                Object.keys(SchemeClasses).forEach((schemeClass) => {
                    SchemeClasses[schemeClass].name === properties[prop].constructor.name && (found = true);
                });
                if (!found) {
                    _errors.push(new Error(logger(`Entity "${name}", property "${prop}" defined incorrectly. Expected property will be an instance of nested types (${Object.keys(SchemeClasses).join(', ')}).`)));
                }
                return true;
            }
        }
    });
    return _errors.length === 0 ? null : _errors;
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
Generic values stuff
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

class __Generic {
    guid() {
        const lengths = [4, 4, 4, 8];
        let result = '';
        for (let i = lengths.length - 1; i >= 0; i -= 1) {
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


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
Protocol implementation
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
        
        if (errors !== null){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.request = properties.request;
		this.response = properties.response;

    }
}


export class RequestHandshake extends message{

	public clientId: string;
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
        
        if (errors !== null){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.clientId = properties.clientId;

    }
}


export class RequestAuth extends message{

	public clientId: string;
	public obj: any;
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
        
        if (errors !== null){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.clientId = properties.clientId;
		this.obj = properties.obj;

    }
}


export class ResponseHandshake extends message{

	public clientId: string;
	public status: boolean;
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
        
        if (errors !== null){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.clientId = properties.clientId;
		this.status = properties.status;

    }
}


export class ResponseAuth extends message{

	public clientId: string;
	public status: boolean;
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
        
        if (errors !== null){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.clientId = properties.clientId;
		this.status = properties.status;

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
        
        