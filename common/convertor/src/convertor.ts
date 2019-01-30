// tslint:disable:object-literal-sort-keys
// tslint:disable:max-classes-per-file
// tslint:disable:no-namespace

import * as Scheme from './convertor.scheme';
import * as Impls from './types/index';

const MAX_INTERACTIONS_COUNT = 1000;

class Convertor {

    public static encode(target: any, scheme: any, validation: boolean = true): Uint8Array {
        const paket: number[] = [];
        Object.keys(target).forEach((key: string) => {
            const type = scheme[key];
            const value = target[key];
            const propName: Uint8Array = Impls.Uint8.fromAsciiStr(key);
            if (type === null || type === undefined) {
                throw new Error(`Incorrect type provided in scheme: ${typeof type}.`);
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
                const itemType = type[0];
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
                                throw new Error(`Fail to encode property "${key}" due error: ${propValue.message}. Index in array: ${index}.`);
                            }
                            items.push(...Scheme.LengthConvertor[itemType](propValue.length));
                            items.push(...propValue);
                        });
                    } else {
                        value.forEach((item: any, index: number) => {
                            const propValue: number[] | Error = this._encodePrimitive(item, itemType, validation);
                            if (propValue instanceof Error) {
                                throw new Error(`Fail to encode property "${key}" due error: ${propValue.message}. Index in array: ${index}.`);
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
                    throw new Error(`Incorrect declaration of array type: ${typeof itemType}`);
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
                    paket[propName] = this.decode(objValueBytes);
                    buffer = buffer.slice(offset + 4 + objValueLength, buffer.length);
                    break;
                case Scheme.Types.array:
                    const itemType = Impls.Uint8.fromUint8(buffer.slice(offset, offset + 1));
                    const arrayLength = Impls.Uint32.fromUint8(buffer.slice(offset + 1, offset + 4 + 1));
                    let arrayBytes = buffer.slice(offset + 4 + 1, offset + 4 + 1 + arrayLength);
                    const items: any[] = [];
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
}

export { Scheme, Impls, Convertor };
