/* tslint:disable */
/*
* This file generated automaticaly (Sun Feb 24 2019 00:53:46 GMT+0100 (CET))
* Do not remove or change this code.
* Protocol version: 0.0.1
*/

export namespace Protocol {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: map of types
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export type TTypes = 
		Requests.GetUsersInChannel |
		Events |
		Events.NewMessage |
		Events.RemovedMessage |
		Requests |
		Requests.GetChannels |
		Responses |
		Responses.ChannelUsersList |
		Responses.ChannelsList |
		ChatMessage |
		User |
		Channel |
		Request |
		Response;

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: map of types
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export const KeysMapLeft: {[key: string]: any} = {
		"3661859": {
			channelId: "a",
		},
		"D7E6E2": {
		},
		"4C177D37": {
			channelId: "a",
			message: "b",
		},
		"71D3EB56": {
			id: "a",
			channelId: "b",
			nickname: "c",
			message: "d",
			created: "e",
		},
		"3083FE77": {
			channelId: "a",
			messageId: "b",
		},
		"527E5577": {
		},
		"4EFB1ABF": {
		},
		"6482822D": {
		},
		"54A4AAC4": {
			channelId: "a",
			users: "b",
		},
		"3B609EF0": {
			nickname: "a",
			firstName: "b",
			lastName: "c",
		},
		"4B5A7131": {
			channels: "a",
		},
		"63F2459E": {
			name: "a",
			created: "b",
		},
		"7935BB2A": {
		},
		"4F56A0FA": {
		},
	};
	export const KeysMapRight: {[key: string]: any} = {
		"3661859": {
			a: "channelId",
		},
		"D7E6E2": {
		},
		"4C177D37": {
			a: "channelId",
			b: "message",
		},
		"71D3EB56": {
			a: "id",
			b: "channelId",
			c: "nickname",
			d: "message",
			e: "created",
		},
		"3083FE77": {
			a: "channelId",
			b: "messageId",
		},
		"527E5577": {
		},
		"4EFB1ABF": {
		},
		"6482822D": {
		},
		"54A4AAC4": {
			a: "channelId",
			b: "users",
		},
		"3B609EF0": {
			a: "nickname",
			b: "firstName",
			c: "lastName",
		},
		"4B5A7131": {
			a: "channels",
		},
		"63F2459E": {
			a: "name",
			b: "created",
		},
		"7935BB2A": {
		},
		"4F56A0FA": {
		},
	};
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: typed map
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export const TypedEntitiesMap: {[key: string]: any} = {
		"3661859": {
			a: "int16",
		},
		"D7E6E2": {
		},
		"4C177D37": {
			a: "int16",
			b: {
				a: "int16",
				b: "int16",
				c: "asciiString",
				d: "utf8String",
				e: "datetime",
			},
		},
		"3083FE77": {
			a: "int16",
			b: "int16",
		},
		"527E5577": {
		},
		"4EFB1ABF": {
		},
		"6482822D": {
		},
		"54A4AAC4": {
			a: "int16",
			b: [{
				a: "asciiString",
				b: "utf8String",
				c: "utf8String",
			}],
		},
		"4B5A7131": {
			a: [{
				a: "utf8String",
				b: "datetime",
			}],
		},
		"71D3EB56": {
			a: "int16",
			b: "int16",
			c: "asciiString",
			d: "utf8String",
			e: "datetime",
		},
		"3B609EF0": {
			a: "asciiString",
			b: "utf8String",
			c: "utf8String",
		},
		"63F2459E": {
			a: "utf8String",
			b: "datetime",
		},
		"7935BB2A": {
		},
		"4F56A0FA": {
		},
	};

	export const AdvancedTypes: {[key: string]: any} = {};
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: injection.packager.ts
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// tslint:disable:no-namespace
	// tslint:disable:max-classes-per-file
	// tslint:disable:object-literal-sort-keys
	
	// declare var Json: any;
	
	export namespace Packager {
	
	    export function join(...items: any[]): string | Uint8Array | Error {
	        if (items instanceof Array && items.length === 1 && items[0] instanceof Array) {
	            items = items[0];
	        }
	        if (!(items instanceof Array) || items.length === 0) {
	            return new Error(`No arguments provided to join`);
	        }
	        const strs: any[] = [];
	        const bytes: number[] = [];
	        let isBinary: boolean | undefined;
	        try {
	            items.forEach((item: any, i: number) => {
	                if (item instanceof Uint8Array && (isBinary === undefined || isBinary === true)) {
	                    isBinary = true;
	                    if (i === 0) {
	                        // Set type as array
	                        bytes.push(Json.Scheme.Types.array);
	                    }
	                    // Set length of item
	                    bytes.push(...Json.Impls.Uint32.toUint8(item.length));
	                    // Put item
	                    bytes.push(...item);
	                } else if (typeof item === 'string' && (isBinary === undefined || isBinary === false)) {
	                    isBinary = false;
	                    strs.push(item);
	                } else {
	                    throw new Error(`Only strings or Uint8Array can be joined. Each array item should be same type.`);
	                }
	            });
	            if (isBinary) {
	                return new Uint8Array(bytes);
	            }
	        } catch (error) {
	            return error;
	        }
	        return JSON.stringify(strs);
	    }
	
	    export function split(source: string | Uint8Array): string[] | Uint8Array[] | Error {
	        if (!isPackage(source)) {
	            return new Error(`Source isn't a package of protocol data.`);
	        }
	        if (source instanceof ArrayBuffer) {
	            source = new Uint8Array(source);
	        }
	        if (source instanceof Uint8Array) {
	            let buffer = source.slice(1, source.length);
	            const items: Uint8Array[] = [];
	            do {
	                const itemLength = Json.Impls.Uint32.fromUint8(buffer.slice(0, 4));
	                items.push(buffer.slice(4, 4 + itemLength));
	                buffer = buffer.slice(4 + itemLength, buffer.length);
	            } while (buffer.length > 0);
	            return items;
	        } else {
	            return JSON.parse(source) as string[];
	        }
	    }
	
	    export function isPackage(source: any): boolean {
	        if (source instanceof Uint8Array) {
	            return source[0] === Json.Scheme.Types.array;
	        } else if (source instanceof ArrayBuffer) {
	            const uint8array: Uint8Array = new Uint8Array(source);
	            return uint8array.length > 0 ? (uint8array[0] === Json.Scheme.Types.array) : false;
	        } else if (typeof source === 'string') {
	            try {
	                return JSON.parse(source) instanceof Array;
	            } catch (error) {
	                return false;
	            }
	        } else {
	            return false;
	        }
	    }
	
	}
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: injection.root.ts
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// tslint:disable:max-classes-per-file
	
	// declare var ReferencesMap: {[key: string]: any};
	// declare var PrimitiveTypes: {[key: string]: any};
	// declare var AdvancedTypes: {[key: string]: any};
	// declare var KeysMapLeft: {[key: string]: any};
	// declare var KeysMapRight: {[key: string]: any};
	// declare var TypedEntitiesMap: {[key: string]: any};
	// declare var ConvertedTypedEntitiesMap: {[key: string]: any};
	// declare var ConvertedTypedEntitiesMinMap: {[key: string]: any};
	// declare var Json: any;
	
	// declare type TTypes = any;
	
	export type TIncomeData = string | object | ArrayBuffer | number[] | Uint8Array;
	
	export type TStringifyOutput = string | Uint8Array;
	
	export class ProtocolState {
	
	    private _debug: boolean = false;
	
	    public debug(value: boolean) {
	        this._debug = value;
	    }
	
	    public isDebugged(): boolean {
	        return this._debug;
	    }
	
	}
	
	export const state: ProtocolState = new ProtocolState();
	
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
	
	export const StandardTypes: string[] = [
	    'int8', 'int16', 'int32',
	    'uint8', 'uint16', 'uint32',
	    'float32', 'float64', 'boolean',
	    'asciiString', 'utf8String',
	];
	
	export function _getPropNameAlias(propName: string, signature: string): string | Error {
	    if (state.isDebugged() || propName === '__signature') {
	        return propName;
	    }
	    if (KeysMapLeft[signature] === void 0) {
	        return new Error(`Fail to find keys map for ${signature}`);
	    }
	    if (KeysMapLeft[signature][propName] === void 0) {
	        return new Error(`Fail to find keys map for ${signature}; property "${propName}".`);
	    }
	    return KeysMapLeft[signature][propName];
	}
	
	export function _getPropName(alias: string, signature: string): string | Error {
	    if (state.isDebugged() || alias === '__signature') {
	        return alias;
	    }
	    if (KeysMapRight[signature] === void 0) {
	        return new Error(`Fail to find keys map for ${signature}`);
	    }
	    if (KeysMapRight[signature][alias] === void 0) {
	        return new Error(`Fail to find keys map for ${signature}; property alias "${alias}".`);
	    }
	    return KeysMapRight[signature][alias];
	}
	
	export function _parse(source: TIncomeData, target?: any): TTypes | Error[] {
	    const types: {[key: string]: any} = getTypes();
	    const json: any = getJSONFromIncomeData(source);
	    if (json instanceof Error) {
	        return [json];
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
	    Object.keys(json).forEach((alias: string) => {
	        const prop: string | Error = _getPropName(alias, json.__signature);
	        if (prop instanceof Error) {
	            errors.push(new Error(`Cannot get property name by alias "${alias}" due error: ${prop.message}.`));
	            return;
	        }
	        if (prop === alias) {
	            return;
	        }
	        json[prop] = json[alias];
	        delete json[alias];
	    });
	    if (errors.length > 0) {
	        return errors;
	    }
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
	
	export function _stringify(target: any, classRef: any): { [key: string]: any } | Error[] {
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
	        const propNameAlias: string | Error = _getPropNameAlias(prop, target.getSignature());
	        if (propNameAlias instanceof Error) {
	            errors.push(new Error(`Cannot get property alias for property "${prop}" due error: ${propNameAlias.message}.`));
	            return;
	        }
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
	                    json[propNameAlias] = target[prop].map((value: any) => {
	                        const nestedType = types[desc.value];
	                        if (!nestedType.validate(value)) {
	                            errors.push(new Error(`Property "${prop}" has wrong format. Value: ${value}; type: ${typeof value}.`));
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
	                    json[propNameAlias] = parsed;
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
	                    json[propNameAlias] = target[prop].map((value: any) => {
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
	                json[propNameAlias] = type.serialize(target[prop]);
	                break;
	            case EEntityType.reference:
	                if (typeof desc.value === 'function') {
	                    // It's reference to class
	                    const nested = _stringify(target[prop], desc.value);
	                    if (nested instanceof Array) {
	                        errors.push(new Error(`Cannot get instance of class "${desc.value.name}" from property "${prop}" due error: \n${nested.map((e: Error) => e.message).join(';\n')}`));
	                        break;
	                    }
	                    json[propNameAlias] = nested;
	                } else if (typeof desc.value === 'object') {
	                    // It's reference to enum
	                    if (desc.value[target[prop]] === void 0) {
	                        errors.push(new Error(`Property "${prop}" has wrong value: "${target[prop]}". Available values: ${Object.keys(desc.value).join(', ')}.`));
	                        break;
	                    }
	                    json[propNameAlias] = target[prop];
	                }
	                break;
	        }
	    });
	    if (errors.length > 0) {
	        return errors;
	    }
	    return json;
	}
	
	export function _JSONToBinary(target: any, signature: string): Uint8Array | Error {
	    if (ConvertedTypedEntitiesMap[signature] === void 0) {
	        return new Error(`Cannot find typed map for "${signature}"`);
	    }
	    try {
	        return Json.Convertor.encode(target, ConvertedTypedEntitiesMap[signature]);
	    } catch (error) {
	        return error;
	    }
	}
	
	export function _JSONFromBinary(data: Uint8Array): {} | Error {
	    try {
	        return Json.Convertor.decode(data);
	    } catch (error) {
	        return error;
	    }
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
	
	export function getJSONFromIncomeData(income: TIncomeData): {} | Error {
	    if (typeof income === 'string') {
	        return getJSONFromStr(income);
	    } else if (income instanceof Uint8Array) {
	        return _JSONFromBinary(income);
	    } else if (income instanceof ArrayBuffer) {
	        return _JSONFromBinary(new Uint8Array(income));
	    } else if (income instanceof Array) {
	        return _JSONFromBinary(new Uint8Array(income));
	    } else if (typeof income === 'object' && income !== null) {
	        return income;
	    } else {
	        return new Error(`Unsupported format of income data. Type: ${typeof income}`);
	    }
	}
	
	export function stringify(target: any, classRef: any): TStringifyOutput | Error {
	    const result = _stringify(target, classRef);
	    if (result instanceof Array) {
	        return new Error(`Cannot stringify due errors:\n ${result.map((error: Error) => error.message).join('\n')}`);
	    }
	    // Create binary
	    if (state.isDebugged()) {
	        return JSON.stringify(result);
	    }
	    return _JSONToBinary(result, classRef.getSignature());
	}
	
	export function parse(source: TIncomeData, target?: any): TTypes | Error {
	    const json: {} | Error = getJSONFromIncomeData(source);
	    if (json instanceof Error) {
	        return json;
	    }
	    const result = _parse(json, target);
	    if (result instanceof Array) {
	        return new Error(`Cannot parse due errors:\n ${result.map((error: Error) => error.message).join('\n')}`);
	    }
	    return result;
	}
	
	export function parseFrom(source: TIncomeData, protocols: any | any[]): any {
	    const json: {} | Error = getJSONFromIncomeData(source);
	    if (json instanceof Error) {
	        return json;
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
	                if (!type.validate(params[prop])) {
	                    errors.push(new Error(`Property "${prop}" has wrong value; validation was failed with value "${params[prop]}".`));
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
	
	export function convertTypesToStandard(target: {[key: string]: any}): {[key: string]: any} {
	    function getTypeFromStr(type: string): string | Error {
	        let result: string | Error;
	        if (PrimitiveTypes[type] !== void 0) {
	            result = PrimitiveTypes[type].binaryType;
	        } else if (AdvancedTypes[type] !== void 0) {
	            if (typeof AdvancedTypes[type].binaryType === 'string') {
	                result = AdvancedTypes[type].binaryType;
	            } else {
	                result = new Error(`Type "${type}" is defined as advanced type, but property "binaryType" isn't defined.`);
	            }
	        } else {
	            const availableTypes = [...Object.keys(PrimitiveTypes), ...Object.keys(AdvancedTypes)];
	            result = new Error(`Found unexpected type: "${type}". This type isn't defined in protocol. Available types in this protocol: ${availableTypes.join(', ')}`);
	        }
	        if (result instanceof Error) {
	            return result;
	        }
	        if (StandardTypes.indexOf(result) === -1) {
	            result = new Error(`Type "${result}" isn't standard type. Available standard types: ${StandardTypes.join(', ')}`);
	        }
	        return result;
	    }
	    const converted: {[key: string]: any} = { __signature: 'asciiString' };
	    Object.keys(target).forEach((key: string) => {
	        const value = target[key];
	        if (typeof value === 'string') {
	            const type: string | Error = getTypeFromStr(value);
	            if (type instanceof Error) {
	                throw type;
	            }
	            converted[key] = type;
	        } else if (value instanceof Array && value.length === 1) {
	            const type: string | {} | Error = typeof value[0] === 'string' ? getTypeFromStr(value[0]) : convertTypesToStandard(value[0]);
	            if (type instanceof Error) {
	                throw type;
	            }
	            converted[key] = [type];
	        } else if (typeof value === 'object' && value !== null) {
	            converted[key] = convertTypesToStandard(value);
	        } else {
	            throw new Error(`Unexpected value of type: ${value}. Check key: ${key}`);
	        }
	    });
	    return converted;
	}
	
	export function isInstanceOf(signature: string, target: any): boolean {
	    if (typeof target !== 'object' || target === null) {
	        return false;
	    }
	    if (typeof target.getSignature !== 'function') {
	        return false;
	    }
	    return target.getSignature() === signature;
	}
	
	export class Root {
	
	}
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: injection.convertor.ts
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// tslint:disable:no-namespace
	// tslint:disable:max-classes-per-file
	// tslint:disable:no-bitwise
	// tslint:disable:object-literal-sort-keys
	
	export namespace Json {
	
	    export namespace Impls {
	        export class Boolean {
	            public static toUint8(value: any): Uint8Array {
	                return new Uint8Array((new Uint8Array([value ? 1 : 0])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): boolean {
	                const int8 = new Uint8Array((new Uint8Array(bytes)).buffer);
	                return int8[0] === 1;
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'boolean') {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: boolean.`);
	                }
	                return undefined;
	            }
	        }
	        export class Float32 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Float32Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const float32 = new Float32Array((new Uint8Array(bytes)).buffer);
	                return float32[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                let generated: number = this.fromUint8(this.toUint8(value));
	                if (generated !== value) {
	                    const valueAsStr: string = value.toString();
	                    const decimalPos: number = valueAsStr.indexOf('.');
	                    if (decimalPos === -1) {
	                        generated = Math.round(generated);
	                    } else {
	                        const decimal: number = valueAsStr.substr(decimalPos + 1, valueAsStr.length).length;
	                        generated = parseFloat(generated.toFixed(decimal));
	                    }
	                }
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Float64 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Float64Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const float64 = new Float64Array((new Uint8Array(bytes)).buffer);
	                return float64[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                let generated: number = this.fromUint8(this.toUint8(value));
	                if (generated !== value) {
	                    const valueAsStr: string = value.toString();
	                    const decimalPos: number = valueAsStr.indexOf('.');
	                    if (decimalPos === -1) {
	                        generated = Math.round(generated);
	                    } else {
	                        const decimal: number = valueAsStr.substr(decimalPos + 1, valueAsStr.length).length;
	                        generated = parseFloat(generated.toFixed(decimal));
	                    }
	                }
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Int8 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Int8Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const int8 = new Int8Array((new Uint8Array(bytes)).buffer);
	                return int8[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                const generated: number = this.fromUint8(this.toUint8(value));
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Int16 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Int16Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const int16 = new Int16Array((new Uint8Array(bytes)).buffer);
	                return int16[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                const generated: number = this.fromUint8(this.toUint8(value));
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Int32 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Int32Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const int32 = new Int32Array((new Uint8Array(bytes)).buffer);
	                return int32[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                const generated: number = this.fromUint8(this.toUint8(value));
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Uint8 {
	            public static fromAsciiStr(str: string): Uint8Array {
	                const result = new Uint8Array(str.length);
	                Array.prototype.forEach.call(str, (char: string, i: number) => {
	                    result[i] = char.charCodeAt(0);
	                });
	                return result;
	            }
	            public static toAsciiStr(data: Uint8Array): string {
	                let result = '';
	                data.map((code: number) => {
	                    result += String.fromCharCode(code);
	                    return code;
	                });
	                return result;
	            }
	            public static fromUtf8Str(str: string): Uint8Array {
	                // Source of method implementation: https://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
	                const utf8 = [];
	                for (let i = 0; i < str.length; i++) {
	                    let charcode = str.charCodeAt(i);
	                    if (charcode < 0x80)  {
	                        utf8.push(charcode);
	                    } else if (charcode < 0x800) {
	                        utf8.push(0xc0 | (charcode >> 6),
	                                0x80 | (charcode & 0x3f));
	                    } else if (charcode < 0xd800 || charcode >= 0xe000) {
	                        utf8.push(0xe0 | (charcode >> 12),
	                                0x80 | ((charcode >> 6) & 0x3f),
	                                0x80 | (charcode & 0x3f));
	                    } else {
	                        i++;
	                        // UTF-16 encodes 0x10000-0x10FFFF by
	                        // subtracting 0x10000 and splitting the
	                        // 20 bits of 0x0-0xFFFFF into two halves
	                        charcode = 0x10000 + (((charcode & 0x3ff) << 10)
	                                | (str.charCodeAt(i) & 0x3ff));
	                        utf8.push(0xf0 | (charcode >> 18),
	                                0x80 | ((charcode >> 12) & 0x3f),
	                                0x80 | ((charcode >> 6) & 0x3f),
	                                0x80 | (charcode & 0x3f));
	                    }
	                }
	                return new Uint8Array(utf8);
	            }
	            public static toUtf8Str(bytes: Uint8Array): string {
	                // Source of method implementation: https://stackoverflow.com/questions/17191945/conversion-between-utf-8-arraybuffer-and-string
	                let out = "";
	                let i = 0;
	                const len = bytes.length;
	                while (i < len) {
	                    let char2;
	                    let char3;
	                    const c = bytes[ i++ ];
	                    switch (c >> 4) {
	                        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
	                            // 0xxxxxxx
	                            out += String.fromCharCode(c);
	                            break;
	                        case 12: case 13:
	                            // 110x xxxx   10xx xxxx
	                            char2 = bytes[i++];
	                            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
	                            break;
	                        case 14:
	                            // 1110 xxxx  10xx xxxx  10xx xxxx
	                            char2 = bytes[i++];
	                            char3 = bytes[i++];
	                            out += String.fromCharCode(((c & 0x0F) << 12) |
	                                                        ((char2 & 0x3F) << 6) |
	                                                        ((char3 & 0x3F) << 0));
	                            break;
	                    }
	                }
	                return out;
	            }
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Uint8Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const int8 = new Uint8Array((new Uint8Array(bytes)).buffer);
	                return int8[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                const generated: number = this.fromUint8(this.toUint8(value));
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Uint16 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Uint16Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const int16 = new Uint16Array((new Uint8Array(bytes)).buffer);
	                return int16[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                const generated: number = this.fromUint8(this.toUint8(value));
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	        export class Uint32 {
	            public static toUint8(int: any): Uint8Array {
	                return new Uint8Array((new Uint32Array([int])).buffer);
	            }
	            public static fromUint8(bytes: Uint8Array): number {
	                const int32 = new Uint32Array((new Uint8Array(bytes)).buffer);
	                return int32[0];
	            }
	            public static validate(value: number): Error | undefined {
	                if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
	                    return new Error(`Invalid basic type: ${typeof value}. Expected type: number.`);
	                }
	                const generated: number = this.fromUint8(this.toUint8(value));
	                return generated === value ? undefined : new Error(`Values dismatch. Original value: ${value}. Encoded & decoded value: ${generated}`);
	            }
	        }
	    }
	
	    export namespace Scheme {
	        export const Types = {
	            // Primitive types
	            int8: 0,
	            int16: 1,
	            int32: 2,
	            uint8: 3,
	            uint16: 4,
	            uint32: 5,
	            float32: 6,
	            float64: 7,
	            boolean: 8,
	            asciiString: 9,
	            utf8String: 10,
	            // Complex types
	            object: 100,
	            array: 101,
	        };
	        export const TypesNames = {
	            [Types.int8]: 'int8',
	            [Types.int16]: 'int16',
	            [Types.int32]: 'int32',
	            [Types.uint8]: 'uint8',
	            [Types.uint16]: 'uint16',
	            [Types.uint32]: 'uint32',
	            [Types.float32]: 'float32',
	            [Types.float64]: 'float64',
	            [Types.boolean]: 'boolean',
	            [Types.asciiString]: 'asciiString',
	            [Types.utf8String]: 'utf8String',
	            [Types.object]: 'object',
	        };
	        export const TypesSizes = {
	            [Types.int8]: 1,
	            [Types.int16]: 2,
	            [Types.int32]: 4,
	            [Types.uint8]: 1,
	            [Types.uint16]: 2,
	            [Types.uint32]: 4,
	            [Types.float32]: 4,
	            [Types.float64]: 8,
	            [Types.boolean]: 1,
	        };
	        export const TypesProviders = {
	            [Types.int8]: Impls.Int8,
	            [Types.int16]: Impls.Int16,
	            [Types.int32]: Impls.Int32,
	            [Types.uint8]: Impls.Uint8,
	            [Types.uint16]: Impls.Uint16,
	            [Types.uint32]: Impls.Uint32,
	            [Types.float32]: Impls.Float32,
	            [Types.float64]: Impls.Float64,
	            [Types.boolean]: Impls.Boolean,
	        };
	        export const LengthConvertor = {
	            object: Impls.Uint32.toUint8,
	            [Types.asciiString]: Impls.Uint32.toUint8,
	            [Types.utf8String]: Impls.Uint32.toUint8,
	        };
	        export const SizeDeclaration = {
	            [Types.asciiString]: true,
	            [Types.utf8String]: true,
	        };
	    }
	
	    const MAX_INTERACTIONS_COUNT = 1000;
	
	    export class Convertor {
	
	        public static encode(target: any, scheme: any, validation: boolean = true): Uint8Array {
	            const paket: number[] = [];
	            Object.keys(target).forEach((key: string) => {
	                const type = this._getPrimitiveType(scheme[key]);
	                const value = target[key];
	                const propName: Uint8Array = Impls.Uint8.fromAsciiStr(key);
	                if (type === null || type === undefined) {
	                    throw new Error(`Incorrect type provided in scheme: ${typeof type}; key: ${key}.`);
	                }
	                if (value === undefined) {
	                    return;
	                }
	                if (typeof type !== 'object' && !(type instanceof Array)) {
	                    // Primitives
	                    const propValue: number[] | Error = this._encodePrimitive(value, type, validation);
	                    if (propValue instanceof Error) {
	                        throw new Error(`Fail to encode property "${key}" due error: ${propValue.message}.`);
	                    }
	                    // Save data
	                    const data: number[] = [];
	                    data.push(propName.length);
	                    data.push(...propName);
	                    data.push(type);
	                    if (Scheme.SizeDeclaration[type]) {
	                        data.push(...Scheme.LengthConvertor[type](propValue.length));
	                    }
	                    data.push(...propValue);
	                    paket.push(...data);
	                } else if (type instanceof Array) {
	                    if (type.length !== 1) {
	                        throw new Error(`Array declaration should have one (only) type definition. Property: ${propName}.`);
	                    }
	                    if (!(value instanceof Array)) {
	                        throw new Error(`Type of value isn't an array. Property: ${propName}.`);
	                    }
	                    // We have an array
	                    const itemType = this._getPrimitiveType(type[0]);
	                    const items: number[] = [];
	                    const data: number[] = [];
	                    data.push(propName.length);
	                    data.push(...propName);
	                    data.push(Scheme.Types.array);
	                    if (this._isPrimitive(itemType)) {
	                        if ([Scheme.Types.asciiString, Scheme.Types.utf8String].indexOf(itemType) !== -1) {
	                            value.forEach((item: any, index: number) => {
	                                const propValue: number[] | Error = this._encodePrimitive(item, itemType, validation);
	                                if (propValue instanceof Error) {
	                                    throw new Error(`Fail to encode property "${key}" due error: ${propValue.message}. Index in array: ${index}; key: ${key}.`);
	                                }
	                                items.push(...Scheme.LengthConvertor[itemType](propValue.length));
	                                items.push(...propValue);
	                            });
	                        } else {
	                            value.forEach((item: any, index: number) => {
	                                const propValue: number[] | Error = this._encodePrimitive(item, itemType, validation);
	                                if (propValue instanceof Error) {
	                                    throw new Error(`Fail to encode property "${key}" due error: ${propValue.message}. Index in array: ${index}; key: ${key}.`);
	                                }
	                                items.push(...propValue);
	                            });
	                        }
	                        // Save data
	                        data.push(itemType);
	                    } else if (typeof itemType === 'object' && itemType !== null && !(itemType instanceof Array)) {
	                        value.forEach((item: any) => {
	                            const propValue: Uint8Array = this.encode(item, itemType, validation);
	                            items.push(...propValue);
	                        });
	                        data.push(Scheme.Types.object);
	                    } else {
	                        throw new Error(`Incorrect declaration of array type: ${typeof itemType} / ${itemType}; key: ${key}`);
	                    }
	                    data.push(...Impls.Uint32.toUint8(items.length));
	                    data.push(...items);
	                    paket.push(...data);
	                } else {
	                    // Nested
	                    const propValue: Uint8Array = this.encode(target[key], scheme[key], validation);
	                    paket.push(propName.length);
	                    paket.push(...propName);
	                    paket.push(...propValue);
	                }
	            });
	            // Set size
	            paket.unshift(...Impls.Uint32.toUint8(paket.length));
	            // Set type
	            paket.unshift(Scheme.Types.object);
	            // Return value
	            return new Uint8Array(paket);
	        }
	
	        public static decode(target: Uint8Array, maxInteractionsCount = MAX_INTERACTIONS_COUNT): any {
	            const paket: any = {};
	            const type = target[0];
	            if (type !== Scheme.Types.object) {
	                throw new Error(`Expecting type to be object (type = ${Scheme.Types.object}), but type is "${type}"`);
	            }
	            const length = Impls.Uint32.fromUint8(target.slice(1, 5));
	            let buffer = target.slice(5, 5 + length);
	            let counter = 0;
	            do {
	                // Get name of prop
	                const propNameLength: number = buffer[0];
	                const propName: string = Impls.Uint8.toAsciiStr(buffer.slice(1, propNameLength + 1));
	                const propType: number = Impls.Uint8.fromUint8(buffer.slice(propNameLength + 1, propNameLength + 2));
	                const offset: number = propNameLength + 1 + 1;
	                switch (propType) {
	                    case Scheme.Types.object:
	                        const objValueLength = Impls.Uint32.fromUint8(buffer.slice(offset, offset + 4));
	                        const objValueBytes = buffer.slice(offset - 1, offset + 4 + objValueLength);
	                        if (objValueLength > 0) {
	                            paket[propName] = this.decode(objValueBytes);
	                        } else {
	                            paket[propName] = {};
	                        }
	                        buffer = buffer.slice(offset + 4 + objValueLength, buffer.length);
	                        break;
	                    case Scheme.Types.array:
	                        const itemType = Impls.Uint8.fromUint8(buffer.slice(offset, offset + 1));
	                        const arrayLength = Impls.Uint32.fromUint8(buffer.slice(offset + 1, offset + 4 + 1));
	                        let arrayBytes = buffer.slice(offset + 4 + 1, offset + 4 + 1 + arrayLength);
	                        const items: any[] = [];
	                        if (arrayLength > 0) {
	                            if (this._isPrimitive(itemType)) {
	                                if ([Scheme.Types.asciiString, Scheme.Types.utf8String].indexOf(itemType) !== -1) {
	                                    let strLength;
	                                    let strValue;
	                                    do {
	                                        strLength = Impls.Uint32.fromUint8(arrayBytes.slice(0, 4));
	                                        strValue = arrayBytes.slice(4, 4 + strLength);
	                                        switch (itemType) {
	                                            case Scheme.Types.asciiString:
	                                                items.push(Impls.Uint8.toAsciiStr(strValue));
	                                                break;
	                                            case Scheme.Types.utf8String:
	                                                items.push(Impls.Uint8.toUtf8Str(strValue));
	                                                break;
	                                        }
	                                        arrayBytes = arrayBytes.slice(4 + strLength, arrayBytes.length);
	                                    } while (arrayBytes.length > 0);
	                                } else {
	                                    do {
	                                        items.push(Scheme.TypesProviders[itemType].fromUint8(arrayBytes.slice(0, Scheme.TypesSizes[itemType])));
	                                        arrayBytes = arrayBytes.slice(Scheme.TypesSizes[itemType], arrayBytes.length);
	                                    } while (arrayBytes.length > 0);
	                                }
	                            } else if (itemType === Scheme.Types.object) {
	                                let objType;
	                                let objLength;
	                                let objBody;
	                                do {
	                                    objType = Impls.Uint8.fromUint8(arrayBytes.slice(0, 1));
	                                    if (objType !== Scheme.Types.object) {
	                                        throw new Error(`Expecting to have as an item of array object, but found type = ${Scheme.TypesNames[objType]} / ${objType}`);
	                                    }
	                                    objLength = Impls.Uint32.fromUint8(arrayBytes.slice(1, 5));
	                                    objBody = arrayBytes.slice(0, objLength + 5);
	                                    items.push(this.decode(objBody));
	                                    arrayBytes = arrayBytes.slice(5 + objLength, arrayBytes.length);
	                                } while (arrayBytes.length > 0);
	                            }
	                        }
	                        paket[propName] = items;
	                        buffer = buffer.slice(offset + 4 + 1 + arrayLength, buffer.length);
	                        break;
	                    case Scheme.Types.uint8:
	                    case Scheme.Types.uint16:
	                    case Scheme.Types.uint32:
	                    case Scheme.Types.int8:
	                    case Scheme.Types.int16:
	                    case Scheme.Types.int32:
	                    case Scheme.Types.float32:
	                    case Scheme.Types.float64:
	                    case Scheme.Types.boolean:
	                        paket[propName] = Scheme.TypesProviders[propType].fromUint8(buffer.slice(offset, offset + Scheme.TypesSizes[propType]));
	                        buffer = buffer.slice(offset + Scheme.TypesSizes[propType], buffer.length);
	                        break;
	                    case Scheme.Types.asciiString:
	                        const asciiStringLength = Impls.Uint32.fromUint8(buffer.slice(offset, offset + 4));
	                        const asciiStringBytes = buffer.slice(offset + 4, offset + 4 + asciiStringLength);
	                        paket[propName] = Impls.Uint8.toAsciiStr(asciiStringBytes);
	                        buffer = buffer.slice(offset + 4 + asciiStringLength, buffer.length);
	                        break;
	                    case Scheme.Types.utf8String:
	                        const utf8StringLength = Impls.Uint32.fromUint8(buffer.slice(offset, offset + 4));
	                        const utf8StringBytes = buffer.slice(offset + 4, offset + 4 + utf8StringLength);
	                        paket[propName] = Impls.Uint8.toUtf8Str(utf8StringBytes);
	                        buffer = buffer.slice(offset + 4 + utf8StringLength, buffer.length);
	                        break;
	                    default:
	                        throw new Error(`Was detected unknown type of data or some errors during parsing. Found type of data: ${propType}.`);
	                }
	                counter += 1;
	                if (counter >= maxInteractionsCount) {
	                    throw new Error(`Max count of interactions was done. Probably parser works with error because data isn't right.`);
	                }
	            } while (buffer.length > 0);
	            return paket;
	        }
	
	        private static _encodePrimitive(value: any, type: number, validation: boolean): number[] | Error {
	            const encoded: number[] = [];
	            // Get value of property
	            switch (type) {
	                case Scheme.Types.uint8:
	                case Scheme.Types.uint16:
	                case Scheme.Types.uint32:
	                case Scheme.Types.int8:
	                case Scheme.Types.int16:
	                case Scheme.Types.int32:
	                case Scheme.Types.float32:
	                case Scheme.Types.float64:
	                case Scheme.Types.boolean:
	                    if (validation) {
	                        const validationError: Error | undefined = Scheme.TypesProviders[type].validate(value);
	                        if (validationError) {
	                            return new Error(`Invalid value = ${value}. Declared type is: ${Scheme.TypesNames[type]}. Checks finished with error: ${validationError.message}.`);
	                        }
	                    }
	                    encoded.push(...Scheme.TypesProviders[type].toUint8(value));
	                    break;
	                case Scheme.Types.asciiString:
	                    encoded.push(...Impls.Uint8.fromAsciiStr(value));
	                    break;
	                case Scheme.Types.utf8String:
	                    encoded.push(...Impls.Uint8.fromUtf8Str(value));
	                    break;
	            }
	            return encoded;
	        }
	
	        private static _isPrimitive(type: number): boolean {
	            switch (type) {
	                case Scheme.Types.uint8:
	                case Scheme.Types.uint16:
	                case Scheme.Types.uint32:
	                case Scheme.Types.int8:
	                case Scheme.Types.int16:
	                case Scheme.Types.int32:
	                case Scheme.Types.float32:
	                case Scheme.Types.float64:
	                case Scheme.Types.boolean:
	                case Scheme.Types.asciiString:
	                case Scheme.Types.utf8String:
	                    return true;
	                default:
	                    return false;
	            }
	        }
	
	        private static _getPrimitiveType(type: any): any {
	            if (typeof type === 'number') {
	                return type;
	            } else if (typeof type === 'string') {
	                return (Scheme.Types as any)[type];
	            } else {
	                return type;
	            }
	        }
	    }
	}
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: injection.types.primitive.ts
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	export interface IPrimitiveType<T> {
	    tsType: string;
	    binaryType: string;
	    init: string;
	    parse: (value: string | number | T) => T;
	    serialize: (value: T) => string | number | boolean | T;
	    validate: (value: string | number | T) => boolean;
	    implementation?: () => {};
	}
	
	export const PrimitiveTypes:  { [key: string]: IPrimitiveType<any> } = {
	
	    uint8     : {
	        binaryType  : 'uint8',
	        init        : '0',
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
	            if (value < 0) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    uint16     : {
	        binaryType  : 'uint16',
	        init        : '0',
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
	            if (value < 0) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    uint32     : {
	        binaryType  : 'uint32',
	        init        : '0',
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
	            if (value < 0) {
	                return false;
	            }
	            return true;
	        },
	    } as IPrimitiveType<number>,
	
	    int8     : {
	        binaryType  : 'int8',
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
	
	    int16     : {
	        binaryType  : 'int16',
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
	
	    int32     : {
	        binaryType  : 'int32',
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
	
	    float32     : {
	        binaryType  : 'float32',
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
	
	    float64     : {
	        binaryType  : 'float64',
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
	
	    asciiString     : {
	        binaryType  : 'asciiString',
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
	
	    utf8String     : {
	        binaryType  : 'utf8String',
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
	
	    string      : {
	        binaryType  : 'utf8String',
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
	        binaryType  : 'int32',
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
	        binaryType  : 'float64',
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
	        binaryType  : 'boolean',
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
	        binaryType  : 'float64',
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
	        binaryType  : 'asciiString',
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
	* Injection: map of references
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export let ConvertedTypedEntitiesMap: {[key: string]: any} = {};
	export let ReferencesMap: {[key: string]: any} = {};
	export function init(){
		ReferencesMap["3661859"] = Requests.GetUsersInChannel;
		ReferencesMap["D7E6E2"] = Events;
		ReferencesMap["4C177D37"] = Events.NewMessage;
		ReferencesMap["3083FE77"] = Events.RemovedMessage;
		ReferencesMap["527E5577"] = Requests;
		ReferencesMap["4EFB1ABF"] = Requests.GetChannels;
		ReferencesMap["6482822D"] = Responses;
		ReferencesMap["54A4AAC4"] = Responses.ChannelUsersList;
		ReferencesMap["4B5A7131"] = Responses.ChannelsList;
		ReferencesMap["71D3EB56"] = ChatMessage;
		ReferencesMap["3B609EF0"] = User;
		ReferencesMap["63F2459E"] = Channel;
		ReferencesMap["7935BB2A"] = Request;
		ReferencesMap["4F56A0FA"] = Response;
		ConvertedTypedEntitiesMap = convertTypesToStandard(TypedEntitiesMap);
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	* Injection: protocol signature
	* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	export function getSignature() {
		return "5E8183B8";
	}

}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Primitive type injections
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function guid() {
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
        }

export class Events extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
		}
	}
	public static __signature: string = "D7E6E2";
	public static getSignature(): string {
		return Events.__signature;
	}
	public __signature: string = Events.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	public static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, Events);
	}
	public stringify(): Protocol.TStringifyOutput | Error {
		return Protocol.stringify(this, Events);
	}
	public static instanceOf(target: any): boolean {
		return Protocol.isInstanceOf(Events.__signature, target);
	}

	constructor() {
		super();

	}
}
export namespace Events {
	export class NewMessage extends Events {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				channelId: { name: "channelId", value: "int16", type: Protocol.EEntityType.primitive, optional: false }, 
				message: { name: "message", value: ChatMessage, type: Protocol.EEntityType.reference, optional: false }, 
			}
		}
		public static __signature: string = "4C177D37";
		public static getSignature(): string {
			return NewMessage.__signature;
		}
		public __signature: string = NewMessage.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		public static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, NewMessage);
		}
		public stringify(): Protocol.TStringifyOutput | Error {
			return Protocol.stringify(this, NewMessage);
		}
		public static instanceOf(target: any): boolean {
			return Protocol.isInstanceOf(NewMessage.__signature, target);
		}
		public channelId: number = -1;
		public message: ChatMessage;

		constructor(args: { channelId: number, message: ChatMessage }) {
			super();
			this.channelId = args.channelId;
			this.message = args.message;
			const errors: Error[] = Protocol.validateParams(args, NewMessage);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "NewMessage" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export class RemovedMessage extends Events {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				channelId: { name: "channelId", value: "int16", type: Protocol.EEntityType.primitive, optional: false }, 
				messageId: { name: "messageId", value: "int16", type: Protocol.EEntityType.primitive, optional: false }, 
			}
		}
		public static __signature: string = "3083FE77";
		public static getSignature(): string {
			return RemovedMessage.__signature;
		}
		public __signature: string = RemovedMessage.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		public static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, RemovedMessage);
		}
		public stringify(): Protocol.TStringifyOutput | Error {
			return Protocol.stringify(this, RemovedMessage);
		}
		public static instanceOf(target: any): boolean {
			return Protocol.isInstanceOf(RemovedMessage.__signature, target);
		}
		public channelId: number = -1;
		public messageId: number = -1;

		constructor(args: { channelId: number, messageId: number }) {
			super();
			this.channelId = args.channelId;
			this.messageId = args.messageId;
			const errors: Error[] = Protocol.validateParams(args, RemovedMessage);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "RemovedMessage" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
}
export class Requests extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
		}
	}
	public static __signature: string = "527E5577";
	public static getSignature(): string {
		return Requests.__signature;
	}
	public __signature: string = Requests.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	public static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, Requests);
	}
	public stringify(): Protocol.TStringifyOutput | Error {
		return Protocol.stringify(this, Requests);
	}
	public static instanceOf(target: any): boolean {
		return Protocol.isInstanceOf(Requests.__signature, target);
	}

	constructor() {
		super();

	}
}
export namespace Requests {
	export class GetUsersInChannel extends Requests {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				channelId: { name: "channelId", value: "int16", type: Protocol.EEntityType.primitive, optional: false }, 
			}
		}
		public static __signature: string = "3661859";
		public static getSignature(): string {
			return GetUsersInChannel.__signature;
		}
		public __signature: string = GetUsersInChannel.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		public static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, GetUsersInChannel);
		}
		public stringify(): Protocol.TStringifyOutput | Error {
			return Protocol.stringify(this, GetUsersInChannel);
		}
		public static instanceOf(target: any): boolean {
			return Protocol.isInstanceOf(GetUsersInChannel.__signature, target);
		}
		public channelId: number = -1;

		constructor(args: { channelId: number }) {
			super();
			this.channelId = args.channelId;
			const errors: Error[] = Protocol.validateParams(args, GetUsersInChannel);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "GetUsersInChannel" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export class GetChannels extends Requests {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
			}
		}
		public static __signature: string = "4EFB1ABF";
		public static getSignature(): string {
			return GetChannels.__signature;
		}
		public __signature: string = GetChannels.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		public static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, GetChannels);
		}
		public stringify(): Protocol.TStringifyOutput | Error {
			return Protocol.stringify(this, GetChannels);
		}
		public static instanceOf(target: any): boolean {
			return Protocol.isInstanceOf(GetChannels.__signature, target);
		}

		constructor() {
			super();

		}
	}
}
export class Responses extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
		}
	}
	public static __signature: string = "6482822D";
	public static getSignature(): string {
		return Responses.__signature;
	}
	public __signature: string = Responses.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	public static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, Responses);
	}
	public stringify(): Protocol.TStringifyOutput | Error {
		return Protocol.stringify(this, Responses);
	}
	public static instanceOf(target: any): boolean {
		return Protocol.isInstanceOf(Responses.__signature, target);
	}

	constructor() {
		super();

	}
}
export namespace Responses {
	export class ChannelUsersList extends Responses {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				channelId: { name: "channelId", value: "int16", type: Protocol.EEntityType.primitive, optional: false }, 
				users: { name: "users", value: User, type: Protocol.EEntityType.repeated, optional: false }, 
			}
		}
		public static __signature: string = "54A4AAC4";
		public static getSignature(): string {
			return ChannelUsersList.__signature;
		}
		public __signature: string = ChannelUsersList.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		public static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, ChannelUsersList);
		}
		public stringify(): Protocol.TStringifyOutput | Error {
			return Protocol.stringify(this, ChannelUsersList);
		}
		public static instanceOf(target: any): boolean {
			return Protocol.isInstanceOf(ChannelUsersList.__signature, target);
		}
		public channelId: number = -1;
		public users: Array<User> = [];

		constructor(args: { channelId: number, users: Array<User> }) {
			super();
			this.channelId = args.channelId;
			this.users = args.users;
			const errors: Error[] = Protocol.validateParams(args, ChannelUsersList);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "ChannelUsersList" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
	export class ChannelsList extends Responses {
		static getDescription(): {[key: string]: Protocol.IProperty } {
			return {
				channels: { name: "channels", value: Channel, type: Protocol.EEntityType.repeated, optional: false }, 
			}
		}
		public static __signature: string = "4B5A7131";
		public static getSignature(): string {
			return ChannelsList.__signature;
		}
		public __signature: string = ChannelsList.__signature;
		public getSignature(): string {
			return this.__signature;
		}
		public static parse(str: string | object): Protocol.TTypes | Error {
			return Protocol.parse(str, ChannelsList);
		}
		public stringify(): Protocol.TStringifyOutput | Error {
			return Protocol.stringify(this, ChannelsList);
		}
		public static instanceOf(target: any): boolean {
			return Protocol.isInstanceOf(ChannelsList.__signature, target);
		}
		public channels: Array<Channel> = [];

		constructor(args: { channels: Array<Channel> }) {
			super();
			this.channels = args.channels;
			const errors: Error[] = Protocol.validateParams(args, ChannelsList);
			if (errors.length > 0) {
				throw new Error(`Cannot create class of "ChannelsList" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
			}

		}
	}
}
export class ChatMessage extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			id: { name: "id", value: "int16", type: Protocol.EEntityType.primitive, optional: false }, 
			channelId: { name: "channelId", value: "int16", type: Protocol.EEntityType.primitive, optional: false }, 
			nickname: { name: "nickname", value: "asciiString", type: Protocol.EEntityType.primitive, optional: false }, 
			message: { name: "message", value: "utf8String", type: Protocol.EEntityType.primitive, optional: false }, 
			created: { name: "created", value: "datetime", type: Protocol.EEntityType.primitive, optional: false }, 
		}
	}
	public static __signature: string = "71D3EB56";
	public static getSignature(): string {
		return ChatMessage.__signature;
	}
	public __signature: string = ChatMessage.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	public static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, ChatMessage);
	}
	public stringify(): Protocol.TStringifyOutput | Error {
		return Protocol.stringify(this, ChatMessage);
	}
	public static instanceOf(target: any): boolean {
		return Protocol.isInstanceOf(ChatMessage.__signature, target);
	}
	public id: number = -1;
	public channelId: number = -1;
	public nickname: string = "";
	public message: string = "";
	public created: Date = new Date();

	constructor(args: { id: number, channelId: number, nickname: string, message: string, created: Date }) {
		super();
		this.id = args.id;
		this.channelId = args.channelId;
		this.nickname = args.nickname;
		this.message = args.message;
		this.created = args.created;
		const errors: Error[] = Protocol.validateParams(args, ChatMessage);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "ChatMessage" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export class User extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			nickname: { name: "nickname", value: "asciiString", type: Protocol.EEntityType.primitive, optional: false }, 
			firstName: { name: "firstName", value: "utf8String", type: Protocol.EEntityType.primitive, optional: false }, 
			lastName: { name: "lastName", value: "utf8String", type: Protocol.EEntityType.primitive, optional: false }, 
		}
	}
	public static __signature: string = "3B609EF0";
	public static getSignature(): string {
		return User.__signature;
	}
	public __signature: string = User.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	public static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, User);
	}
	public stringify(): Protocol.TStringifyOutput | Error {
		return Protocol.stringify(this, User);
	}
	public static instanceOf(target: any): boolean {
		return Protocol.isInstanceOf(User.__signature, target);
	}
	public nickname: string = "";
	public firstName: string = "";
	public lastName: string = "";

	constructor(args: { nickname: string, firstName: string, lastName: string }) {
		super();
		this.nickname = args.nickname;
		this.firstName = args.firstName;
		this.lastName = args.lastName;
		const errors: Error[] = Protocol.validateParams(args, User);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "User" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export class Channel extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
			name: { name: "name", value: "utf8String", type: Protocol.EEntityType.primitive, optional: false }, 
			created: { name: "created", value: "datetime", type: Protocol.EEntityType.primitive, optional: false }, 
		}
	}
	public static __signature: string = "63F2459E";
	public static getSignature(): string {
		return Channel.__signature;
	}
	public __signature: string = Channel.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	public static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, Channel);
	}
	public stringify(): Protocol.TStringifyOutput | Error {
		return Protocol.stringify(this, Channel);
	}
	public static instanceOf(target: any): boolean {
		return Protocol.isInstanceOf(Channel.__signature, target);
	}
	public name: string = "";
	public created: Date = new Date();

	constructor(args: { name: string, created: Date }) {
		super();
		this.name = args.name;
		this.created = args.created;
		const errors: Error[] = Protocol.validateParams(args, Channel);
		if (errors.length > 0) {
			throw new Error(`Cannot create class of "Channel" due error(s):\n${errors.map((error: Error) => { return `\t- ${error.message}`; }).join('\n')}`);
		}

	}
}
export class Request extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
		}
	}
	public static __signature: string = "7935BB2A";
	public static getSignature(): string {
		return Request.__signature;
	}
	public __signature: string = Request.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	public static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, Request);
	}
	public stringify(): Protocol.TStringifyOutput | Error {
		return Protocol.stringify(this, Request);
	}
	public static instanceOf(target: any): boolean {
		return Protocol.isInstanceOf(Request.__signature, target);
	}

	constructor() {
		super();

	}
}
export class Response extends Protocol.Root {
	static getDescription(): {[key: string]: Protocol.IProperty } {
		return {
		}
	}
	public static __signature: string = "4F56A0FA";
	public static getSignature(): string {
		return Response.__signature;
	}
	public __signature: string = Response.__signature;
	public getSignature(): string {
		return this.__signature;
	}
	public static parse(str: string | object): Protocol.TTypes | Error {
		return Protocol.parse(str, Response);
	}
	public stringify(): Protocol.TStringifyOutput | Error {
		return Protocol.stringify(this, Response);
	}
	public static instanceOf(target: any): boolean {
		return Protocol.isInstanceOf(Response.__signature, target);
	}

	constructor() {
		super();

	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Injection: export from Protocol namespace
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export type TProtocolTypes = Protocol.TTypes;
export const parse = Protocol.parse;
export const parseFrom = Protocol.parseFrom;
export const stringify = Protocol.stringify;
export const join = Protocol.Packager.join;
export const split = Protocol.Packager.split;
export const isPackage = Protocol.Packager.isPackage;
export const getSignature = Protocol.getSignature;
export interface IClass { getSignature: () => string; parse: (str: string | object) => any; }
export interface IImplementation { getSignature: () => string; stringify: () => Protocol.TStringifyOutput | Error; }
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Injection: initialization
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
Protocol.init();
