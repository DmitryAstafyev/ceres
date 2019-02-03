// tslint:disable

/// <reference path="../../node_modules/@types/jasmine/index.d.ts" />
/// <reference path="../../node_modules/@types/node/index.d.ts" />

//./node_modules/.bin/jasmine-ts src/something.spec.ts

import Logger from '../../platform/tools/tools.logger';
import { Builder, Reader, Convertor } from '../src/index';
import { AdvancedTypes } from './example/test.advanced.types';

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

    it('[Writer]', (done: Function)=>{
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

    it('[Usage]', (done: Function)=>{
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
                        import(TEST_DEST_PROTOCOL_MODULE_REF).then((proto: any) => {
                            try {
                                const HandshakeResponse: any = new proto.Message.Handshake.Response({
                                    clientId: 'xxx-xxx-xxxx',
                                    allowed: true,
                                    reason: proto.Message.Handshake.Response.Reasons.NO_TOKEN_FOUND
                                });
                                expect(HandshakeResponse instanceof proto.Message.Handshake.Response).toBe(true);
                                console.log(`HandshakeResponse created.`);
                                const DataWriteRequest: any = new proto.Data.Write.Request({
                                    clientId: 'xxx-xxx-xxxx',
                                    binary: [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]
                                });
                                expect(DataWriteRequest instanceof proto.Data.Write.Request).toBe(true);
                                console.log(`DataWriteRequest created.`);
                                let strDataWriteRequest: string | Uint8Array= DataWriteRequest.stringify();
                                expect(strDataWriteRequest instanceof Uint8Array).toBe(true);
                                console.log(`DataWriteRequest converted to Uint8Array; length = ${strDataWriteRequest.length}.`);
                                let parsedDataWriteRequest: any = proto.Data.Write.Request.parse(strDataWriteRequest);
                                if (parsedDataWriteRequest instanceof Array) {
                                    parsedDataWriteRequest.forEach((error: Error) => {
                                        console.error(error.message);
                                    });
                                }
                                expect(parsedDataWriteRequest instanceof proto.Data.Write.Request).toBe(true);
                                console.log(`DataWriteRequest created from Uint8Array.`);
                                const binaryData = new proto.BinaryData({
                                    bytes: Array.from(new Uint8Array([0,1,2,3,4])),
                                    sequence: 100
                                });
                                const binaryDataConv = binaryData.stringify();
                                expect(binaryDataConv instanceof Uint8Array).toBe(true);
                                const binaryDataParsed = proto.parse(binaryDataConv);
                                expect(binaryDataParsed instanceof proto.BinaryData).toBe(true);

                                const aliases = [
                                    new proto.KeyValue({ key: 'one', value: 'one-value'}),
                                    new proto.KeyValue({ key: 'two', value: 'two-value'}),
                                    new proto.KeyValue({ key: 'three', value: 'three-value'}),
                                ];
                                const eventInst = new proto.Message.Event.Request({
                                    clientId: '1234',
                                    event: new proto.EventDefinition({
                                        protocol: "protocol-name",
                                        event: "event-name",
                                        body: "body-content",
                                    }),
                                    aliases: aliases,
                                    options: new proto.Message.Event.Options({
                                        scope: 'hosts'
                                    })
                                });
                                const eventConv = eventInst.stringify();
                                console.log(`proto.Message.Event.Request converted to Uint8Array; length = ${eventConv.length}.`);
                                const eventParsed = proto.parse(eventConv);
                                expect(eventParsed instanceof proto.Message.Event.Request).toBe(true);

                                console.log(`Production mode is ok. Checking debug mode`);
                                
                                proto.Protocol.state.debug(true);
                                strDataWriteRequest = DataWriteRequest.stringify();
                                expect(typeof strDataWriteRequest).toBe('string');
                                console.log(`[DEBUG]: DataWriteRequest converted to string; length = ${strDataWriteRequest.length}`);
                                parsedDataWriteRequest = proto.Data.Write.Request.parse(strDataWriteRequest);
                                if (parsedDataWriteRequest instanceof Array) {
                                    parsedDataWriteRequest.forEach((error: Error) => {
                                        console.error(error.message);
                                    });
                                }
                                expect(parsedDataWriteRequest instanceof proto.Data.Write.Request).toBe(true);
                                console.log(`[DEBUG]: DataWriteRequest created from string.`);
                                console.log(`Debug mode is ok.`);

                                const DataWriteResponse: any = new proto.Data.Write.Response({
                                    clientId: 'xxx-xxx-xxxx',
                                    status: new proto.Data.Write.Status({
                                        bytes: 100,
                                        started: new Date(),
                                        finished: new Date()
                                    })
                                });
                                expect(DataWriteResponse instanceof proto.Data.Write.Response).toBe(true);
                                console.log(`DataWriteResponse created.`);
                                return done();
                            } catch(e) {
                                logger.error(e.message);
                                fail(e);
                                return done();
                            }
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
