// tslint:disable:ban-types
// tslint:disable:object-literal-sort-keys

/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />

import { Convertor, Scheme } from '../src/convertor';

const EXAMPLE = {
    arr0: [1, 2, 3, 4, 5, 6, 7, 8],
    arrSa: ['1', '2', '3', '4', '5'],
    arrSutf8: ['1фффф', '2фффф', '3фффф', '4фффф', '5фффф'],
    arrObj: [{ int8: 100, int16: 10000, int32: 1000000 }, { int8: 101, int16: 10001, int32: 1000001 }, { int8: 102, int16: 10002, int32: 1000002 }],
    arrObj1: [ { str1: 'test1', str2: 'test2' }, { str1: 'test3', str2: 'test4' }, { str1: 'test5', str2: 'test6' }],
    nestedArrObj: [ { bool: true, obj: { a: 1000, b: 2000 } }, { bool: false, obj: { a: 3000, b: 4000 } }],
    a: 100,
    b: 200,
    a1: 10000,
    b1: 20000,
    nested: {
        a2: 10000,
        b2: 20000,
        arr1: [-1000, -2000, -3000, -4000, -5000],
    },
    name: 'this is name (ascii)',
    a3: 12000,
    b3: 22000,
    int: {
        int8: -30,
        int16: -30000,
        int32: -3000000,
    },
    str: {
        str1: {
            arrStr: ['1', '2', '3', '4', '5'],
        },
    },
    float32: 1e-3,
    float64: 0.0001,
    bool1: true,
    bool2: false,
    utf8: `Это проверка UTF8 строки\nЭто проверка UTF8 строки\nЭто проверка UTF8 строки\nЭто проверка UTF8 строки`,
};

const EXAMPLE_SCHEME = {
    arr0: [Scheme.Types.uint8],
    arrSa: [Scheme.Types.asciiString],
    arrSutf8: [Scheme.Types.utf8String],
    arrObj: [{
        int8: Scheme.Types.int8,
        int16: Scheme.Types.int16,
        int32: Scheme.Types.int32,
    }],
    arrObj1: [{
        str1: Scheme.Types.asciiString,
        str2: Scheme.Types.asciiString,
    }],
    nestedArrObj: [{
        bool: Scheme.Types.boolean,
        obj: {
            a: Scheme.Types.int16,
            b: Scheme.Types.int16,
        },
    }],
    a: Scheme.Types.uint8,
    b: Scheme.Types.uint8,
    a1: Scheme.Types.uint16,
    b1: Scheme.Types.uint16,
    nested: {
        a2: Scheme.Types.uint16,
        b2: Scheme.Types.uint16,
        arr1: [Scheme.Types.int16],
    },
    name: Scheme.Types.asciiString,
    a3: Scheme.Types.uint16,
    b3: Scheme.Types.uint16,
    int: {
        int8: Scheme.Types.int8,
        int16: Scheme.Types.int16,
        int32: Scheme.Types.int32,
    },
    str: {
        str1: {
            arrStr: [Scheme.Types.asciiString],
        },
    },
    float32: Scheme.Types.float32,
    float64: Scheme.Types.float64,
    bool1: Scheme.Types.boolean,
    bool2: Scheme.Types.boolean,
    utf8: Scheme.Types.utf8String,
};

describe('[Test][platform][convertor]', () => {

    it('[Converting]', (done: Function) => {
        const converted = Convertor.encode(EXAMPLE, EXAMPLE_SCHEME);
        expect(converted instanceof Uint8Array).toBe(true);
        const decoded = Convertor.decode(converted);
        expect(typeof decoded).toBe('object');
        Object.keys(EXAMPLE).forEach((key: string) => {
            expect((typeof (decoded as any)[key]) === (typeof (EXAMPLE as any)[key])).toBe(true);
            if ((EXAMPLE as any)[key] instanceof Array) {
                expect((EXAMPLE as any)[key].length === (decoded as any)[key].length).toBe(true);
                (EXAMPLE as any)[key].forEach((item: any, index: number) => {
                    if (typeof item !== 'object') {
                        expect(item === (decoded as any)[key][index]).toBe(true);
                    }
                });
            }
        });
        done();
    });

});
