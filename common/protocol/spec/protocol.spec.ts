/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />

//./node_modules/.bin/jasmine-ts src/something.spec.ts

import Logger from '../../platform/tools/tools.logger';
import { Builder, Reader, Convertor } from '../src/index';
import { AdvancedTypes } from './example/test.advanced.types';
import * as FS from 'fs';

const TEST_SOURCE_PROTOCOL_FILE = './spec/example/protocol.json';
const TEST_DEST_PROTOCOL_FILE = './spec/example/example.ts';
const TEST_DEST_PROTOCOL_MODULE_REF = './example/example.ts';

describe('[Test][platform][protocol]', () => {

    it('[Reader]', (done: Function)=>{
        const logger = new Logger('Test: Reader');
        const reader: Reader = new Reader();
        return reader.read(TEST_SOURCE_PROTOCOL_FILE)
            .then((json: any) => {
                expect(typeof json).toBe('object');
                expect(typeof json.Message).toBe('object');
                expect(typeof json.State).toBe('object');
                expect(typeof json.Data).toBe('object');
                expect(typeof json.EventDefinition).toBe('object');
                expect(typeof json.Subscription).toBe('object');
                expect(typeof json.ConnectionError).toBe('object');
                expect(typeof json.Disconnect).toBe('object');
                return done();
            }).catch((e)=>{
                logger.error(e.message);
                fail(e);
                return done();
            });
    });

    it('[Convertor]', (done: Function)=>{
        const logger = new Logger('Test: Reader');
        const reader: Reader = new Reader();
        return reader.read(TEST_SOURCE_PROTOCOL_FILE)
            .then((json: any) => {
                const convertor: Convertor = new Convertor();
                convertor.convert(json, [], {
                    implementation: AdvancedTypes,
                    path: '../spec/example/test.advanced.types.ts'
                }).then((protocol: string) => {
                    expect(typeof protocol).toBe('string');
                    return done();
                }).catch((e: Error) => {
                    logger.error(e.message);
                    fail(e);
                    return done();
                });
            }).catch((e)=>{
                logger.error(e.message);
                fail(e);
                return done();
            });
    });

    it('[Builder]', (done: Function)=>{
        const logger = new Logger('Test: Reader');
        const reader: Reader = new Reader();
        return reader.read(TEST_SOURCE_PROTOCOL_FILE)
            .then((json: any) => {
                const convertor: Convertor = new Convertor();
                convertor.convert(json, [], {
                    implementation: AdvancedTypes,
                    path: '../spec/example/test.advanced.types.ts'
                }).then((protocol: string) => {
                    const builder: Builder = new Builder();
                    builder.write(TEST_DEST_PROTOCOL_FILE, protocol, true).then(() => {
                        return done();
                    }).catch((e: Error) => {
                        logger.error(e.message);
                        fail(e);
                        return done();
                    });                    
                }).catch((e: Error) => {
                    logger.error(e.message);
                    fail(e);
                    return done();
                });
            }).catch((e)=>{
                logger.error(e.message);
                fail(e);
                return done();
            });
    });
    

    

    

    
});
