/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
//./node_modules/.bin/jasmine-ts src/something.spec.ts
jasmine.DEFAULT_TIMEOUT_INTERVAL = 900000;

import Test from '../src/test.http.longpoll';
import { TTestHandler, TTestStates, EClientTests } from '../../client.common/client.tests.desc';

class ResultController {

    private confirmedTests: TTestStates = {};
    private doneTest: TTestStates = {};
    private failTest: TTestStates = {};
    private doneHandlers: TTestHandler = {};
    private checkTimer: any = -1;

    constructor(tests: EClientTests[]) {
        tests.forEach((test: EClientTests) => {
            this.confirmedTests[test] = false;
            this.doneTest[test] = false;
            this.failTest[test] = false;
        });
        this.done = this.done.bind(this);
        this.fail = this.fail.bind(this);
        this.check = this.check.bind(this);
        this.registerDoneHandler = this.registerDoneHandler.bind(this);
        // Start checking results
        this.check();
    }

    public done(test: EClientTests) {
        this.doneTest[test] = true;
        this.check();
    }

    public fail(test: EClientTests, error?: Error) {
        this.failTest[test] = true;
        this.check();
    }

    public registerDoneHandler(test: EClientTests, handler: Function) {
        this.doneHandlers[test] = handler;
        this.check();
    }

    public stop() {
        clearTimeout(this.checkTimer);
    }

    private check() {
        Object.keys(this.doneHandlers).forEach((test: EClientTests) => {
            const done = this.doneHandlers[test];
            if (!this.doneTest[test] || this.failTest[test]) {
                // Test is failed or wasn't done
                return;
            }
            if (this.confirmedTests[test]) {
                // Test was confirmed already
                return;
            }
            if (this.doneHandlers[test] === void 0) {
                // Done handler isn't registred yet
                return;
            }
            // Mark as confirmed
            this.confirmedTests[test] = true;
            // Execute done
            done();
        });

    }

}

const resultController = new ResultController([
    EClientTests.connection,
    EClientTests.triggerBroadcastEvent,
    EClientTests.triggerTargetedEvent,
    EClientTests.getDemandResponse,
    EClientTests.disconnection
]);


describe('[client]', () => {

    it('[Connection]', () => {
        return new Promise(function(resolve, reject) {
            resultController.registerDoneHandler(EClientTests.connection, () => {
                expect(true).toBe(true);
                resolve();
            });
        });
    });

    it('[Triggering broadcast event]', () => {
        return new Promise(function(resolve, reject) {
            resultController.registerDoneHandler(EClientTests.triggerBroadcastEvent, () => {
                expect(true).toBe(true);
                resolve();
            });
        });
    });

    it('[Triggering targeted event]', () => {
        return new Promise(function(resolve, reject) {
            resultController.registerDoneHandler(EClientTests.triggerTargetedEvent, () => {
                expect(true).toBe(true);
                resolve();
            });
        });
    });

    it('[Get demand response]', () => {
        return new Promise(function(resolve, reject) {
            resultController.registerDoneHandler(EClientTests.getDemandResponse, () => {
                expect(true).toBe(true);
                resolve();
            });
        });
    });

    it('[Disconnection]', () => {
        return new Promise(function(resolve, reject) {
            resultController.registerDoneHandler(EClientTests.disconnection, () => {
                expect(true).toBe(true);
                resolve();
            });
        });
    });


});

const test = new Test(resultController.done, resultController.fail);
