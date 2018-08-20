
/*
* This file generated automaticaly (UTC: Mon, 20 Aug 2018 20:11:21 GMT). 
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
        if (__getTypeOf(rules) !== __ETypes.object){
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


export function extractSignature(smth: any): string | Error {
    if ((typeof smth !== 'object' || smth === null) && typeof smth !== 'function') {
        return new Error('No protocol found. As protocol expecting: constructor or instance of protocol.');
    }
    if (typeof smth.getSignature !== 'function' || typeof smth.getSignature() !== 'string' || smth.getSignature().trim() === ''){
        return new Error('No sigature of protocol found');
    }
    return smth.getSignature();
}


class ProtocolMessage {

    public __token: string = '';

    getToken(): string {
        return this.__token;
    }

    setToken(token: string) {
        if (typeof token !== 'string') {
            throw new Error(`As value of token can be used only {string} type, but gotten: ${(typeof token)}`);
        }
        if (this.__token !== '') {
            throw new Error(`Token already has value. It's impossible to set value of token more then once.`);
        }
        this.__token = token;
        return this;
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
	HOOK = 1,
	PENDING = 2,
	EVENT = 3,
	SUBSCRIBE = 4,
	UNSUBSCRIBE = 5,
	UNSUBSCRIBE_ALL = 6,
	REQUEST = 7,
};
export enum Responses {
	ERROR = 0,
	HANDSHAKE = 1,
	HOOK = 2,
	PENDING = 3,
	EVENT = 4,
	INCOME_EVENT = 5,
	SUBSCRIBE = 6,
	UNSUBSCRIBE = 7,
	UNSUBSCRIBE_ALL = 8,
	REQUEST = 9,
	REQUEST_RESULT = 10,
};
export enum Reasons {
	FAIL_AUTH = 0,
	NO_TOKEN_FOUND = 1,
	NO_CLIENT_ID_FOUND = 2,
	NO_TOKEN_PROVIDED = 3,
	TOKEN_IS_WRONG = 4,
	SERVER_SHUTDOWN = 5,
};

export class Message extends ProtocolMessage{

	public request: Requests | undefined;
	public response: Responses | undefined;
	public readonly guid: string = __generic.guid();
	public clientId: string;
    static __signature: string = '1EFD6368';
    public __signature: string = Message.__signature;
    static getSignature(){
        return Message.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
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
    static getSignature(){
        return RequestHandshake.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
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
	public reason: Reasons | undefined;
	public error: string | undefined;
    static __signature: string = '5A3E1D6F';
    public __signature: string = ResponseHandshake.__signature;
    static getSignature(){
        return ResponseHandshake.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"allowed": { "type": "boolean", "required": true },
		"reason": { "in": "Reasons", "optional": true },
		"error": { "type": "string", "optional": true }
    };
    
    constructor(properties: { allowed:boolean, reason?:Reasons, error?:string, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
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
		this.reason = properties.reason;
		this.error = properties.error;

    }

}


export class RequestHook extends Message{


    static __signature: string = '475CB775';
    public __signature: string = RequestHook.__signature;
    static getSignature(){
        return RequestHook.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {

    };
    
    constructor(properties: { request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	request: Requests.HOOK
            }));

        const name  : string = 'RequestHook';

        const errors = getInstanceErrors(name,
            RequestHook.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }



    }

}


export class ResponseHook extends Message{

	public reason: Reasons;
	public error: string | undefined;
    static __signature: string = '574501BD';
    public __signature: string = ResponseHook.__signature;
    static getSignature(){
        return ResponseHook.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"reason": { "in": "Reasons", "required": true },
		"error": { "type": "string", "optional": true }
    };
    
    constructor(properties: { reason:Reasons, error?:string, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	response: Responses.HOOK
            }));

        const name  : string = 'ResponseHook';

        const errors = getInstanceErrors(name,
            ResponseHook.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.reason = properties.reason;
		this.error = properties.error;

    }

}


export class RequestPending extends Message{


    static __signature: string = '5FA04EBF';
    public __signature: string = RequestPending.__signature;
    static getSignature(){
        return RequestPending.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {

    };
    
    constructor(properties: { request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	request: Requests.PENDING
            }));

        const name  : string = 'RequestPending';

        const errors = getInstanceErrors(name,
            RequestPending.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }



    }

}


export class ResponsePending extends Message{

	public reason: Reasons;
	public error: string | undefined;
    static __signature: string = '39B1ED31';
    public __signature: string = ResponsePending.__signature;
    static getSignature(){
        return ResponsePending.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"reason": { "in": "Reasons", "required": true },
		"error": { "type": "string", "optional": true }
    };
    
    constructor(properties: { reason:Reasons, error?:string, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	response: Responses.PENDING
            }));

        const name  : string = 'ResponsePending';

        const errors = getInstanceErrors(name,
            ResponsePending.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.reason = properties.reason;
		this.error = properties.error;

    }

}


export class EventRequest extends Message{

	public body: string;
	public protocol: string;
	public signature: string;
	public readonly eventId: string = __generic.guid();
    static __signature: string = 'FD7E792';
    public __signature: string = EventRequest.__signature;
    static getSignature(){
        return EventRequest.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"body": { "type": "string", "required": true },
		"protocol": { "type": "string", "required": true },
		"signature": { "type": "string", "required": true }
    };
    
    constructor(properties: { body:string, protocol:string, signature:string, eventId?:string, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	request: Requests.EVENT
            }));

        const name  : string = 'EventRequest';

        const errors = getInstanceErrors(name,
            EventRequest.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.body = properties.body;
		this.protocol = properties.protocol;
		this.signature = properties.signature;

    }

}


export class EventResponse extends Message{

	public eventId: string;
	public subscribers: number;
    static __signature: string = '3766E554';
    public __signature: string = EventResponse.__signature;
    static getSignature(){
        return EventResponse.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"eventId": { "type": "string", "required": true },
		"subscribers": { "type": "number", "required": true }
    };
    
    constructor(properties: { eventId:string, subscribers:number, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	response: Responses.EVENT
            }));

        const name  : string = 'EventResponse';

        const errors = getInstanceErrors(name,
            EventResponse.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.eventId = properties.eventId;
		this.subscribers = properties.subscribers;

    }

}


export class IncomeEvent extends Message{

	public body: string;
	public signature: string;
	public protocol: string;
	public readonly eventId: string = __generic.guid();
    static __signature: string = '59E39F8A';
    public __signature: string = IncomeEvent.__signature;
    static getSignature(){
        return IncomeEvent.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"body": { "type": "string", "required": true },
		"signature": { "type": "string", "required": true },
		"protocol": { "type": "string", "required": true }
    };
    
    constructor(properties: { body:string, signature:string, protocol:string, eventId?:string, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	response: Responses.INCOME_EVENT
            }));

        const name  : string = 'IncomeEvent';

        const errors = getInstanceErrors(name,
            IncomeEvent.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.body = properties.body;
		this.signature = properties.signature;
		this.protocol = properties.protocol;

    }

}


export class SubscribeRequest extends Message{

	public signature: string;
	public protocol: string;
    static __signature: string = '130E11BE';
    public __signature: string = SubscribeRequest.__signature;
    static getSignature(){
        return SubscribeRequest.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"signature": { "type": "string", "required": true },
		"protocol": { "type": "string", "required": true }
    };
    
    constructor(properties: { signature:string, protocol:string, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	request: Requests.SUBSCRIBE
            }));

        const name  : string = 'SubscribeRequest';

        const errors = getInstanceErrors(name,
            SubscribeRequest.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.signature = properties.signature;
		this.protocol = properties.protocol;

    }

}


export class SubscribeResponse extends Message{

	public signature: string;
	public protocol: string;
	public status: boolean;
    static __signature: string = '71401604';
    public __signature: string = SubscribeResponse.__signature;
    static getSignature(){
        return SubscribeResponse.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"signature": { "type": "string", "required": true },
		"protocol": { "type": "string", "required": true },
		"status": { "type": "boolean", "required": true }
    };
    
    constructor(properties: { signature:string, protocol:string, status:boolean, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	response: Responses.SUBSCRIBE
            }));

        const name  : string = 'SubscribeResponse';

        const errors = getInstanceErrors(name,
            SubscribeResponse.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.signature = properties.signature;
		this.protocol = properties.protocol;
		this.status = properties.status;

    }

}


export class UnsubscribeRequest extends Message{

	public signature: string;
	public protocol: string;
    static __signature: string = '5FDA0B89';
    public __signature: string = UnsubscribeRequest.__signature;
    static getSignature(){
        return UnsubscribeRequest.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"signature": { "type": "string", "required": true },
		"protocol": { "type": "string", "required": true }
    };
    
    constructor(properties: { signature:string, protocol:string, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	request: Requests.UNSUBSCRIBE
            }));

        const name  : string = 'UnsubscribeRequest';

        const errors = getInstanceErrors(name,
            UnsubscribeRequest.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.signature = properties.signature;
		this.protocol = properties.protocol;

    }

}


export class UnsubscribeResponse extends Message{

	public signature: string;
	public protocol: string;
	public status: boolean;
    static __signature: string = '78DB7595';
    public __signature: string = UnsubscribeResponse.__signature;
    static getSignature(){
        return UnsubscribeResponse.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"signature": { "type": "string", "required": true },
		"protocol": { "type": "string", "required": true },
		"status": { "type": "boolean", "required": true }
    };
    
    constructor(properties: { signature:string, protocol:string, status:boolean, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	response: Responses.UNSUBSCRIBE
            }));

        const name  : string = 'UnsubscribeResponse';

        const errors = getInstanceErrors(name,
            UnsubscribeResponse.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.signature = properties.signature;
		this.protocol = properties.protocol;
		this.status = properties.status;

    }

}


export class UnsubscribeAllRequest extends Message{

	public protocol: string;
    static __signature: string = '56672C38';
    public __signature: string = UnsubscribeAllRequest.__signature;
    static getSignature(){
        return UnsubscribeAllRequest.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"protocol": { "type": "string", "required": true }
    };
    
    constructor(properties: { protocol:string, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	request: Requests.UNSUBSCRIBE_ALL
            }));

        const name  : string = 'UnsubscribeAllRequest';

        const errors = getInstanceErrors(name,
            UnsubscribeAllRequest.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.protocol = properties.protocol;

    }

}


export class UnsubscribeAllResponse extends Message{

	public protocol: string;
	public status: boolean;
    static __signature: string = '66F5B536';
    public __signature: string = UnsubscribeAllResponse.__signature;
    static getSignature(){
        return UnsubscribeAllResponse.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"protocol": { "type": "string", "required": true },
		"status": { "type": "boolean", "required": true }
    };
    
    constructor(properties: { protocol:string, status:boolean, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	response: Responses.UNSUBSCRIBE_ALL
            }));

        const name  : string = 'UnsubscribeAllResponse';

        const errors = getInstanceErrors(name,
            UnsubscribeAllResponse.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.protocol = properties.protocol;
		this.status = properties.status;

    }

}


export class RequestRequest extends Message{

	public body: string;
	public protocol: string;
	public readonly requestId: string = __generic.guid();
    static __signature: string = '78405EC7';
    public __signature: string = RequestRequest.__signature;
    static getSignature(){
        return RequestRequest.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"body": { "type": "string", "required": true },
		"protocol": { "type": "string", "required": true }
    };
    
    constructor(properties: { body:string, protocol:string, requestId?:string, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	request: Requests.REQUEST
            }));

        const name  : string = 'RequestRequest';

        const errors = getInstanceErrors(name,
            RequestRequest.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.body = properties.body;
		this.protocol = properties.protocol;

    }

}


export class RequestResponse extends Message{

	public requestId: string;
	public processing: boolean;
    static __signature: string = '6D3F8A17';
    public __signature: string = RequestResponse.__signature;
    static getSignature(){
        return RequestResponse.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"requestId": { "type": "string", "required": true },
		"processing": { "type": "boolean", "required": true }
    };
    
    constructor(properties: { requestId:string, processing:boolean, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	response: Responses.REQUEST
            }));

        const name  : string = 'RequestResponse';

        const errors = getInstanceErrors(name,
            RequestResponse.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.requestId = properties.requestId;
		this.processing = properties.processing;

    }

}


export class RequestResultResponse extends Message{

	public requestId: string;
	public body: string;
    static __signature: string = '4AF39486';
    public __signature: string = RequestResultResponse.__signature;
    static getSignature(){
        return RequestResultResponse.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"requestId": { "type": "string", "required": true },
		"body": { "type": "string", "required": true }
    };
    
    constructor(properties: { requestId:string, body:string, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	response: Responses.REQUEST_RESULT
            }));

        const name  : string = 'RequestResultResponse';

        const errors = getInstanceErrors(name,
            RequestResultResponse.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.requestId = properties.requestId;
		this.body = properties.body;

    }

}


export class ResponseError extends Message{

	public allowed: boolean;
	public reason: Reasons | undefined;
	public error: string | undefined;
    static __signature: string = '3A462FE0';
    public __signature: string = ResponseError.__signature;
    static getSignature(){
        return ResponseError.__signature;
    }
    public getSignature(){
        return this.__signature;
    }
    static __rules : {[key:string]: any}   = {
		"allowed": { "type": "boolean", "required": true },
		"reason": { "in": "Reasons", "optional": true },
		"error": { "type": "string", "optional": true }
    };
    
    constructor(properties: { allowed:boolean, reason?:Reasons, error?:string, request?: Requests, response?: Responses, guid?: string, clientId: string }) {
        super(Object.assign(properties, { 
            	response: Responses.ERROR
            }));

        const name  : string = 'ResponseError';

        const errors = getInstanceErrors(name,
            ResponseError.__rules,
            __SchemeEnums,
            __SchemeClasses,
            properties);
        
        if (errors instanceof Array){
            throw new Error(`Cannot initialize ${name} due errors: ${errors.map((error: Error)=>{ return error.message; }).join(', ')}`);
        }

		this.allowed = properties.allowed;
		this.reason = properties.reason;
		this.error = properties.error;

    }

}


const __SchemeClasses : {[key:string]: any} = {
	Message: Message,
	RequestHandshake: RequestHandshake,
	ResponseHandshake: ResponseHandshake,
	RequestHook: RequestHook,
	ResponseHook: ResponseHook,
	RequestPending: RequestPending,
	ResponsePending: ResponsePending,
	EventRequest: EventRequest,
	EventResponse: EventResponse,
	IncomeEvent: IncomeEvent,
	SubscribeRequest: SubscribeRequest,
	SubscribeResponse: SubscribeResponse,
	UnsubscribeRequest: UnsubscribeRequest,
	UnsubscribeResponse: UnsubscribeResponse,
	UnsubscribeAllRequest: UnsubscribeAllRequest,
	UnsubscribeAllResponse: UnsubscribeAllResponse,
	RequestRequest: RequestRequest,
	RequestResponse: RequestResponse,
	RequestResultResponse: RequestResultResponse,
	ResponseError: ResponseError
}       
        

const __SchemeEnums : {[key:string]: any} = {
	Requests: Requests,
	Responses: Responses,
	Reasons: Reasons
}     
        
export const __signature = '4789235A';
export function getSignature() { return '4789235A'; };

export type TProtocolClasses = 
	Message |
	RequestHandshake |
	ResponseHandshake |
	RequestHook |
	ResponseHook |
	RequestPending |
	ResponsePending |
	EventRequest |
	EventResponse |
	IncomeEvent |
	SubscribeRequest |
	SubscribeResponse |
	UnsubscribeRequest |
	UnsubscribeResponse |
	UnsubscribeAllRequest |
	UnsubscribeAllResponse |
	RequestRequest |
	RequestResponse |
	RequestResultResponse |
	ResponseError;

export const Protocol : {[key:string]: any} = {
    //Classes
	Message: Message,
	RequestHandshake: RequestHandshake,
	ResponseHandshake: ResponseHandshake,
	RequestHook: RequestHook,
	ResponseHook: ResponseHook,
	RequestPending: RequestPending,
	ResponsePending: ResponsePending,
	EventRequest: EventRequest,
	EventResponse: EventResponse,
	IncomeEvent: IncomeEvent,
	SubscribeRequest: SubscribeRequest,
	SubscribeResponse: SubscribeResponse,
	UnsubscribeRequest: UnsubscribeRequest,
	UnsubscribeResponse: UnsubscribeResponse,
	UnsubscribeAllRequest: UnsubscribeAllRequest,
	UnsubscribeAllResponse: UnsubscribeAllResponse,
	RequestRequest: RequestRequest,
	RequestResponse: RequestResponse,
	RequestResultResponse: RequestResultResponse,
	ResponseError: ResponseError, 
    //Enums
	Requests: Requests,
	Responses: Responses,
	Reasons: Reasons,
    extract: __parser.convert.bind(__parser),
    __signature: "4789235A",
    extractSignature:  extractSignature,
    getSignature: () => { return '4789235A'; }
}     
        
        