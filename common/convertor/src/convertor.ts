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
            if (typeof type !== 'object') {
                // Primitives
                const propValue: number[] = [];
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
                                throw new Error(`Property "${key}" has invalid value = ${value}. Declared type is: ${Scheme.TypesNames[type]}. Checks finished with error: ${validationError.message}.`);
                            }
                        }
                        propValue.push(...Scheme.TypesProviders[type].toUint8(value));
                        break;
                    case Scheme.Types.asciiString:
                        propValue.push(...Impls.Uint8.fromAsciiStr(value));
                        break;
                    case Scheme.Types.utf8String:
                        propValue.push(...Impls.Uint8.fromUtf8Str(value));
                        break;
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

}

const EXAMPLE = {
    a: 100,
    b: 200,
    a1: 10000,
    b1: 20000,
    nested: {
        a2: 10000,
        b2: 20000,
    },
    name: 'this is name (ascii)',
    a3: 12000,
    b3: 22000,
    int: {
        int8: -30,
        int16: -30000,
        int32: -3000000,
    },
    float32: 1e-3,
    float64: 0.0001,
    bool1: true,
    bool2: false,
    utf8: `Это проверка UTF8 строки\nЭто проверка UTF8 строки\nЭто проверка UTF8 строки\nЭто проверка UTF8 строки`,
};

const EXAMPLE_SCHEME = {
    a: Scheme.Types.uint8,
    b: Scheme.Types.uint8,
    a1: Scheme.Types.uint16,
    b1: Scheme.Types.uint16,
    nested: {
        a2: Scheme.Types.uint16,
        b2: Scheme.Types.uint16,
    },
    name: Scheme.Types.asciiString,
    a3: Scheme.Types.uint16,
    b3: Scheme.Types.uint16,
    int: {
        int8: Scheme.Types.int8,
        int16: Scheme.Types.int16,
        int32: Scheme.Types.int32,
    },
    float32: Scheme.Types.float32,
    float64: Scheme.Types.float64,
    bool1: Scheme.Types.boolean,
    bool2: Scheme.Types.boolean,
    utf8: Scheme.Types.utf8String,
};

const converted = Convertor.encode(EXAMPLE, EXAMPLE_SCHEME);
const json = JSON.stringify(EXAMPLE);
console.log(`Converted: ${converted.join(' ')} / size: ${converted.length}`);
console.log(`JSON: ${json.length} / ${Impls.Uint8.fromUtf8Str(json).length}`);

const decoded = Convertor.decode(converted);
console.log(decoded);
