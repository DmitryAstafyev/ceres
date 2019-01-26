/* tslint:disable */
/*
* This file generated automaticaly (Sat Jan 26 2019 20:02:44 GMT+0100 (CET))
* Do not remove or change this code.
* Protocol version: 0.0.1
*/

export namespace Protocol {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: map of types
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export type TTypes = 
		Message.UnsubscribeAll.Request |
		Message.Unsubscribe.Response |
		Message.Registration.Response |
		Disconnect |
		Message.Event.Options |
		Message |
		Message.Reconnection |
		Message.Reconnection.Request |
		Message.Reconnection.Response |
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
		Message.Registration |
		Message.Registration.Request |
		Message.Demand |
		Message.Demand.FromExpectant |
		Message.Demand.FromExpectant.Request |
		Message.Demand.FromExpectant.Response |
		Message.Demand.FromRespondent |
		Message.Demand.FromRespondent.Request |
		Message.Demand.FromRespondent.Response |
		Message.Demand.Options |
		Message.Respondent |
		Message.Respondent.Bind |
		Message.Respondent.Bind.Request |
		Message.Respondent.Bind.Response |
		Message.Respondent.Unbind |
		Message.Respondent.Unbind.Request |
		Message.Respondent.Unbind.Response |
		Message.ToConsumer |
		EventDefinition |
		DemandDefinition |
		Subscription |
		ConnectionError |
		KeyValue;

	export const AdvancedTypes: {[key: string]: any} = {};
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: injection.types.primitive.ts
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	export interface IPrimitiveType<T> {
	    tsType: string;
	    init: string;
	    parse: (value: string | number | T) => T;
	    serialize: (value: T) => string | number | boolean | T;
	    validate: (value: string | number | T) => boolean;
	    implementation?: () => {};
	}
	
	export const PrimitiveTypes:  { [key: string]: IPrimitiveType<any> } = {
	
	    string      : {
	        init        : '""',
	        parse       : (value: string) => value,
	        serialize   : (value: string) => value,
	        tsType      : 'string',
	        validate    : (value: string) => {
	            if (typeof value !== 'string') {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<string>,
	
	    integer     : {
	        init        : '-1',
	        parse       : (value: number) => value,
	        serialize   : (value: number) => value,
	        tsType      : 'number',
	        validate    : (value: number) => {
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    float     : {
	        init        : '-1',
	        parse       : (value: number) => value,
	        serialize   : (value: number) => value,
	        tsType      : 'number',
	        validate    : (value: number) => {
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    boolean     : {
	        init        : 'false',
	        parse       : (value: boolean) => value,
	        serialize   : (value: boolean) => value,
	        tsType      : 'boolean',
	        validate    : (value: boolean) => {
	            if (typeof value !== 'boolean') {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<boolean>,
	
	    datetime    : {
	        init        : 'new Date()',
	        parse       : (value: number) => {
	            return new Date(value);
	        },
	        serialize   : (value: Date) => value.getTime(),
	        tsType      : 'Date',
	        validate    : (value: number | Date) => {
	            if (value instanceof Date) {
	                return true;
	            }
	            if (typeof value !== 'number') {
	                return false;
	            }
	            if (isNaN(value)) {
	                return false;
	            }
	            if (!Number.isInteger(value)) {
	                return false;
	            }
	            const date = new Date(value);
	            if (!(date instanceof Date)) {
	                return false;
	            }
	            if (date.toString().toLowerCase().indexOf('invalid date') !== -1) {
	                return false;
	            }
	            return !isNaN(date.getTime());
	        },
	    } as IPrimitiveType<Date>,
	
	    guid     : {
	        implementation  : function guid() {
	            const lengths = [4, 4, 4, 8];
	            let resultGuid = '';
	            for (let i = lengths.length - 1; i >= 0; i -= 1) {
	                resultGuid += (Math.round(Math.random() * Math.random() * Math.pow(10, lengths[i] * 2))
	                            .toString(16)
	                            .substr(0, lengths[i])
	                            .toUpperCase() + '-');
	            }
	            resultGuid += ((new Date()).getTime() * (Math.random() * 100))
	                        .toString(16)
	                        .substr(0, 12)
	                        .toUpperCase();
	            return resultGuid;
	        },
	        init            : 'guid()',
	        parse           : (value: string) => value,
	        serialize       : (value: string) => value,
	        tsType          : 'string',
	        validate        : (value: string) => {
	            return typeof value === 'string' ? (value.trim() !== '' ? true : false) : false;
	        },
	
	    } as IPrimitiveType<string>,
	
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
	    enum = 'enum',
	}
	
	export interface IProperty {
	    name: string;
	    type: EEntityType;
	    optional: boolean;
	    value: any;
	}
	
	export function _parse(json: any, target?: any): TTypes | Error[] {
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
	        if (classRef.getSignature() !== target.getSignature()) {
	            return [new Error(`Target reference doesn't match with entity in json.`)];
	        }
	    }
	    // Get description of entity
	    const description: {[key: string]: IProperty} = classRef.getDescription();
	    // Parsing properties
	    const errors: Error[] = [];
	    Object.keys(description).forEach((prop: string) => {
	        const desc = description[prop];
	        if (desc.optional && json[prop] === void 0) {
	            return;
	        }
	        switch (desc.type) {
	            case EEntityType.repeated:
	                if (!(json[prop] instanceof Array)) {
	                    errors.push(new Error(`Property "${prop}" has wrong format. Expected an array (repeated).`));
	                    break;
	                }
	                if (typeof desc.value === 'string') {
	                    json[prop] = json[prop].map((value: any) => {
	                        const nestedType = types[desc.value];
	                        if (!nestedType.validate(value)) {
	                            errors.push(new Error(`Property "${prop}" has wrong format.`));
	                            return undefined;
	                        }
	                        return nestedType.parse(value);
	                    });
	                } else if (typeof desc.value === 'function') {
	                    // It's reference to class
	                    const parsed = json[prop].map((value: any) => {
	                        const nested = _parse(value, desc.value);
	                        if (nested instanceof Array) {
	                            errors.push(new Error(`Cannot get instance of class "${desc.value.name}" from property "${prop}" due error: \n${nested.map((e: Error) => e.message).join(';\n')}`));
	                            return null;
	                        }
	                        return nested;
	                    });
	                    if (errors.length > 0) {
	                        break;
	                    }
	                    json[prop] = parsed;
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
	                    json[prop].forEach((value: any) => {
	                        if (desc.value[value] === void 0) {
	                            errors.push(new Error(`Property "${prop}" has wrong value: "${value}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                        }
	                    });
	                }
	                break;
	            case EEntityType.primitive:
	                const type = types[desc.value];
	                if (!type.validate(json[prop])) {
	                    errors.push(new Error(`Property "${prop}" has wrong format.`));
	                }
	                json[prop] = type.parse(json[prop]);
	                break;
	            case EEntityType.reference:
	                if (typeof desc.value === 'function') {
	                    // It's reference to class
	                    const nested = _parse(json[prop], desc.value);
	                    if (nested instanceof Array) {
	                        errors.push(new Error(`Cannot get instance of class "${desc.value.name}" from property "${prop}" due error: \n${nested.map((e: Error) => e.message).join(';\n')}`));
	                    } else {
	                        json[prop] = nested;
	                    }
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
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
	    // Create instance
	    try {
	        return new classRef(json);
	    } catch (error) {
	        return [error];
	    }
	}
	
	export function _stringify(target: any, classRef: any): string | Error[] {
	    if (!(target instanceof classRef)) {
	        return [new Error(`Defined wrong reference to class.`)];
	    }
	    const types: {[key: string]: any} = getTypes();
	    const description: {[key: string]: IProperty} = classRef.getDescription();
	    const errors: Error[] = [];
	    const json: any = {
	        __signature: target.getSignature(),
	    };
	    Object.keys(description).forEach((prop: string) => {
	        const desc = description[prop];
	        if (desc.optional && target[prop] === void 0) {
	            return;
	        }
	        switch (desc.type) {
	            case EEntityType.repeated:
	                if (!(target[prop] instanceof Array)) {
	                    errors.push(new Error(`Property "${prop}" has wrong format. Expected an array (repeated).`));
	                    break;
	                }
	                if (typeof desc.value === 'string') {
	                    json[prop] = target[prop].map((value: any) => {
	                        const nestedType = types[desc.value];
	                        if (!nestedType.validate(value)) {
	                            errors.push(new Error(`Property "${prop}" has wrong format.`));
	                            return undefined;
	                        }
	                        return nestedType.serialize(value);
	                    });
	                } else if (typeof desc.value === 'function') {
	                    // It's reference to class
	                    const parsed = target[prop].map((value: any) => {
	                        const nested = _stringify(value, desc.value);
	                        if (nested instanceof Array) {
	                            errors.push(new Error(`Cannot get instance of class "${desc.value.name}" from property "${prop}" due error: \n${nested.map((e: Error) => e.message).join(';\n')}`));
	                            return null;
	                        }
	                        return nested;
	                    });
	                    if (errors.length > 0) {
	                        break;
	                    }
	                    json[prop] = parsed;
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
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
	                if (!type.validate(target[prop])) {
	                    errors.push(new Error(`Property "${prop}" has wrong format.`));
	                    break;
	                }
	                json[prop] = type.serialize(target[prop]);
	                break;
	            case EEntityType.reference:
	                if (typeof desc.value === 'function') {
	                    // It's reference to class
	                    const nested = _stringify(target[prop], desc.value);
	                    if (nested instanceof Array) {
	                        errors.push(new Error(`Cannot get instance of class "${desc.value.name}" from property "${prop}" due error: \n${nested.map((e: Error) => e.message).join(';\n')}`));
	                        break;
	                    }
	                    json[prop] = nested;
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
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
	}
	
	export function getTypes(): {[key: string]: any} {
	    const defTypes = Object.assign({}, PrimitiveTypes);
	    const adTypes = Object.assign({}, AdvancedTypes);
	    return Object.assign(defTypes, adTypes);
	}
	
	export function getJSONFromStr(str: string): {} | Error {
	    try {
	        return JSON.parse(str);
	    } catch (error) {
	        return error;
	    }
	}
	
	export function stringify(target: any, classRef: any): string | Error {
	    const result = _stringify(target, classRef);
	    if (result instanceof Array) {
	        return new Error(`Cannot stringify due errors:\n ${result.map((error: Error) => error.message).join('\n')}`);
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
	        return new Error(`Cannot parse due errors:\n ${result.map((error: Error) => error.message).join('\n')}`);
	    }
	    return result;
	}
	
	export function parseFrom(str: string | object, protocols: any | any[]): any {
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
	    protocols = protocols instanceof Array ? protocols : [protocols];
	    let result: any;
	    protocols.forEach((protocol: any, i: number) => {
	        if (result !== undefined) {
	            return;
	        }
	        if (protocol === undefined || protocol === null || typeof protocol.parse !== 'function') {
	            result = new Error(`Incorrect ref to protocol is provided`);
	        }
	        result = protocol.parse(json);
	        if (result instanceof Error && i !== protocols.length - 1) {
	            result = undefined;
	        }
	    });
	    return result;
	}
	
	export function typeOf(smth: any): string {
	    switch (typeof smth) {
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
	
	export function validateParams(params: any, classRef: any): Error[] {
	    const errors: Error[] = [];
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
	        switch (desc.type) {
	            case EEntityType.repeated:
	                if (!(params[prop] instanceof Array)) {
	                    errors.push(new Error(`Property "${prop}" has wrong format. Expected an array (repeated). Reference: "${classRefName}"`));
	                    break;
	                }
	                if (typeof desc.value === 'string') {
	                    params[prop] = params[prop].map((value: any) => {
	                        const nestedType = types[desc.value];
	                        if (typeOf(value) !== nestedType.tsType) {
	                            errors.push(new Error(`Property "${prop}" has wrong format. Expected an array (repeated) of "${nestedType.tsType}"`));
	                        }
	                    });
	                } else if (typeof desc.value === 'function') {
	                    // It's reference to class
	                    params[prop].forEach((instance: any, index: number) => {
	                        if (!(instance instanceof desc.value)) {
	                            errors.push(new Error(`Expecting property "${prop}", index "${index}" should be instance of "${desc.value.name}".`));
	                        }
	                    });
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
	                    params[prop].forEach((value: any) => {
	                        if (desc.value[value] === void 0) {
	                            errors.push(new Error(`Property "${prop}" has wrong value: "${value}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                        }
	                    });
	                }
	                break;
	            case EEntityType.primitive:
	                const type = types[desc.value];
	                if (typeOf(params[prop]) !== type.tsType) {
	                    errors.push(new Error(`Property "${prop}" has wrong format. Expected: "${type.tsType}".`));
	                }
	                break;
	            case EEntityType.reference:
	                if (typeof desc.value === 'function') {
	                    // It's reference to class
	                    if (!(params[prop] instanceof desc.value)) {
	                        errors.push(new Error(`Expecting property "${prop}" will be instance of "${desc.value.name}".`));
	                    }
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
	                    if (desc.value[params[prop]] === void 0) {
	                        errors.push(new Error(`Property "${prop}" has wrong value: "${params[prop]}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                    }
	                }
	                break;
	        }
	    });
	    return errors;
	}
	
	export class Root {
	
	}
	

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: map of references
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export let ReferencesMap: {[key: string]: any} = {};
	export function init(){
		ReferencesMap["36550583"] = Message.UnsubscribeAll.Request;
		ReferencesMap["60658336"] = Message.Unsubscribe.Response;
		ReferencesMap["66972276"] = Message.Registration.Response;
		ReferencesMap["71280621"] = Disconnect;
		ReferencesMap["76052942"] = Message.Event.Options;
		ReferencesMap["70D1C8A2"] = Message;
		ReferencesMap["411DF73D"] = Message.Reconnection;
		ReferencesMap["7E8304BE"] = Message.Reconnection.Request;
		ReferencesMap["550547F2"] = Message.Reconnection.Response;
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
		ReferencesMap["C78C95B"] = Message.Registration;
		ReferencesMap["34F5A3DA"] = Message.Registration.Request;
		ReferencesMap["2B39E6C9"] = Message.Demand;
		ReferencesMap["9BE21CD"] = Message.Demand.FromExpectant;
		ReferencesMap["47D79F4E"] = Message.Demand.FromExpectant.Request;
		ReferencesMap["49BC009E"] = Message.Demand.FromExpectant.Response;
		ReferencesMap["265B8137"] = Message.Demand.FromRespondent;
		ReferencesMap["40FBF4B8"] = Message.Demand.FromRespondent.Request;
		ReferencesMap["1E55A8C8"] = Message.Demand.FromRespondent.Response;
		ReferencesMap["479DF39"] = Message.Demand.Options;
		ReferencesMap["4C521D22"] = Message.Respondent;
		ReferencesMap["502499A9"] = Message.Respondent.Bind;
		ReferencesMap["2A67B2A"] = Message.Respondent.Bind.Request;
		ReferencesMap["55509F06"] = Message.Respondent.Bind.Response;
		ReferencesMap["5EDF73E"] = Message.Respondent.Unbind;
		ReferencesMap["699C3EBD"] = Message.Respondent.Unbind.Request;
		ReferencesMap["393C1C0D"] = Message.Respondent.Unbind.Response;
		ReferencesMap["4F0C247D"] = Message.ToConsumer;
		ReferencesMap["282376D8"] = EventDefinition;
		ReferencesMap["61578FC3"] = DemandDefinition;
		ReferencesMap["2DEBB962"] = Subscription;
		ReferencesMap["583DFB65"] = ConnectionError;
		ReferencesMap["1DB68EE9"] = KeyValue;
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: protocol signature
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export function getSignature() {
		return "73C17AF5";
	}

}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Primitive type injections
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function guid() {
            var lengths = [4, 4, 4, 8];
            var resultGuid = '';
            for (var i = lengths.length - 1; i >= 0; i -= 1) {
                resultGuid += (Math.round(Math.random() * Math.random() * Math.pow(10, lengths[i] * 2))
                    .toString(16)
                    .substr(0, lengths[i])
                    .toUpperCase() + '-');
            }
            resultGuid += ((new Date()).getTime() * (Math.random() * 100))
                .toString(16)
                .substr(0, 12)
                .toUpperCase();
            return resultGuid;
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
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, Message);
	}
	public stringify(): string {
		return Protocol.stringify(this, Message) as string;
	}
	public clientId: string = "";
	public guid?: string = guid();

	constructor(args: { clientId: string, guid?: string }) {
		super();
		this.clientId = args.clientId;
		args.guid !== void 0 && (this.guid = args.guid);
		const errors: Error[] = Protocol.validateParams(args, Message);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "Message" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export namespace Message {
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
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Reconnection);
		}
		public stringify(): string {
			return Protocol.stringify(this, Reconnection) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Reconnection);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Reconnection" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Reconnection {
		export class Request extends Reconnection {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
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
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Request);
			}
			public stringify(): string {
				return Protocol.stringify(this, Request) as string;
			}
			public token: string = "";

			constructor(args: { clientId: string, guid?: string, token: string }) {
				super(Object.assign(args, {}));
				this.token = args.token;
				const errors: Error[] = Protocol.validateParams(args, Request);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
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
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Response);
			}
			public stringify(): string {
				return Protocol.stringify(this, Response) as string;
			}
			public allowed: boolean = false;

			constructor(args: { clientId: string, guid?: string, allowed: boolean }) {
				super(Object.assign(args, {}));
				this.allowed = args.allowed;
				const errors: Error[] = Protocol.validateParams(args, Response);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		type TResponses = Response | ConnectionError;
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
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Event);
		}
		public stringify(): string {
			return Protocol.stringify(this, Event) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Event);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Event" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Event {
		export class Request extends Event {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					event: { name: "event", value: EventDefinition, type: Protocol.EEntityType.reference, optional: false }, 
					token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					aliases: { name: "aliases", value: KeyValue, type: Protocol.EEntityType.repeated, optional: true }, 
					options: { name: "options", value: Message.Event.Options, type: Protocol.EEntityType.reference, optional: true }, 
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
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Request);
			}
			public stringify(): string {
				return Protocol.stringify(this, Request) as string;
			}
			public event: EventDefinition;
			public token: string = "";
			public aliases?: Array<KeyValue> = [];
			public options?: Message.Event.Options;

			constructor(args: { clientId: string, guid?: string, event: EventDefinition, token: string, aliases?: Array<KeyValue>, options?: Message.Event.Options }) {
				super(Object.assign(args, {}));
				this.event = args.event;
				this.token = args.token;
				args.aliases !== void 0 && (this.aliases = args.aliases);
				args.options !== void 0 && (this.options = args.options);
				const errors: Error[] = Protocol.validateParams(args, Request);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export class Response extends Event {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
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
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Response);
			}
			public stringify(): string {
				return Protocol.stringify(this, Response) as string;
			}
			public subscribers: number = -1;

			constructor(args: { clientId: string, guid?: string, subscribers: number }) {
				super(Object.assign(args, {}));
				this.subscribers = args.subscribers;
				const errors: Error[] = Protocol.validateParams(args, Response);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		export class Options extends Protocol.Root {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					scope: { name: "scope", value: Message.Event.Options.Scope, type: Protocol.EEntityType.reference, optional: true }, 
				}
			}
			static __signature: string = "76052942";
			static getSignature(): string {
				return Options.__signature;
			}
			public __signature: string = Options.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Options);
			}
			public stringify(): string {
				return Protocol.stringify(this, Options) as string;
			}
			public scope?: Message.Event.Options.Scope;

			constructor(args: { scope?: Message.Event.Options.Scope }) {
				super();
				args.scope !== void 0 && (this.scope = args.scope);
				const errors: Error[] = Protocol.validateParams(args, Options);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Options" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export namespace Options {
			export enum Scope {
				local = 'local',
				hosts = 'hosts',
				clients = 'clients',
				all = 'all'
			}
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
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Subscribe);
		}
		public stringify(): string {
			return Protocol.stringify(this, Subscribe) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Subscribe);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Subscribe" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Subscribe {
		export class Request extends Subscribe {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					subscription: { name: "subscription", value: Subscription, type: Protocol.EEntityType.reference, optional: false }, 
					token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
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
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Request);
			}
			public stringify(): string {
				return Protocol.stringify(this, Request) as string;
			}
			public subscription: Subscription;
			public token: string = "";

			constructor(args: { clientId: string, guid?: string, subscription: Subscription, token: string }) {
				super(Object.assign(args, {}));
				this.subscription = args.subscription;
				this.token = args.token;
				const errors: Error[] = Protocol.validateParams(args, Request);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export class Response extends Subscribe {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
					error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
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
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Response);
			}
			public stringify(): string {
				return Protocol.stringify(this, Response) as string;
			}
			public status: boolean = false;
			public error?: string = "";

			constructor(args: { clientId: string, guid?: string, status: boolean, error?: string }) {
				super(Object.assign(args, {}));
				this.status = args.status;
				args.error !== void 0 && (this.error = args.error);
				const errors: Error[] = Protocol.validateParams(args, Response);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

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
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Unsubscribe);
		}
		public stringify(): string {
			return Protocol.stringify(this, Unsubscribe) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Unsubscribe);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Unsubscribe" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Unsubscribe {
		export class Request extends Unsubscribe {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					subscription: { name: "subscription", value: Subscription, type: Protocol.EEntityType.reference, optional: false }, 
					token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
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
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Request);
			}
			public stringify(): string {
				return Protocol.stringify(this, Request) as string;
			}
			public subscription: Subscription;
			public token: string = "";

			constructor(args: { clientId: string, guid?: string, subscription: Subscription, token: string }) {
				super(Object.assign(args, {}));
				this.subscription = args.subscription;
				this.token = args.token;
				const errors: Error[] = Protocol.validateParams(args, Request);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export class Response extends Unsubscribe {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
					error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
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
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Response);
			}
			public stringify(): string {
				return Protocol.stringify(this, Response) as string;
			}
			public status: boolean = false;
			public error?: string = "";

			constructor(args: { clientId: string, guid?: string, status: boolean, error?: string }) {
				super(Object.assign(args, {}));
				this.status = args.status;
				args.error !== void 0 && (this.error = args.error);
				const errors: Error[] = Protocol.validateParams(args, Response);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

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
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, UnsubscribeAll);
		}
		public stringify(): string {
			return Protocol.stringify(this, UnsubscribeAll) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, UnsubscribeAll);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "UnsubscribeAll" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace UnsubscribeAll {
		export class Request extends UnsubscribeAll {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					subscription: { name: "subscription", value: Subscription, type: Protocol.EEntityType.reference, optional: false }, 
					token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
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
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Request);
			}
			public stringify(): string {
				return Protocol.stringify(this, Request) as string;
			}
			public subscription: Subscription;
			public token: string = "";

			constructor(args: { clientId: string, guid?: string, subscription: Subscription, token: string }) {
				super(Object.assign(args, {}));
				this.subscription = args.subscription;
				this.token = args.token;
				const errors: Error[] = Protocol.validateParams(args, Request);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export class Response extends UnsubscribeAll {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
					error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
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
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Response);
			}
			public stringify(): string {
				return Protocol.stringify(this, Response) as string;
			}
			public status: boolean = false;
			public error?: string = "";

			constructor(args: { clientId: string, guid?: string, status: boolean, error?: string }) {
				super(Object.assign(args, {}));
				this.status = args.status;
				args.error !== void 0 && (this.error = args.error);
				const errors: Error[] = Protocol.validateParams(args, Response);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		type TResponses = Response | ConnectionError;
	}
	export class Registration extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "C78C95B";
		static getSignature(): string {
			return Registration.__signature;
		}
		public __signature: string = Registration.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Registration);
		}
		public stringify(): string {
			return Protocol.stringify(this, Registration) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Registration);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Registration" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Registration {
		export class Request extends Registration {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					aliases: { name: "aliases", value: KeyValue, type: Protocol.EEntityType.repeated, optional: false }, 
					token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				}
			}
			static __signature: string = "34F5A3DA";
			static getSignature(): string {
				return Request.__signature;
			}
			public __signature: string = Request.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Request);
			}
			public stringify(): string {
				return Protocol.stringify(this, Request) as string;
			}
			public aliases: Array<KeyValue> = [];
			public token: string = "";

			constructor(args: { clientId: string, guid?: string, aliases: Array<KeyValue>, token: string }) {
				super(Object.assign(args, {}));
				this.aliases = args.aliases;
				this.token = args.token;
				const errors: Error[] = Protocol.validateParams(args, Request);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export class Response extends Registration {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
					status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
					error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "66972276";
			static getSignature(): string {
				return Response.__signature;
			}
			public __signature: string = Response.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Response);
			}
			public stringify(): string {
				return Protocol.stringify(this, Response) as string;
			}
			public status: boolean = false;
			public error?: string = "";

			constructor(args: { clientId: string, guid?: string, status: boolean, error?: string }) {
				super(Object.assign(args, {}));
				this.status = args.status;
				args.error !== void 0 && (this.error = args.error);
				const errors: Error[] = Protocol.validateParams(args, Response);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export enum Responses {
			ConnectionError = 'ConnectionError'
		}
		type TResponses = Response | ConnectionError;
	}
	export class Demand extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "2B39E6C9";
		static getSignature(): string {
			return Demand.__signature;
		}
		public __signature: string = Demand.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Demand);
		}
		public stringify(): string {
			return Protocol.stringify(this, Demand) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Demand);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Demand" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Demand {
		export class FromExpectant extends Demand {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "9BE21CD";
			static getSignature(): string {
				return FromExpectant.__signature;
			}
			public __signature: string = FromExpectant.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, FromExpectant);
			}
			public stringify(): string {
				return Protocol.stringify(this, FromExpectant) as string;
			}

			constructor(args: { clientId: string, guid?: string }) {
				super(Object.assign(args, {}));
				const errors: Error[] = Protocol.validateParams(args, FromExpectant);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "FromExpectant" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export namespace FromExpectant {
			export class Request extends FromExpectant {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						demand: { name: "demand", value: DemandDefinition, type: Protocol.EEntityType.reference, optional: false }, 
						token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						query: { name: "query", value: KeyValue, type: Protocol.EEntityType.repeated, optional: false }, 
						options: { name: "options", value: Message.Demand.Options, type: Protocol.EEntityType.reference, optional: true }, 
					}
				}
				static __signature: string = "47D79F4E";
				static getSignature(): string {
					return Request.__signature;
				}
				public __signature: string = Request.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Request);
				}
				public stringify(): string {
					return Protocol.stringify(this, Request) as string;
				}
				public demand: DemandDefinition;
				public token: string = "";
				public query: Array<KeyValue> = [];
				public options?: Message.Demand.Options;

				constructor(args: { clientId: string, guid?: string, demand: DemandDefinition, token: string, query: Array<KeyValue>, options?: Message.Demand.Options }) {
					super(Object.assign(args, {}));
					this.demand = args.demand;
					this.token = args.token;
					this.query = args.query;
					args.options !== void 0 && (this.options = args.options);
					const errors: Error[] = Protocol.validateParams(args, Request);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export class Response extends FromExpectant {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						id: { name: "id", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						state: { name: "state", value: Message.Demand.State, type: Protocol.EEntityType.reference, optional: false }, 
						error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
					}
				}
				static __signature: string = "49BC009E";
				static getSignature(): string {
					return Response.__signature;
				}
				public __signature: string = Response.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Response);
				}
				public stringify(): string {
					return Protocol.stringify(this, Response) as string;
				}
				public id: string = "";
				public state: Message.Demand.State;
				public error?: string = "";

				constructor(args: { clientId: string, guid?: string, id: string, state: Message.Demand.State, error?: string }) {
					super(Object.assign(args, {}));
					this.id = args.id;
					this.state = args.state;
					args.error !== void 0 && (this.error = args.error);
					const errors: Error[] = Protocol.validateParams(args, Response);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export enum Responses {
				ConnectionError = 'ConnectionError'
			}
			type TResponses = Response | ConnectionError;
		}
		export class FromRespondent extends Demand {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "265B8137";
			static getSignature(): string {
				return FromRespondent.__signature;
			}
			public __signature: string = FromRespondent.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, FromRespondent);
			}
			public stringify(): string {
				return Protocol.stringify(this, FromRespondent) as string;
			}

			constructor(args: { clientId: string, guid?: string }) {
				super(Object.assign(args, {}));
				const errors: Error[] = Protocol.validateParams(args, FromRespondent);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "FromRespondent" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export namespace FromRespondent {
			export class Request extends FromRespondent {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						id: { name: "id", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
						demand: { name: "demand", value: DemandDefinition, type: Protocol.EEntityType.reference, optional: true }, 
					}
				}
				static __signature: string = "40FBF4B8";
				static getSignature(): string {
					return Request.__signature;
				}
				public __signature: string = Request.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Request);
				}
				public stringify(): string {
					return Protocol.stringify(this, Request) as string;
				}
				public id: string = "";
				public token: string = "";
				public error?: string = "";
				public demand?: DemandDefinition;

				constructor(args: { clientId: string, guid?: string, id: string, token: string, error?: string, demand?: DemandDefinition }) {
					super(Object.assign(args, {}));
					this.id = args.id;
					this.token = args.token;
					args.error !== void 0 && (this.error = args.error);
					args.demand !== void 0 && (this.demand = args.demand);
					const errors: Error[] = Protocol.validateParams(args, Request);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export class Response extends FromRespondent {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
						error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
					}
				}
				static __signature: string = "1E55A8C8";
				static getSignature(): string {
					return Response.__signature;
				}
				public __signature: string = Response.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Response);
				}
				public stringify(): string {
					return Protocol.stringify(this, Response) as string;
				}
				public status: boolean = false;
				public error?: string = "";

				constructor(args: { clientId: string, guid?: string, status: boolean, error?: string }) {
					super(Object.assign(args, {}));
					this.status = args.status;
					args.error !== void 0 && (this.error = args.error);
					const errors: Error[] = Protocol.validateParams(args, Response);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export enum Responses {
				ConnectionError = 'ConnectionError'
			}
			type TResponses = Response | ConnectionError;
		}
		export enum State {
			ERROR = 'ERROR',
			NO_RESPONDENTS = 'NO_RESPONDENTS',
			SUCCESS = 'SUCCESS',
			DEMAND_SENT = 'DEMAND_SENT',
			PENDING = 'PENDING'
		}
		export class Options extends Protocol.Root {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					scope: { name: "scope", value: Message.Demand.Options.Scope, type: Protocol.EEntityType.reference, optional: true }, 
				}
			}
			static __signature: string = "479DF39";
			static getSignature(): string {
				return Options.__signature;
			}
			public __signature: string = Options.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Options);
			}
			public stringify(): string {
				return Protocol.stringify(this, Options) as string;
			}
			public scope?: Message.Demand.Options.Scope;

			constructor(args: { scope?: Message.Demand.Options.Scope }) {
				super();
				args.scope !== void 0 && (this.scope = args.scope);
				const errors: Error[] = Protocol.validateParams(args, Options);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Options" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export namespace Options {
			export enum Scope {
				local = 'local',
				hosts = 'hosts',
				clients = 'clients',
				all = 'all'
			}
		}
	}
	export class Respondent extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			}
		}
		static __signature: string = "4C521D22";
		static getSignature(): string {
			return Respondent.__signature;
		}
		public __signature: string = Respondent.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, Respondent);
		}
		public stringify(): string {
			return Protocol.stringify(this, Respondent) as string;
		}

		constructor(args: { clientId: string, guid?: string }) {
			super(Object.assign(args, {}));
			const errors: Error[] = Protocol.validateParams(args, Respondent);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "Respondent" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export namespace Respondent {
		export class Bind extends Respondent {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "502499A9";
			static getSignature(): string {
				return Bind.__signature;
			}
			public __signature: string = Bind.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Bind);
			}
			public stringify(): string {
				return Protocol.stringify(this, Bind) as string;
			}

			constructor(args: { clientId: string, guid?: string }) {
				super(Object.assign(args, {}));
				const errors: Error[] = Protocol.validateParams(args, Bind);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Bind" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export namespace Bind {
			export class Request extends Bind {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						demand: { name: "demand", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						protocol: { name: "protocol", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						query: { name: "query", value: KeyValue, type: Protocol.EEntityType.repeated, optional: false }, 
					}
				}
				static __signature: string = "2A67B2A";
				static getSignature(): string {
					return Request.__signature;
				}
				public __signature: string = Request.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Request);
				}
				public stringify(): string {
					return Protocol.stringify(this, Request) as string;
				}
				public demand: string = "";
				public protocol: string = "";
				public token: string = "";
				public query: Array<KeyValue> = [];

				constructor(args: { clientId: string, guid?: string, demand: string, protocol: string, token: string, query: Array<KeyValue> }) {
					super(Object.assign(args, {}));
					this.demand = args.demand;
					this.protocol = args.protocol;
					this.token = args.token;
					this.query = args.query;
					const errors: Error[] = Protocol.validateParams(args, Request);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export class Response extends Bind {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
						error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
					}
				}
				static __signature: string = "55509F06";
				static getSignature(): string {
					return Response.__signature;
				}
				public __signature: string = Response.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Response);
				}
				public stringify(): string {
					return Protocol.stringify(this, Response) as string;
				}
				public status: boolean = false;
				public error?: string = "";

				constructor(args: { clientId: string, guid?: string, status: boolean, error?: string }) {
					super(Object.assign(args, {}));
					this.status = args.status;
					args.error !== void 0 && (this.error = args.error);
					const errors: Error[] = Protocol.validateParams(args, Response);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export enum Responses {
				ConnectionError = 'ConnectionError'
			}
			type TResponses = Response | ConnectionError;
		}
		export class Unbind extends Respondent {
			static getDescription(): {[key: string]: Protocol.IProperty } {
				return {
					clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				}
			}
			static __signature: string = "5EDF73E";
			static getSignature(): string {
				return Unbind.__signature;
			}
			public __signature: string = Unbind.__signature;
			public getSignature(): string {
				return this.__signature;
			}
			static parse(str: string | object): Protocol.TTypes | Error {
				return Protocol.parse(str, Unbind);
			}
			public stringify(): string {
				return Protocol.stringify(this, Unbind) as string;
			}

			constructor(args: { clientId: string, guid?: string }) {
				super(Object.assign(args, {}));
				const errors: Error[] = Protocol.validateParams(args, Unbind);
				if (errors.length > 0) {
					throw new Error(`Cannot create class of "Unbind" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
				}

			}
		}
		export namespace Unbind {
			export class Request extends Unbind {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						demand: { name: "demand", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						protocol: { name: "protocol", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						token: { name: "token", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
					}
				}
				static __signature: string = "699C3EBD";
				static getSignature(): string {
					return Request.__signature;
				}
				public __signature: string = Request.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Request);
				}
				public stringify(): string {
					return Protocol.stringify(this, Request) as string;
				}
				public demand: string = "";
				public protocol: string = "";
				public token: string = "";

				constructor(args: { clientId: string, guid?: string, demand: string, protocol: string, token: string }) {
					super(Object.assign(args, {}));
					this.demand = args.demand;
					this.protocol = args.protocol;
					this.token = args.token;
					const errors: Error[] = Protocol.validateParams(args, Request);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Request" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export class Response extends Unbind {
				static getDescription(): {[key: string]: Protocol.IProperty } {
					return {
						clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
						guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
						status: { name: "status", value: "boolean", type: Protocol.EEntityType.primitive, optional: false }, 
					}
				}
				static __signature: string = "393C1C0D";
				static getSignature(): string {
					return Response.__signature;
				}
				public __signature: string = Response.__signature;
				public getSignature(): string {
					return this.__signature;
				}
				static parse(str: string | object): Protocol.TTypes | Error {
					return Protocol.parse(str, Response);
				}
				public stringify(): string {
					return Protocol.stringify(this, Response) as string;
				}
				public status: boolean = false;

				constructor(args: { clientId: string, guid?: string, status: boolean }) {
					super(Object.assign(args, {}));
					this.status = args.status;
					const errors: Error[] = Protocol.validateParams(args, Response);
					if (errors.length > 0) {
						throw new Error(`Cannot create class of "Response" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
					}

				}
			}
			export enum Responses {
				ConnectionError = 'ConnectionError'
			}
			type TResponses = Response | ConnectionError;
		}
	}
	export class ToConsumer extends Message {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				clientId: { name: "clientId", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
				guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
				event: { name: "event", value: EventDefinition, type: Protocol.EEntityType.reference, optional: true }, 
				demand: { name: "demand", value: DemandDefinition, type: Protocol.EEntityType.reference, optional: true }, 
				return: { name: "return", value: DemandDefinition, type: Protocol.EEntityType.reference, optional: true }, 
			}
		}
		static __signature: string = "4F0C247D";
		static getSignature(): string {
			return ToConsumer.__signature;
		}
		public __signature: string = ToConsumer.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, ToConsumer);
		}
		public stringify(): string {
			return Protocol.stringify(this, ToConsumer) as string;
		}
		public event?: EventDefinition;
		public demand?: DemandDefinition;
		public return?: DemandDefinition;

		constructor(args: { clientId: string, guid?: string, event?: EventDefinition, demand?: DemandDefinition, return?: DemandDefinition }) {
			super(Object.assign(args, {}));
			args.event !== void 0 && (this.event = args.event);
			args.demand !== void 0 && (this.demand = args.demand);
			args.return !== void 0 && (this.return = args.return);
			const errors: Error[] = Protocol.validateParams(args, ToConsumer);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "ToConsumer" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
}
export class EventDefinition extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			protocol: { name: "protocol", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			event: { name: "event", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			body: { name: "body", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
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
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, EventDefinition);
	}
	public stringify(): string {
		return Protocol.stringify(this, EventDefinition) as string;
	}
	public protocol: string = "";
	public event: string = "";
	public body: string = "";

	constructor(args: { protocol: string, event: string, body: string }) {
		super();
		this.protocol = args.protocol;
		this.event = args.event;
		this.body = args.body;
		const errors: Error[] = Protocol.validateParams(args, EventDefinition);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "EventDefinition" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export class DemandDefinition extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			id: { name: "id", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			protocol: { name: "protocol", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			demand: { name: "demand", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			body: { name: "body", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			expected: { name: "expected", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			error: { name: "error", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
			pending: { name: "pending", value: "boolean", type: Protocol.EEntityType.primitive, optional: true }, 
		}
	}
	static __signature: string = "61578FC3";
	static getSignature(): string {
		return DemandDefinition.__signature;
	}
	public __signature: string = DemandDefinition.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, DemandDefinition);
	}
	public stringify(): string {
		return Protocol.stringify(this, DemandDefinition) as string;
	}
	public id: string = "";
	public protocol: string = "";
	public demand: string = "";
	public body: string = "";
	public expected: string = "";
	public error?: string = "";
	public pending?: boolean = false;

	constructor(args: { id: string, protocol: string, demand: string, body: string, expected: string, error?: string, pending?: boolean }) {
		super();
		this.id = args.id;
		this.protocol = args.protocol;
		this.demand = args.demand;
		this.body = args.body;
		this.expected = args.expected;
		args.error !== void 0 && (this.error = args.error);
		args.pending !== void 0 && (this.pending = args.pending);
		const errors: Error[] = Protocol.validateParams(args, DemandDefinition);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "DemandDefinition" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

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
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, Subscription);
	}
	public stringify(): string {
		return Protocol.stringify(this, Subscription) as string;
	}
	public protocol: string = "";
	public event?: string = "";

	constructor(args: { protocol: string, event?: string }) {
		super();
		this.protocol = args.protocol;
		args.event !== void 0 && (this.event = args.event);
		const errors: Error[] = Protocol.validateParams(args, Subscription);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "Subscription" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export class ConnectionError extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			guid: { name: "guid", value: "guid", type: Protocol.EEntityType.primitive, optional: true }, 
			reason: { name: "reason", value: ConnectionError.Reasons, type: Protocol.EEntityType.reference, optional: false }, 
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
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, ConnectionError);
	}
	public stringify(): string {
		return Protocol.stringify(this, ConnectionError) as string;
	}
	public guid?: string = guid();
	public reason: ConnectionError.Reasons;
	public message: string = "";

	constructor(args: { guid?: string, reason: ConnectionError.Reasons, message: string }) {
		super();
		args.guid !== void 0 && (this.guid = args.guid);
		this.reason = args.reason;
		this.message = args.message;
		const errors: Error[] = Protocol.validateParams(args, ConnectionError);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "ConnectionError" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export namespace ConnectionError {
	export enum Reasons {
		FAIL_AUTH = 'FAIL_AUTH',
		NO_TOKEN_FOUND = 'NO_TOKEN_FOUND',
		NO_CLIENT_ID_FOUND = 'NO_CLIENT_ID_FOUND',
		NO_TOKEN_PROVIDED = 'NO_TOKEN_PROVIDED',
		TOKEN_IS_WRONG = 'TOKEN_IS_WRONG',
		UNEXPECTED_REQUEST = 'UNEXPECTED_REQUEST',
		NO_DATA_PROVIDED = 'NO_DATA_PROVIDED'
	}
}
export class Disconnect extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			reason: { name: "reason", value: Disconnect.Reasons, type: Protocol.EEntityType.reference, optional: false }, 
			message: { name: "message", value: "string", type: Protocol.EEntityType.primitive, optional: true }, 
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
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, Disconnect);
	}
	public stringify(): string {
		return Protocol.stringify(this, Disconnect) as string;
	}
	public reason: Disconnect.Reasons;
	public message?: string = "";

	constructor(args: { reason: Disconnect.Reasons, message?: string }) {
		super();
		this.reason = args.reason;
		args.message !== void 0 && (this.message = args.message);
		const errors: Error[] = Protocol.validateParams(args, Disconnect);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "Disconnect" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export namespace Disconnect {
	export enum Reasons {
		SHUTDOWN = 'SHUTDOWN'
	}
}
export class KeyValue extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			key: { name: "key", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
			value: { name: "value", value: "string", type: Protocol.EEntityType.primitive, optional: false }, 
		}
	}
	static __signature: string = "1DB68EE9";
	static getSignature(): string {
		return KeyValue.__signature;
	}
	public __signature: string = KeyValue.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, KeyValue);
	}
	public stringify(): string {
		return Protocol.stringify(this, KeyValue) as string;
	}
	public key: string = "";
	public value: string = "";

	constructor(args: { key: string, value: string }) {
		super();
		this.key = args.key;
		this.value = args.value;
		const errors: Error[] = Protocol.validateParams(args, KeyValue);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "KeyValue" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Injection: export from Protocol namespace
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export type TProtocolTypes = Protocol.TTypes;
export const parse = Protocol.parse;
export const parseFrom = Protocol.parseFrom;
export const stringify = Protocol.stringify;
export const getSignature = Protocol.getSignature;
export interface IClass { getSignature: () => string; parse: (str: string | object) => any; }
export interface IImplementation { getSignature: () => string; stringify: () => string; }
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Injection: initialization
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
Protocol.init();
