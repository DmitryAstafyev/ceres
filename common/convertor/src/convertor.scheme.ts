// tslint:disable:ordered-imports
// tslint:disable:object-literal-sort-keys

import * as Impls from './types/index';

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
    [Types.boolean]: Impls.TBoolean,
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
