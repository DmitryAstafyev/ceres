/*
* This file generated automaticaly (Tue Sep 11 2018 10:52:57 GMT+0200 (CEST))
* Do not remove or change this code.
* Protocol version: 0.0.1
*/

namespace Protocol {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: map of types
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export type TTypes = 
		Message.UnsubscribeAll.Request |
		Message.Pending.Request |
		Message.Unsubscribe.Response |
		Disconnect |
		Message |
		Message.Handshake |
		Message.Handshake.Response |
		Message.Handshake.Request |
		Message.Reconnection |
		Message.Reconnection.Response |
		Message.Reconnection.Request |
		Message.Hook |
		Message.Hook.Request |
		Message.Hook.Response |
		Message.Pending |
		Message.Pending.Response |
		Message.Event |
		Message.Event.Request |
		Message.Event.Response |
		Message.Subscribe |
		Message.Subscribe.Request |
		Message.Subscribe.Response |
		Message.Unsubscribe |
		Message.Unsubscribe.Request |
		Message.UnsubscribeAll |
		Message.UnsubscribeAll.Response |
		EventDefinition |
		Subscription |
		ConnectionError;

	export const AdvancedTypes: {[key: string]: any} = {};
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: injection.types.primitive.ts
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	export interface IPrimitiveType<T> {
	    tsType          : string,
	    init            : string,
	    parse           : (value: string | number | T) => T,
	    serialize       : (value: T) => string | number | boolean | T,
	    validate        : (value: string | number | T) => boolean,
	    implementation? : () => {}
	}
	
	export const PrimitiveTypes:  { [key: string]: IPrimitiveType<any> } = {
	
	    string      : {
	        tsType      : 'string',
	        init        : '""',
	        parse       : (value: string) => value,
	        serialize   : (value: string) => value,
	        validate    : (value: string) => {
	            if (typeof value !== 'string') {
	                return false;
	            }
	            return true;
	        }
	    } as IPrimitiveType<string>,
	
	    integer     : {
	        tsType      : 'number',
	        init        : '-1',
	        parse       : (value: number) => { return value; },
	        serialize   : (value: number) => { return value; },
	        validate    : (value: number) => { 
	            if (typeof value !== 'number'){
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)){
	                return false;
	            }
	            return true;
	        }
	    } as IPrimitiveType<number>,
	
	    float     : {
	        tsType      : 'number',
	        init        : '-1',
	        parse       : (value: number) => { return value; },
	        serialize   : (value: number) => { return value; },
	        validate    : (value: number) => { 
	            if (typeof value !== 'number'){
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            return true;
	        }
	    } as IPrimitiveType<number>,
	
	    boolean     : {
	        tsType      : 'boolean',
	        init        : 'false',
	        parse       : (value: boolean) => value,
	        serialize   : (value: boolean) => value,
	        validate    : (value: boolean) => { 
	            if (typeof value !== 'boolean'){
	                return false;
	            }
	            return true;
	        }
	    } as IPrimitiveType<boolean>,
	
	    datetime    : {
	        tsType      : 'Date',
	        init        : 'new Date()',
	        parse       : (value: number) => { 
	            return new Date(value);
	        },
	        serialize   : (value: Date) => { return value.getTime(); },
	        validate    : (value: number) => { 
	            if (typeof value !== 'number'){
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)){
	                return false;
	            }
	            const date = new Date(value);
	            if (!(date instanceof Date)){
	                return false;
	            }
	            if (~date.toString().toLowerCase().indexOf('invalid date')){
	                return false;
	            }
	            return !isNaN(date.getTime());
	        }
	    } as IPrimitiveType<Date>,
	
	    guid     : {
	        tsType          : 'string',
	        init            : 'guid()',
	        parse           : (value: string) => value,
	        serialize       : (value: string) => value,
	        validate        : (value: string) => { 
	            return typeof value === 'string' ? (value.trim() !== '' ? true : false) : false;
	        },
	        implementation  : function guid(){
	            const lengths = [4, 4, 4, 8];
	            let guid = '';
	            for (let i = lengths.length - 1; i >= 0; i -= 1){
	                guid += (Math.round(Math.random() * Math.random() * Math.pow(10, lengths[i] * 2))
	                            .toString(16)
	                            .substr(0, lengths[i])
	                            .toUpperCase() + '-');
	            }
	            guid += ((new Date()).getTime() * (Math.random() * 100))
	                        .toString(16)
	                        .substr(0, 12)
	                        .toUpperCase();
	            return guid;
	        }
	    } as IPrimitiveType<string>
	
	};
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: injection.root.ts
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	// declare var ReferencesMap: {[key: string]: any};
	// declare var PrimitiveTypes: {[key: string]: any};
	// declare var AdvancedTypes: {[key: string]: any};
	// declare type TTypes = any;
	
	export enum EEntityType {
	    root = 'root',
	    class = 'class',
	    namespace = 'namespace',
	    complex = 'complex',
	    primitive = 'primitive',
	    repeated = 'repeated',
	    reference = 'reference',
	    enum = 'enum'
	};
	
	export interface IProperty {
	    name: string,
	    type: EEntityType,
	    optional: boolean,
	    value: any
	}
	
	export function extract(json: {[key: string]: any}, target?: any): TTypes | Array<Error> {
	    const types: {[key: string]: any} = getTypes();
	    if (typeof json !== 'object' || json === null) {
	        return [new Error(`Extract function can be applied only to object.`)];
	    }
	    if (typeof json.__signature !== 'string' || json.__signature.trim() === '') {
	        return [new Error(`Cannot find signature of entity.`)];
	    }
	    if (ReferencesMap[json.__signature] === void 0) {
	        return [new Error(`Entity with signature "${json.__signature}" doesn't exist in this protocol implementation. Check protocol name or protocol version.`)];
	    }
	    const classRef: any = ReferencesMap[json.__signature];
	    if (target !== undefined) {
	        if (classRef.getSignature() !== target.getSignature()){
	            return [new Error(`Target reference doesn't match with entity in json.`)];
	        }
	    }
	    //Get description of entity
	    const description: {[key: string]: IProperty} = classRef.getDescription();
	    //Validate target
	    if (Object.keys(description).length !== Object.keys(json).length - 1) {
	        return [new Error(`Count of properties dismatch. Expected for "${classRef.name}" ${Object.keys(description).length} properties, but target object has: ${Object.keys(json).length - 1}.`)];
	    }
	    //Parsing properties
	    let errors: Array<Error> = [];
	    Object.keys(description).forEach((prop: string) => {
	        const desc = description[prop];
	        switch(desc.type) {
	            case EEntityType.repeated:
	                if (!(json[prop] instanceof Array)){
	                    errors.push(new Error(`Property "${prop}" has wrong format. Expected an array (repeated).`));
	                    break;
	                }
	                if (typeof desc.value === 'string') {
	                    json[prop] = json[prop].map((value: any) => {
	                        const type = types[desc.value];
	                        if (!type.validate(value)){
	                            errors.push(new Error(`Property "${prop}" has wrong format.`));
	                            return undefined;
	                        }
	                        return type.parse(value);
	                    });
	                } else if (typeof desc.value === 'function') {
	                    //It's reference to class
	                    const parsed = json[prop].map((value: any) => {
	                        const nested = extract(value, desc.value);
	                        if (nested instanceof Array) {
	                            errors.push(new Error(`Cannot get instance of class "${desc.value.name}" from property "${prop}" due error: \n${nested.map((e:Error)=>e.message).join(';\n')}`));
	                            return null;
	                        }
	                        return nested;
	                    });
	                    if (errors.length > 0) {
	                        break;
	                    }
	                    json[prop] = parsed;
	                } else if (typeof desc.value === 'object') {
	                    //It's reference to enum
	                    json[prop].forEach((value: any) => {
	                        if (desc.value[value] === void 0) {
	                            errors.push(new Error(`Property "${prop}" has wrong value: "${value}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                        }
	                    });
	                }
	                break;
	            case EEntityType.primitive:
	                const type = types[desc.value];
	                if (!type.validate(json[prop])){
	                    errors.push(new Error(`Property "${prop}" has wrong format.`));
	                }
	                json[prop] = type.parse(json[prop]);
	                break;
	            case EEntityType.reference:
	                if (typeof desc.value === 'function') {
	                    //It's reference to class
	                    const nested = extract(json[prop], desc.value);
	                    if (nested instanceof Array) {
	                        errors.push(new Error(`Cannot get instance of class "${desc.value.name}" from property "${prop}" due error: \n${nested.map((e:Error)=>e.message).join(';\n')}`));
	                    } else {
	                        json[prop] = nested;
	                    }
	                } else if (typeof desc.value === 'object') {
	                    //It's reference to enum
	                    if (desc.value[json[prop]] === void 0) {
	                        errors.push(new Error(`Property "${prop}" has wrong value: "${json[prop]}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                    }
	                }
	                break;
	        }
	    });
	    if (errors.length > 0) {
	        return errors;
	    }
	    //Create instance
	    try {
	        return new classRef(json);
	    } catch (error) {
	        return [error];
	    }
	};
	
	export function stringify(target:any, classRef: any): string | Array<Error> {
	    if (!(target instanceof classRef)) {
	        return [new Error(`Defined wrong reference to class.`)];
	    }
	    const types: {[key: string]: any} = getTypes();
	    const description: {[key: string]: IProperty} = classRef.getDescription();
	    const errors: Array<Error> = [];
	    let json: any = {
	        __signature: target.getSignature()
	    };
	    Object.keys(description).forEach((prop: string) => {
	        const desc = description[prop];
	        switch(desc.type) {
	            case EEntityType.repeated:
	                if (!(target[prop] instanceof Array)){
	                    errors.push(new Error(`Property "${prop}" has wrong format. Expected an array (repeated).`));
	                    break;
	                }
	                if (typeof desc.value === 'string') {
	                    json[prop] = target[prop].map((value: any) => {
	                        const type = types[desc.value];
	                        if (!type.validate(value)){
	                            errors.push(new Error(`Property "${prop}" has wrong format.`));
	                            return undefined;
	                        }
	                        return type.serialize(value);
	                    });
	                } else if (typeof desc.value === 'function') {
	                    //It's reference to class
	                    const parsed = target[prop].map((value: any) => {
	                        const nested = stringify(value, desc.value);
	                        if (nested instanceof Array) {
	                            errors.push(new Error(`Cannot get instance of class "${desc.value.name}" from property "${prop}" due error: \n${nested.map((e:Error)=>e.message).join(';\n')}`));
	                            return null;
	                        }
	                        return nested;
	                    });
	                    if (errors.length > 0) {
	                        break;
	                    }
	                    json[prop] = parsed;
	                } else if (typeof desc.value === 'object') {
	                    //It's reference to enum
	                    json[prop] = target[prop].map((value: any) => {
	                        if (desc.value[value] === void 0) {
	                            errors.push(new Error(`Property "${prop}" has wrong value: "${value}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                            return undefined;
	                        }
	                        return value;
	                    });
	                }
	                break;
	            case EEntityType.primitive:
	                const type = types[desc.value];
	                if (!type.validate(target[prop])){
	                    errors.push(new Error(`Property "${prop}" has wrong format.`));
	                    break;
	                }
	                json[prop] = type.serialize(target[prop]);
	                break;
	            case EEntityType.reference:
	                if (typeof desc.value === 'function') {
	                    //It's reference to class
	                    const nested = stringify(target[prop], desc.value);
	                    if (nested instanceof Array) {
	                        errors.push(new Error(`Cannot get instance of class "${desc.value.name}" from property "${prop}" due error: \n${nested.map((e:Error)=>e.message).join(';\n')}`));
	                        break;
	                    }
	                    json[prop] = nested;
	                } else if (typeof desc.value === 'object') {
	                    //It's reference to enum
	                    if (desc.value[target[prop]] === void 0) {
	                        errors.push(new Error(`Property "${prop}" has wrong value: "${target[prop]}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                        break;
	                    }
	                    json[prop] = target[prop];
	                }
	                break;
	        }
	    });
	    if (errors.length > 0) {
	        return errors;
	    }
	    return JSON.stringify(json);
	};
	
	export function getTypes(): {[key: string]: any} {
	    let defTypes = Object.assign({}, PrimitiveTypes);
	    let adTypes = Object.assign({}, AdvancedTypes);
	    return Object.assign(defTypes, adTypes); 
	}
	
	export function getJSONFromStr(str: string): Object | Error {
	    try {
	        return JSON.parse(str);
	    } catch (error) {
	        return error;
	    }
	}
	
	export function parse(str: string, target?: any): TTypes | Array<Error> {
	    const json: any = getJSONFromStr(str);
	    if (json instanceof Error) {
	        return [json];
	    }
	    return extract(json, target);
	}
	
	export class Root {
	
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: map of references
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export let ReferencesMap: {[key: string]: any} = {};
	export function init(){
		ReferencesMap["36550583"] = Message.UnsubscribeAll.Request;
		ReferencesMap["59648854"] = Message.Pending.Request;
		ReferencesMap["60658336"] = Message.Unsubscribe.Response;
		ReferencesMap["71280621"] = Disconnect;
		ReferencesMap["70D1C8A2"] = Message;
		ReferencesMap["5B342A75"] = Message.Handshake;
		ReferencesMap["1D8E5E9C"] = Message.Handshake.Response;
		ReferencesMap["6A4CB50C"] = Message.Handshake.Request;
		ReferencesMap["411DF73D"] = Message.Reconnection;
		ReferencesMap["550547F2"] = Message.Reconnection.Response;
		ReferencesMap["7E8304BE"] = Message.Reconnection.Request;
		ReferencesMap["35D910F1"] = Message.Hook;
		ReferencesMap["26C80A90"] = Message.Hook.Request;
		ReferencesMap["4A9F03A0"] = Message.Hook.Response;
		ReferencesMap["3ED7382B"] = Message.Pending;
		ReferencesMap["2FFB32C4"] = Message.Pending.Response;
		ReferencesMap["7A8FB62E"] = Message.Event;
		ReferencesMap["15C342AF"] = Message.Event.Request;
		ReferencesMap["5A3337DF"] = Message.Event.Response;
		ReferencesMap["40BAC922"] = Message.Subscribe;
		ReferencesMap["3FAECA1"] = Message.Subscribe.Request;
		ReferencesMap["783AF28F"] = Message.Subscribe.Response;
		ReferencesMap["C96909B"] = Message.Unsubscribe;
		ReferencesMap["B782B1A"] = Message.Unsubscribe.Request;
		ReferencesMap["1A9B1BFC"] = Message.UnsubscribeAll;
		ReferencesMap["6EDC0A13"] = Message.UnsubscribeAll.Response;
		ReferencesMap["282376D8"] = EventDefinition;
		ReferencesMap["2DEBB962"] = Subscription;
		ReferencesMap["583DFB65"] = ConnectionError;
	}

}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Primitive type injections
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function guid() {
            const lengths = [4, 4, 4, 8];
            let guid = '';
            for (let i = lengths.length - 1; i >= 0; i -= 1) {
                guid += (Math.round(Math.random() * Math.random() * Math.pow(10, lengths[i] * 2))
                    .toString(16)
                    .substr(0, lengths[i])
                    .toUpperCase() + '-');
            }
            guid += ((new Date()).getTime() * (Math.random() * 100))
                .toString(16)
                .substr(0, 12)
                .toUpperCase();
            return guid;
        }

export class Message extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
		}
	}
	static __signature: string = "70D1C8A2";
	static getSignature(): string {
		return Message.__signature;
	}
	public __signature: string = Message.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string): Protocol.TTypes | Array<Error> {
		return Protocol.parse(str, Message);
	}
	public stringify(): string | Array<Error> {
		return Protocol.stringify(this, Message);
	}
	public clientId: string = "";
	public guid?: string = guid();

	constructor(args: { clientId: string, guid?: string }) {
		super();
		this.clientId = args.clientId;
		args.guid !== void 0 && (this.guid = args.guid);
	}
}
export namespace Message {
	export class Handshake extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "5B342A75";
		static getSignature(): string {
			return Handshake.__signature;
		}
		public __signature: string = Handshake.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string): Protocol.TTypes | Array<Error> {
			return Protocol.parse(str, Handshake);
		}
		public stringify(): string | Array<Error> {
			return Protocol.stringify(this, Handshake);
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
		}
	}
	export namespace Handshake {
		export class Response extends Handshake {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					allowed: { name: "allowed", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
					reason: { name: "reason", value: Message.Handshake.Response.Reasons, type: Protocol.EEntityType.reference, optional: true }, 
					error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "1D8E5E9C";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Response);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Response);
			}
			public allowed: boolean = false;
			public reason?: Message.Handshake.Response.Reasons;
			public error?: string = "";

			constructor(args: { clientId: string, guid?: string, allowed: boolean, reason?: Message.Handshake.Response.Reasons, error?: string }) {
				super(Object.assign(args, {}));
				this.allowed = args.allowed;
				args.reason !== void 0 && (this.reason = args.reason);
				args.error !== void 0 && (this.error = args.error);
			}
		}
		export namespace Response {
			export enum Reasons {
				FAIL_AUTH = 'FAIL_AUTH',
				NO_TOKEN_FOUND = 'NO_TOKEN_FOUND',
				NO_CLIENT_ID_FOUND = 'NO_CLIENT_ID_FOUND'
			}
		}
		export class Request extends Handshake {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "6A4CB50C";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Request);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Request);
			}

			constructor(args: { clientId: string, guid?: string }) {
				super(Object.assign(args, {}));
			}
		}
		type TResponses = Response;
	}
	export class Reconnection extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "411DF73D";
		static getSignature(): string {
			return Reconnection.__signature;
		}
		public __signature: string = Reconnection.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string): Protocol.TTypes | Array<Error> {
			return Protocol.parse(str, Reconnection);
		}
		public stringify(): string | Array<Error> {
			return Protocol.stringify(this, Reconnection);
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
		}
	}
	export namespace Reconnection {
		export class Response extends Reconnection {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					allowed: { name: "allowed", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
				}
			}
			static __signature: string = "550547F2";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Response);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Response);
			}
			public allowed: boolean = false;

			constructor(args: { clientId: string, guid?: string, allowed: boolean }) {
				super(Object.assign(args, {}));
				this.allowed = args.allowed;
			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		export class Request extends Reconnection {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "7E8304BE";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Request);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Request);
			}

			constructor(args: { clientId: string, guid?: string }) {
				super(Object.assign(args, {}));
			}
		}
		type TResponses = Response | ConnectionError;
	}
	export class Hook extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "35D910F1";
		static getSignature(): string {
			return Hook.__signature;
		}
		public __signature: string = Hook.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string): Protocol.TTypes | Array<Error> {
			return Protocol.parse(str, Hook);
		}
		public stringify(): string | Array<Error> {
			return Protocol.stringify(this, Hook);
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
		}
	}
	export namespace Hook {
		export enum Responses {
			ConnectionError = 'ConnectionError',
			Disconnect = 'Disconnect'
		}
		export class Request extends Hook {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "26C80A90";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Request);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Request);
			}

			constructor(args: { clientId: string, guid?: string }) {
				super(Object.assign(args, {}));
			}
		}
		export class Response extends Hook {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "4A9F03A0";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Response);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Response);
			}

			constructor(args: { clientId: string, guid?: string }) {
				super(Object.assign(args, {}));
			}
		}
		type TResponses = Response | ConnectionError | Disconnect;
	}
	export class Pending extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "3ED7382B";
		static getSignature(): string {
			return Pending.__signature;
		}
		public __signature: string = Pending.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string): Protocol.TTypes | Array<Error> {
			return Protocol.parse(str, Pending);
		}
		public stringify(): string | Array<Error> {
			return Protocol.stringify(this, Pending);
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
		}
	}
	export namespace Pending {
		export class Response extends Pending {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					event: { name: "event", value: EventDefinition, type: Protocol.EEntityType.reference, optional: false }, 
				}
			}
			static __signature: string = "2FFB32C4";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Response);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Response);
			}
			public event: EventDefinition;

			constructor(args: { clientId: string, guid?: string, event: EventDefinition }) {
				super(Object.assign(args, {}));
				this.event = args.event;
			}
		}
		export enum Responses {
			Disconnect = 'Disconnect'
		}
		export class Request extends Pending {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "59648854";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Request);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Request);
			}

			constructor(args: { clientId: string, guid?: string }) {
				super(Object.assign(args, {}));
			}
		}
		type TResponses = Response | Disconnect;
	}
	export class Event extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "7A8FB62E";
		static getSignature(): string {
			return Event.__signature;
		}
		public __signature: string = Event.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string): Protocol.TTypes | Array<Error> {
			return Protocol.parse(str, Event);
		}
		public stringify(): string | Array<Error> {
			return Protocol.stringify(this, Event);
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
		}
	}
	export namespace Event {
		export class Request extends Event {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					event: { name: "event", value: EventDefinition, type: Protocol.EEntityType.reference, optional: false }, 
				}
			}
			static __signature: string = "15C342AF";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Request);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Request);
			}
			public event: EventDefinition;

			constructor(args: { clientId: string, guid?: string, event: EventDefinition }) {
				super(Object.assign(args, {}));
				this.event = args.event;
			}
		}
		export class Response extends Event {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					eventGUID: { name: "eventGUID", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
					subscribers: { name: "subscribers", value: "integer", type: Protocol.EEntityType.primitive, optional: false }, 
				}
			}
			static __signature: string = "5A3337DF";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Response);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Response);
			}
			public eventGUID?: string = "";
			public subscribers: number = -1;

			constructor(args: { clientId: string, guid?: string, eventGUID?: string, subscribers: number }) {
				super(Object.assign(args, {}));
				args.eventGUID !== void 0 && (this.eventGUID = args.eventGUID);
				this.subscribers = args.subscribers;
			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		type TResponses = Response | ConnectionError;
	}
	export class Subscribe extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "40BAC922";
		static getSignature(): string {
			return Subscribe.__signature;
		}
		public __signature: string = Subscribe.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string): Protocol.TTypes | Array<Error> {
			return Protocol.parse(str, Subscribe);
		}
		public stringify(): string | Array<Error> {
			return Protocol.stringify(this, Subscribe);
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
		}
	}
	export namespace Subscribe {
		export class Request extends Subscribe {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					subscription: { name: "subscription", value: Subscription, type: Protocol.EEntityType.reference, optional: false }, 
				}
			}
			static __signature: string = "3FAECA1";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Request);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Request);
			}
			public subscription: Subscription;

			constructor(args: { clientId: string, guid?: string, subscription: Subscription }) {
				super(Object.assign(args, {}));
				this.subscription = args.subscription;
			}
		}
		export class Response extends Subscribe {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
				}
			}
			static __signature: string = "783AF28F";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Response);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Response);
			}
			public status: boolean = false;

			constructor(args: { clientId: string, guid?: string, status: boolean }) {
				super(Object.assign(args, {}));
				this.status = args.status;
			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		type TResponses = Response | ConnectionError;
	}
	export class Unsubscribe extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "C96909B";
		static getSignature(): string {
			return Unsubscribe.__signature;
		}
		public __signature: string = Unsubscribe.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string): Protocol.TTypes | Array<Error> {
			return Protocol.parse(str, Unsubscribe);
		}
		public stringify(): string | Array<Error> {
			return Protocol.stringify(this, Unsubscribe);
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
		}
	}
	export namespace Unsubscribe {
		export class Request extends Unsubscribe {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					subscription: { name: "subscription", value: Subscription, type: Protocol.EEntityType.reference, optional: false }, 
				}
			}
			static __signature: string = "B782B1A";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Request);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Request);
			}
			public subscription: Subscription;

			constructor(args: { clientId: string, guid?: string, subscription: Subscription }) {
				super(Object.assign(args, {}));
				this.subscription = args.subscription;
			}
		}
		export class Response extends Unsubscribe {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
				}
			}
			static __signature: string = "60658336";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Response);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Response);
			}
			public status: boolean = false;

			constructor(args: { clientId: string, guid?: string, status: boolean }) {
				super(Object.assign(args, {}));
				this.status = args.status;
			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		type TResponses = Response | ConnectionError;
	}
	export class UnsubscribeAll extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "1A9B1BFC";
		static getSignature(): string {
			return UnsubscribeAll.__signature;
		}
		public __signature: string = UnsubscribeAll.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string): Protocol.TTypes | Array<Error> {
			return Protocol.parse(str, UnsubscribeAll);
		}
		public stringify(): string | Array<Error> {
			return Protocol.stringify(this, UnsubscribeAll);
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
		}
	}
	export namespace UnsubscribeAll {
		export class Request extends UnsubscribeAll {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					subscription: { name: "subscription", value: Subscription, type: Protocol.EEntityType.reference, optional: false }, 
				}
			}
			static __signature: string = "36550583";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Request);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Request);
			}
			public subscription: Subscription;

			constructor(args: { clientId: string, guid?: string, subscription: Subscription }) {
				super(Object.assign(args, {}));
				this.subscription = args.subscription;
			}
		}
		export class Response extends UnsubscribeAll {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
				}
			}
			static __signature: string = "6EDC0A13";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string): Protocol.TTypes | Array<Error> {
				return Protocol.parse(str, Response);
			}
			public stringify(): string | Array<Error> {
				return Protocol.stringify(this, Response);
			}
			public status: boolean = false;

			constructor(args: { clientId: string, guid?: string, status: boolean }) {
				super(Object.assign(args, {}));
				this.status = args.status;
			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		type TResponses = Response | ConnectionError;
	}
}
export class EventDefinition extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			protocol: { name: "protocol", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			event: { name: "event", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			body: { name: "body", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			eventGUID: { name: "eventGUID", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
		}
	}
	static __signature: string = "282376D8";
	static getSignature(): string {
		return EventDefinition.__signature;
	}
	public __signature: string = EventDefinition.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string): Protocol.TTypes | Array<Error> {
		return Protocol.parse(str, EventDefinition);
	}
	public stringify(): string | Array<Error> {
		return Protocol.stringify(this, EventDefinition);
	}
	public protocol: string = "";
	public event: string = "";
	public body: string = "";
	public eventGUID?: string = guid();

	constructor(args: { protocol: string, event: string, body: string, eventGUID?: string }) {
		super();
		this.protocol = args.protocol;
		this.event = args.event;
		this.body = args.body;
		args.eventGUID !== void 0 && (this.eventGUID = args.eventGUID);
	}
}
export class Subscription extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			protocol: { name: "protocol", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			event: { name: "event", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
		}
	}
	static __signature: string = "2DEBB962";
	static getSignature(): string {
		return Subscription.__signature;
	}
	public __signature: string = Subscription.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string): Protocol.TTypes | Array<Error> {
		return Protocol.parse(str, Subscription);
	}
	public stringify(): string | Array<Error> {
		return Protocol.stringify(this, Subscription);
	}
	public protocol: string = "";
	public event?: string = "";

	constructor(args: { protocol: string, event?: string }) {
		super();
		this.protocol = args.protocol;
		args.event !== void 0 && (this.event = args.event);
	}
}
export class ConnectionError extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			reason: { name: "reason", value: ConnectionError.Reasons, type: Protocol.EEntityType.repeated, optional: false }, 
			message: { name: "message", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
		}
	}
	static __signature: string = "583DFB65";
	static getSignature(): string {
		return ConnectionError.__signature;
	}
	public __signature: string = ConnectionError.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string): Protocol.TTypes | Array<Error> {
		return Protocol.parse(str, ConnectionError);
	}
	public stringify(): string | Array<Error> {
		return Protocol.stringify(this, ConnectionError);
	}
	public reason: Array<ConnectionError.Reasons> = [];
	public message: string = "";

	constructor(args: { reason: Array<ConnectionError.Reasons>, message: string }) {
		super();
		this.reason = args.reason;
		this.message = args.message;
	}
}
export namespace ConnectionError {
	export enum Reasons {
		FAIL_AUTH = 'FAIL_AUTH',
		NO_TOKEN_FOUND = 'NO_TOKEN_FOUND',
		NO_CLIENT_ID_FOUND = 'NO_CLIENT_ID_FOUND',
		NO_TOKEN_PROVIDED = 'NO_TOKEN_PROVIDED',
		TOKEN_IS_WRONG = 'TOKEN_IS_WRONG'
	}
}
export class Disconnect extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			reason: { name: "reason", value: Disconnect.Reasons, type: Protocol.EEntityType.reference, optional: false }, 
			message: { name: "message", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
		}
	}
	static __signature: string = "71280621";
	static getSignature(): string {
		return Disconnect.__signature;
	}
	public __signature: string = Disconnect.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string): Protocol.TTypes | Array<Error> {
		return Protocol.parse(str, Disconnect);
	}
	public stringify(): string | Array<Error> {
		return Protocol.stringify(this, Disconnect);
	}
	public reason: Disconnect.Reasons;
	public message: string = "";

	constructor(args: { reason: Disconnect.Reasons, message: string }) {
		super();
		this.reason = args.reason;
		this.message = args.message;
	}
}
export namespace Disconnect {
	export enum Reasons {
		SHUTDOWN = 'SHUTDOWN'
	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Injection: initialization
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
Protocol.init();