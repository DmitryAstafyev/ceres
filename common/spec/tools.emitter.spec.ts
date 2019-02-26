/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
//./node_modules/.bin/jasmine-ts src/something.spec.ts

import Emitter from '../platform/tools/tools.emitter';

class Instance extends Emitter{

    private prop: number = 4;

    constructor(){
        super();
        this.handler = this.handler.bind(this);
    }

    handler(a: any, b: any, c: any){
        expect(a).toBe(1);
        expect(b).toBe(2);
        expect(c).toBe(3);
        expect(this.prop).toBe(4);
    }

}

describe('[Test][tools][emitter]', () => {
    it('[Basic functionlity]', (done: Function)=>{
        const instance = new Instance();
        instance.subscribe('A', (a: any, b: any, c: any) => {
            expect(a).toBe(1);
            expect(b).toBe(2);
            expect(c).toBe(3);
        });
        instance.emit('A', 1, 2, 3);
        const context = { d: 4 };
        const hander = function(a: any, b: any, c: any){
            expect(a).toBe(1);
            expect(b).toBe(2);
            expect(c).toBe(3);
            instance.unsubscribeAll();
            expect(instance.listeners('B').length).toBe(0);
        }.bind(context);
        instance.subscribe('B', hander);
        instance.subscribe('B', instance.handler);
        instance.emit('B', 1, 2, 3);
        done();
    });

});