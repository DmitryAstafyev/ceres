/* tslint:disable */
/*
* This file generated automaticaly (Fri Oct 12 2018 01:07:50 GMT+0200 (CEST))
* Do not remove or change this code.
* Protocol version: 0.0.1
*/

namespace Protocol {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: map of types
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export type TTypes = 
		Events |
		Events.Ping;

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
	        validate    : (value: number | Date) => {
	            if (value instanceof Date) {
	                return true;
	            } 
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
	
	export function _parse(json: any, target?: any): TTypes | Array<Error> {
	    const types: {[key: string]: any} = getTypes();
	    if (typeof json !== 'object' || json === null) {
	        if (typeof json === 'string') {
	            json = getJSONFromStr(json);
	            if (json instanceof Error) {
	                return [new Error(`Extract function can be applied only to object. Error: ${json.message}.`)];
	            }
	        } else {
	            return [new Error(`Extract function can be applied only to object.`)];
	        }
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
	    //Parsing properties
	    let errors: Array<Error> = [];
	    Object.keys(description).forEach((prop: string) => {
	        const desc = description[prop];
	        if (desc.optional && json[prop] === void 0) {
	            return;
	        }
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
	                        const nested = _parse(value, desc.value);
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
	                    const nested = _parse(json[prop], desc.value);
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
	
	export function _stringify(target:any, classRef: any): string | Array<Error> {
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
	        if (desc.optional && target[prop] === void 0) {
	            return;
	        }
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
	                        const nested = _stringify(value, desc.value);
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
	                    const nested = _stringify(target[prop], desc.value);
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
	
	export function stringify(target:any, classRef: any): string | Error {
	    const result = _stringify(target, classRef);
	    if (result instanceof Array) {
	        return new Error(`Cannot stringify due errors:\n ${result.map((error: Error) => { return error.message; }).join('\n')}`)
	    }
	    return result;
	}
	
	export function parse(str: string | object, target?: any): TTypes | Error {
	    let json: any;
	    if (typeof str === 'string') {
	        json = getJSONFromStr(str);
	        if (json instanceof Error) {
	            return json;
	        }
	    } else if (typeof str !== 'object' || str === null) {
	        return new Error(`Expecting string or object.`);
	    } else {
	        json = str;
	    }
	    const result = _parse(json, target);
	    if (result instanceof Array) {
	        return new Error(`Cannot parse due errors:\n ${result.map((error: Error) => { return error.message; }).join('\n')}`)
	    }
	    return result;
	}
	
	export function typeOf(smth: any): string {
	    switch(typeof smth) {
	        case 'object':
	            if (smth === null) {
	                return 'null';
	            }
	            if (smth.constructor !== void 0) {
	                return smth.constructor.name;
	            }
	            return 'object';
	        default:
	            return typeof smth;
	    }
	
	}
	
	export function validateParams(params: any, classRef: any): Array<Error> {
	    const errors: Array<Error> = [];
	    const description: {[key: string]: any} = classRef.getDescription();
	    const types: {[key: string]: any} = getTypes();
	    const classRefName: string = classRef.name;
	    if (Object.keys(description).length === 0 && params === undefined) {
	        return errors;
	    }
	    if (typeof params !== 'object' || params === null) {
	        errors.push(new Error(`Expecting "params" will be an object on "${classRefName}".`));
	        return errors;
	    }
	    Object.keys(description).forEach((prop: string) => {
	        const desc: any = description[prop];
	        if (!desc.optional && params[prop] === void 0) {
	            errors.push(new Error(`Property "${prop}" isn't defined, but it's obligatory property for "${classRefName}".`));
	            return;
	        }
	        if (desc.optional && params[prop] === void 0) {
	            return;
	        }
	        switch(desc.type) {
	            case EEntityType.repeated:
	                if (!(params[prop] instanceof Array)){
	                    errors.push(new Error(`Property "${prop}" has wrong format. Expected an array (repeated). Reference: "${classRefName}"`));
	                    break;
	                }
	                if (typeof desc.value === 'string') {
	                    params[prop] = params[prop].map((value: any) => {
	                        const type = types[desc.value];
	                        if (typeOf(value) !== type.tsType){
	                            errors.push(new Error(`Property "${prop}" has wrong format. Expected an array (repeated) of "${type.tsType}"`));
	                        }
	                    });
	                } else if (typeof desc.value === 'function') {
	                    //It's reference to class
	                    params[prop].forEach((instance: any, index: number) => {
	                        if (!(instance instanceof desc.value)) {
	                            errors.push(new Error(`Expecting property "${prop}", index "${index}" should be instance of "${desc.value.name}".`));
	                        }
	                    });
	                } else if (typeof desc.value === 'object') {
	                    //It's reference to enum
	                    params[prop].forEach((value: any) => {
	                        if (desc.value[value] === void 0) {
	                            errors.push(new Error(`Property "${prop}" has wrong value: "${value}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                        }
	                    });
	                }
	                break;
	            case EEntityType.primitive:
	                const type = types[desc.value];
	                if (typeOf(params[prop]) !== type.tsType){
	                    errors.push(new Error(`Property "${prop}" has wrong format. Expected: "${type.tsType}".`));
	                }
	                break;
	            case EEntityType.reference:
	                if (typeof desc.value === 'function') {
	                    //It's reference to class
	                    if (!(params[prop] instanceof desc.value)) {
	                        errors.push(new Error(`Expecting property "${prop}" will be instance of "${desc.value.name}".`));
	                    }
	                } else if (typeof desc.value === 'object') {
	                    //It's reference to enum
	                    if (desc.value[params[prop]] === void 0) {
	                        errors.push(new Error(`Property "${prop}" has wrong value: "${params[prop]}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                    }
	                }
	                break;
	        }
	    });
	    return errors;
	};
	
	export class Root {
	    
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: map of references
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export let ReferencesMap: {[key: string]: any} = {};
	export function init(){
		ReferencesMap["D7E6E2"] = Events;
		ReferencesMap["18DF1862"] = Events.Ping;
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: protocol signature
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export function getSignature() {
		return "2F01D4D2";
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

export class Events extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
		}
	}
	static __signature: string = "D7E6E2";
	static getSignature(): string {
		return Events.__signature;
	}
	public __signature: string = Events.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, Events);
	}
	public stringify(): string {
		return Protocol.stringify(this, Events) as string;
	}
	public guid?: string = guid();

	constructor(args: { guid?: string }) {
		super();
		args.guid !== void 0 && (this.guid = args.guid);
		const errors: Array<Error> = Protocol.validateParams(args, Events);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "Events" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export namespace Events {
	export class Ping extends Events {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				timestamp: { name: "timestamp", value: "datetime", type: Protocol.EEntityType.primitive, optional: false }, 
				message: { name: "message", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "18DF1862";
		static getSignature(): string {
			return Ping.__signature;
		}
		public __signature: string = Ping.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Ping);
		}
		public stringify(): string {
			return Protocol.stringify(this, Ping) as string;
		}
		public timestamp: Date = new Date();
		public message?: string = "";

		constructor(args: { guid?: string, timestamp: Date, message?: string }) {
			super(Object.assign(args, {}));
			this.timestamp = args.timestamp;
			args.message !== void 0 && (this.message = args.message);
			const errors: Array<Error> = Protocol.validateParams(args, Ping);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Ping" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Injection: export from Protocol namespace
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export type TProtocolTypes = Protocol.TTypes;
export const parse = Protocol.parse;
export const stringify = Protocol.stringify;
export const getSignature = Protocol.getSignature;
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Injection: initialization
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
Protocol.init();
