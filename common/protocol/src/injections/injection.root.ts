// tslint:disable:max-classes-per-file

declare var ReferencesMap: {[key: string]: any};
declare var PrimitiveTypes: {[key: string]: any};
declare var AdvancedTypes: {[key: string]: any};
declare var KeysMapLeft: {[key: string]: any};
declare var KeysMapRight: {[key: string]: any};
declare var TypedEntitiesMap: {[key: string]: any};
declare var ConvertedTypedEntitiesMap: {[key: string]: any};
declare var ConvertedTypedEntitiesMinMap: {[key: string]: any};
declare var Json: any;

declare type TTypes = any;

export type TIncomeData = string | object | ArrayBuffer | number[] | Uint8Array;

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

export function stringify(target: any, classRef: any): string | Uint8Array | Error {
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

export class Root {

}
