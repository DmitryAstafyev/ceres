/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />
//./node_modules/.bin/jasmine-ts src/something.spec.ts

import { HTTPLongpoll } from '../src/transports/index';
import { throws } from 'assert';
import Logger from '../src/platform/tools/tools.logger';


describe('[Test][Server <-> Client][longpoll]', () => {
    it('[Basic communication]', (done: Function)=>{
        const logger = new Logger('Test: longpoll');

        logger.debug('Create server');
        const connection = new HTTPLongpoll.ConnectionParameters({});
        const server = new HTTPLongpoll.Server(connection);
        expect(connection instanceof HTTPLongpoll.ConnectionParameters).toBe(true);
        expect(server instanceof HTTPLongpoll.Server).toBe(true);
        server.destroy()
        .then(()=>{
            logger.debug('Destroy server');
            done();
        })
        .catch((error)=>{
            throw error;
        });
    });

});