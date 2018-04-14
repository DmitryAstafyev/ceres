/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />

//./node_modules/.bin/jasmine-ts src/something.spec.ts

import Logger from '../../platform/tools/tools.logger';
import { Builder, Reader, IReaderResult, ProtocolJSONConvertor } from '../src/index';
import * as FS from 'fs';

const TEST_SOURCE_PROTOCOL_FILE = './spec/example/protocol.json';
const TEST_DEST_PROTOCOL_FILE = './spec/example/example.ts';

describe('[Test][platform][protocol]', () => {
    it('[Reader]', (done: Function)=>{
        const logger = new Logger('Test: Reader');
        const reader: Reader = new Reader(TEST_SOURCE_PROTOCOL_FILE);
        reader.read()
            .then((results: IReaderResult) => {
                expect(typeof results).toBe('object');
                expect(typeof results.body).toBe('object');
                expect(typeof results.className).toBe('string');
                expect(typeof results.json).toBe('object');
                expect(typeof results.body.default).toBe('object');
                expect(typeof results.body.definitions).toBe('object');
                expect(typeof results.json.Message).toBe('object');
                expect(typeof results.json.Message.default).toBe('object');
                expect(typeof results.json.Message.definitions).toBe('object');
                expect(typeof results.json.Message.default.event).toBe('object');
                expect(typeof results.json.Message.default.request).toBe('object');
                expect(typeof results.json.Message.definitions.Event).toBe('object');
                expect(typeof results.json.Message.definitions.Request).toBe('object');
                expect(typeof results.json.Message.definitions.Event.cases).toBe('object');
                expect(typeof results.json.Message.definitions.Request.cases).toBe('object');
                done();
            }).catch((e)=>{
                expect(e).toBeNull();
                done();
            });
    });
    it('[Convertor]', (done: Function)=>{
        const logger = new Logger('Test: Convertor');
        const reader: Reader = new Reader(TEST_SOURCE_PROTOCOL_FILE);
        reader.read()
            .then((results: IReaderResult) => {
                const convertor: ProtocolJSONConvertor = new ProtocolJSONConvertor(results.json);
                const classStr = convertor.getImplementation();
                expect(typeof classStr).toBe('string');
                expect(classStr.length).toBeGreaterThan(0);
                done();
            }).catch((e)=>{
                expect(e).toBeNull();
                done();
            });
    });
    it('[Builder]', (done: Function)=>{
        const logger = new Logger('Test: Builder');
        const builder: Builder = new Builder(TEST_SOURCE_PROTOCOL_FILE);
        builder.build(TEST_DEST_PROTOCOL_FILE, true)
            .then(() => {
                expect(FS.existsSync(TEST_DEST_PROTOCOL_FILE)).toBe(true);
                done();
            }).catch((e)=>{
                expect(e).toBeNull();
                done();
            });
    });

});