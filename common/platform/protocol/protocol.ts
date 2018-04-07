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
                "PhoneTypes":["HOME", "GSM", "WORK"],
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

import * as Implementation from './protocol.generated';
const inst = new Protocol(Implementation);
const event = new Implementation.Event({});
console.log(inst);

