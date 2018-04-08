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

export class Email {

	public address: string;
	public primary: boolean;

    constructor(properties: any) {
        
        const name  : string = 'Email';
        const rules : {[key:string]: any}   = {
			"address": { "type": "string", "required": true },
			"primary": { "type": "boolean", "required": true }
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

    constructor(properties: any) {
        
        const name  : string = 'Phone';
        const rules : {[key:string]: any}   = {
			"address": { "type": "string", "required": true },
			"type": { "in": "PhoneTypes", "required": true }
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


export class Event {

	public event: Events;
	public guid: string;
	public timestamp: datetime;
	public email: Email;
	public phone: Phone;
	public isNew: boolean;
	public signature: string;

    constructor(properties: any) {
        
        const name  : string = 'Event';
        const rules : {[key:string]: any}   = {
			"event": { "in": "Events", "required": true },
			"guid": { "type": "string", "required": true },
			"timestamp": { "type": "datetime", "optional": true },
			"email": { "type": "Email", "optional": true },
			"phone": { "type": "Phone", "optional": true },
			"isNew": { "type": "boolean", "optional": true },
			"signature": { "type": "string", "optional": true }
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
		this.email = properties.email;
		this.phone = properties.phone;
		this.isNew = properties.isNew;
		this.signature = properties.signature;

    }
}


export class EventMessageCreated extends Event{

	public message: string;
	public time: datetime;
	public authorId: string;

    constructor(properties: any) {
        super(properties);
        const name  : string = 'EventMessageCreated';
        const rules : {[key:string]: any}   = {
			"message": { "type": "string", "required": true },
			"time": { "type": "datetime", "required": true },
			"authorId": { "type": "string", "required": true }
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
		super.event = Events.MESSAGE_CREATED;
		super.isNew = true;
		super.signature = "xxx-xxx-xxx";
    }
}


export class EventMessageChanged extends Event{

	public messageId: number;
	public message: string;
	public time: datetime;

    constructor(properties: any) {
        super(properties);
        const name  : string = 'EventMessageChanged';
        const rules : {[key:string]: any}   = {
			"messageId": { "type": "number", "required": true },
			"message": { "type": "string", "required": true },
			"time": { "type": "datetime", "required": true }
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
		super.event = Events.MESSAGE_CHANGED;
    }
}


export class EventMessageRemoved extends Event{

	public messageId: number;
	public reason: Reasons;

    constructor(properties: any) {
        super(properties);
        const name  : string = 'EventMessageRemoved';
        const rules : {[key:string]: any}   = {
			"messageId": { "type": "number", "required": true },
			"reason": { "in": "Reasons", "required": true }
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
		super.event = Events.MESSAGE_REMOVED;
    }
}


const __SchemeClasses : {[key:string]: any} = {
	Email: Email,
	Phone: Phone,
	Event: Event,
	EventMessageCreated: EventMessageCreated,
	EventMessageChanged: EventMessageChanged,
	EventMessageRemoved: EventMessageRemoved
}       
        

const __SchemeEnums : {[key:string]: any} = {
	Events: Events,
	Reasons: Reasons
}     
