
/*
* This file generated automaticaly (UTC: Sat, 14 Apr 2018 19:52:25 GMT). 
* Do not change it.
*/

let ProtocolClassValidator: any = null;

export function register(ProtocolClassValidatorRef: any) {
    ProtocolClassValidator = ProtocolClassValidatorRef;
};

enum Events {
	MESSAGE_CREATED = 0,
	MESSAGE_CHANGED = 1,
	MESSAGE_REMOVED = 2,
};
enum Reasons {
	BY_AUTHOR = 0,
	BY_MODERATOR = 1,
	BY_ADMINISTRATOR = 2,
};
enum Requests {
	GET_MESSAGES = 0,
	GET_PROFILE = 1,
	SET_PROFILE = 2,
};
enum PhoneTypes {
	HOME = 0,
	GSM = 1,
	WORK = 2,
};

export class Event {

	public event: Events;
	public guid: string;
	public timestamp: Date | undefined;
    static signature: string = '67338874';
    constructor(properties: { event:Events, guid:string, timestamp?:Date }) {
        

        const name  : string = 'Event';
        const rules : {[key:string]: any}   = {
			"event": { "in": "Events", "required": "true" },
			"guid": { "type": "string", "required": "true" },
			"timestamp": { "type": "datetime", "optional": "true" }
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

		this.event = properties.event;
		this.guid = properties.guid;
		this.timestamp = properties.timestamp;

    }
}


export class EventMessageCreated extends Event{

	public message: string;
	public time: Date;
	public authorId: string;
    static signature: string = '294700383';
    constructor(properties: { message:string, time:Date, authorId:string, event: Events, guid: string, timestamp?: Date }) {
        super(Object.assign(properties, { 
        	event: Events.MESSAGE_CREATED
        }));

        const name  : string = 'EventMessageCreated';
        const rules : {[key:string]: any}   = {
			"message": { "type": "string", "required": "true" },
			"time": { "type": "datetime", "required": "true" },
			"authorId": { "type": "string", "required": "true" }
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

		this.message = properties.message;
		this.time = properties.time;
		this.authorId = properties.authorId;

    }
}


export class EventMessageChanged extends Event{

	public messageId: number;
	public message: string;
	public time: Date;
    static signature: string = '-1333370605';
    constructor(properties: { messageId:number, message:string, time:Date, event: Events, guid: string, timestamp?: Date }) {
        super(Object.assign(properties, { 
        	event: Events.MESSAGE_CHANGED
        }));

        const name  : string = 'EventMessageChanged';
        const rules : {[key:string]: any}   = {
			"messageId": { "type": "number", "required": "true" },
			"message": { "type": "string", "required": "true" },
			"time": { "type": "datetime", "required": "true" }
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

		this.messageId = properties.messageId;
		this.message = properties.message;
		this.time = properties.time;

    }
}


export class EventMessageRemoved extends Event{

	public messageId: number;
	public reason: Reasons;
    static signature: string = '-2094508313';
    constructor(properties: { messageId:number, reason:Reasons, event: Events, guid: string, timestamp?: Date }) {
        super(Object.assign(properties, { 
        	event: Events.MESSAGE_REMOVED
        }));

        const name  : string = 'EventMessageRemoved';
        const rules : {[key:string]: any}   = {
			"messageId": { "type": "number", "required": "true" },
			"reason": { "in": "Reasons", "required": "true" }
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

		this.messageId = properties.messageId;
		this.reason = properties.reason;

    }
}


export class Email {

	public address: string;
	public primary: boolean;
    static signature: string = '67066748';
    constructor(properties: { address:string, primary:boolean }) {
        

        const name  : string = 'Email';
        const rules : {[key:string]: any}   = {
			"address": { "type": "string", "required": "true" },
			"primary": { "type": "boolean", "required": "true" }
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

		this.address = properties.address;
		this.primary = properties.primary;

    }
}


export class Phone {

	public address: string;
	public type: PhoneTypes;
    static signature: string = '77090126';
    constructor(properties: { address:string, type:PhoneTypes }) {
        

        const name  : string = 'Phone';
        const rules : {[key:string]: any}   = {
			"address": { "type": "string", "required": "true" },
			"type": { "in": "PhoneTypes", "required": "true" }
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

		this.address = properties.address;
		this.type = properties.type;

    }
}


export class Request {

	public request: Requests;
	public guid: string;
    static signature: string = '-1534621073';
    constructor(properties: { request:Requests, guid:string }) {
        

        const name  : string = 'Request';
        const rules : {[key:string]: any}   = {
			"request": { "in": "Requests", "required": "true" },
			"guid": { "type": "string", "required": "true" }
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
		this.guid = properties.guid;

    }
}


export class RequestGetMessage extends Request{

	public authorId: string;
    static signature: string = '1195348687';
    constructor(properties: { authorId:string, request: Requests, guid: string }) {
        super(Object.assign(properties, { 
        	request: Requests.GET_MESSAGES
        }));

        const name  : string = 'RequestGetMessage';
        const rules : {[key:string]: any}   = {
			"authorId": { "type": "string", "required": "true" }
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

		this.authorId = properties.authorId;

    }
}


export class RequestGetProfile extends Request{

	public authorId: string;
    static signature: string = '-490844435';
    constructor(properties: { authorId:string, request: Requests, guid: string }) {
        super(Object.assign(properties, { 
        	request: Requests.GET_PROFILE
        }));

        const name  : string = 'RequestGetProfile';
        const rules : {[key:string]: any}   = {
			"authorId": { "type": "string", "required": "true" }
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

		this.authorId = properties.authorId;

    }
}


export class RequestSetProfile extends Request{

	public authorId: string;
	public nickname: string | undefined;
	public firstName: string | undefined;
	public lastName: string | undefined;
	public birthday: Date | undefined;
	public email: Array<Email> | undefined;
	public phone: Array<Phone> | undefined;
    static signature: string = '-1430997255';
    constructor(properties: { authorId:string, nickname?:string, firstName?:string, lastName?:string, birthday?:Date, email?:Array<Email>, phone?:Array<Phone>, request: Requests, guid: string }) {
        super(Object.assign(properties, { 
        	request: Requests.SET_PROFILE
        }));

        const name  : string = 'RequestSetProfile';
        const rules : {[key:string]: any}   = {
			"authorId": { "type": "string", "required": "true" },
			"nickname": { "type": "string", "optional": "true" },
			"firstName": { "type": "string", "optional": "true" },
			"lastName": { "type": "string", "optional": "true" },
			"birthday": { "type": "datetime", "optional": "true" },
			"email": { "type": ["Email"], "optional": "true" },
			"phone": { "type": ["Phone"], "optional": "true" }
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

		this.authorId = properties.authorId;
		this.nickname = properties.nickname;
		this.firstName = properties.firstName;
		this.lastName = properties.lastName;
		this.birthday = properties.birthday;
		this.email = properties.email;
		this.phone = properties.phone;

    }
}


export class Message {

	public event: Event | undefined;
	public request: Request | undefined;
    static signature: string = '-1675388953';
    constructor(properties: { event?:Event, request?:Request }) {
        

        const name  : string = 'Message';
        const rules : {[key:string]: any}   = {
			"event": { "findin": "protocol.events.json", "optional": "true", "type": "Event" },
			"request": { "findin": "protocol.requests.json", "optional": "true", "type": "Request" }
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

		this.event = properties.event;
		this.request = properties.request;

    }
}


const __SchemeClasses : {[key:string]: any} = {
	Event: Event,
	EventMessageCreated: EventMessageCreated,
	EventMessageChanged: EventMessageChanged,
	EventMessageRemoved: EventMessageRemoved,
	Email: Email,
	Phone: Phone,
	Request: Request,
	RequestGetMessage: RequestGetMessage,
	RequestGetProfile: RequestGetProfile,
	RequestSetProfile: RequestSetProfile,
	Message: Message
}       
        

const __SchemeEnums : {[key:string]: any} = {
	Events: Events,
	Reasons: Reasons,
	Requests: Requests,
	PhoneTypes: PhoneTypes
}     
        

export const Protocol : {[key:string]: any} = {
    //Classes
	Event: Event,
	EventMessageCreated: EventMessageCreated,
	EventMessageChanged: EventMessageChanged,
	EventMessageRemoved: EventMessageRemoved,
	Email: Email,
	Phone: Phone,
	Request: Request,
	RequestGetMessage: RequestGetMessage,
	RequestGetProfile: RequestGetProfile,
	RequestSetProfile: RequestSetProfile,
	Message: Message, 
    //Enums
	Events: Events,
	Reasons: Reasons,
	Requests: Requests,
	PhoneTypes: PhoneTypes
}     
        
        