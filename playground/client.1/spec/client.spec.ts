/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
//./node_modules/.bin/jasmine-ts src/something.spec.ts
jasmine.DEFAULT_TIMEOUT_INTERVAL = 900000;

import Test from '../src/test.http.longpoll';

describe('[client]', () => {
    it('[Basic functionlity]', (done: Function)=>{
        const test = new Test();
        //done();
    });

});