declare var ReferencesMap: {[key: string]: any};
declare var PrimitiveTypes: {[key: string]: any};
declare var AdvancedTypes: {[key: string]: any};
declare type TTypes = any;

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
                    if (!(params[prop] instanceof desc.value)) {
                        errors.push(new Error(`Expecting property "${prop}" will be instance of "${desc.value.name}".`));
                    }
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