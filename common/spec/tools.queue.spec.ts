/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
//./node_modules/.bin/jasmine-ts src/something.spec.ts

import Queue from '../platform/tools/tools.queue';

describe('[Test][tools][queue]', () => {
    it('[Basic functionlity]', (done: Function)=>{
        const queue = new Queue();
        let counter = 0;
        queue.add((() => {
            counter += 1;
            return true;
        }), 'test');
        queue.add((() => {
            counter += 1;
            return counter <= 2 ? false : true;
        }), 'test');
        expect(counter).toBe(0);
        expect(queue.getTasksCount()).toBe(2);
        queue.procced();
        expect(counter).toBe(2);
        expect(queue.getTasksCount()).toBe(1);
        queue.procced();
        expect(counter).toBe(3);
        expect(queue.getTasksCount()).toBe(0);
        queue.add((() => { }), 'test');
        queue.add((() => { }), 'test');
        expect(queue.getTasksCount()).toBe(2);
        queue.drop('test');
        expect(queue.getTasksCount()).toBe(0);
        done();
    });
});