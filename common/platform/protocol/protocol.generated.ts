
let ProtocolClassValidator: any = null;

export function register(ProtocolClassValidatorRef: any) {
    ProtocolClassValidator = ProtocolClassValidatorRef;
};

export enum Events {
    "MESSAGE_CREATED" = 1,
    "MESSAGE_CHANGED" = 2, 
    "MESSAGE_REMOVED" = 3
}

export class Event {

    public event: Events;
    public guid : string;

    constructor(properties: any) {
        const name  : string = 'Event';
        const rules : {[key:string]: any}   = {
            "event"     : { "in"    : "Events",     "required": true },
            "guid"      : { "type"  : "string",     "required": true },
            "timestamp" : { "type"  : "datetime",   "optional": true }
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

        this.event  = properties.event;
        this.guid   = properties.guid;
    }
}

export class EventMessageCreated extends Event {

    public message  : string;
    public time     : Date;
    public authorId : string;

    constructor(properties: any){
        super(properties);

        const name  : string = 'EventMessageCreated';
        const rules : {[key:string]: any}   = {
            "event"     : { "in"    : "Events",     "required": true },
            "guid"      : { "type"  : "string",     "required": true },
            "timestamp" : { "type"  : "datetime",   "optional": true }
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

        this.message    = properties.message;
        this.time       = properties.time;
        this.authorId   = properties.authorId;
    }

}

const __SchemeEnums : {[key:string]: any} = {
    Events: Events
}

const __SchemeClasses : {[key:string]: any} = {
    Event               : Event,
    EventMessageCreated : EventMessageCreated,
}