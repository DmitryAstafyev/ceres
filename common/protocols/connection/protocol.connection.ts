
/*
* This file generated automaticaly (UTC: Sat, 28 Apr 2018 15:34:24 GMT). 
* Do not change it.
*/


//======================== Generic values: begin ========================
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
//======================== Generic values: end   ========================


let ProtocolClassValidator: any = null;

export function register(ProtocolClassValidatorRef: any) {
    ProtocolClassValidator = ProtocolClassValidatorRef;
};

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

        if (ProtocolClassValidator === null) {
            throw new Error(`Instance of "${name}" cannot be initialized due ProtocolClassValidator isn't defined.`);
        }

        const protocolClassValidator = new ProtocolClassValidator(
            name,
            rules,
            __SchemeEnums,
            __SchemeClasses,
            properties
        );

        if (protocolClassValidator.getErrors().length > 0){
            throw new Error(`Cannot initialize ${name} due errors: ${protocolClassValidator.getErrors().map((error: Error)=>{ return error.message; }).join(', ')}`);
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

        if (ProtocolClassValidator === null) {
            throw new Error(`Instance of "${name}" cannot be initialized due ProtocolClassValidator isn't defined.`);
        }

        const protocolClassValidator = new ProtocolClassValidator(
            name,
            rules,
            __SchemeEnums,
            __SchemeClasses,
            properties
        );

        if (protocolClassValidator.getErrors().length > 0){
            throw new Error(`Cannot initialize ${name} due errors: ${protocolClassValidator.getErrors().map((error: Error)=>{ return error.message; }).join(', ')}`);
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

        if (ProtocolClassValidator === null) {
            throw new Error(`Instance of "${name}" cannot be initialized due ProtocolClassValidator isn't defined.`);
        }

        const protocolClassValidator = new ProtocolClassValidator(
            name,
            rules,
            __SchemeEnums,
            __SchemeClasses,
            properties
        );

        if (protocolClassValidator.getErrors().length > 0){
            throw new Error(`Cannot initialize ${name} due errors: ${protocolClassValidator.getErrors().map((error: Error)=>{ return error.message; }).join(', ')}`);
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

        if (ProtocolClassValidator === null) {
            throw new Error(`Instance of "${name}" cannot be initialized due ProtocolClassValidator isn't defined.`);
        }

        const protocolClassValidator = new ProtocolClassValidator(
            name,
            rules,
            __SchemeEnums,
            __SchemeClasses,
            properties
        );

        if (protocolClassValidator.getErrors().length > 0){
            throw new Error(`Cannot initialize ${name} due errors: ${protocolClassValidator.getErrors().map((error: Error)=>{ return error.message; }).join(', ')}`);
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

        if (ProtocolClassValidator === null) {
            throw new Error(`Instance of "${name}" cannot be initialized due ProtocolClassValidator isn't defined.`);
        }

        const protocolClassValidator = new ProtocolClassValidator(
            name,
            rules,
            __SchemeEnums,
            __SchemeClasses,
            properties
        );

        if (protocolClassValidator.getErrors().length > 0){
            throw new Error(`Cannot initialize ${name} due errors: ${protocolClassValidator.getErrors().map((error: Error)=>{ return error.message; }).join(', ')}`);
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
        
        