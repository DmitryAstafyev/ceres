const __SIGNATURE = 'signature';
const __TOKEN = { prop: '__token', setter: 'setToken' };

declare var __SchemeClasses:any;

class __Parser {

    validate(json: any) {
        if (typeof json === 'string') {
            try {
                json = JSON.parse(json);
            } catch(e) {
                return new Error(`Cannot parse target due error: ${e.message}`);
            }
        }
        return json;
    }

    find(json: any) {
        if (typeof __SchemeClasses !== 'object' || __SchemeClasses === null) {
            return new Error(`Cannot find classes description.`);
        }
        if (typeof json !== 'object' || json === null) {
            return new Error(`Target isn't an object.`);
        }
        if (typeof json[__SIGNATURE] !== 'string'){
            return new Error(`Target doesn't have signature.`);
        }
        try {
            Object.keys(__SchemeClasses).forEach((className: string) => {
                const classImpl = __SchemeClasses[className];
                if (typeof classImpl[__SIGNATURE] !== 'string') {
                    throw new Error(`Cannot find signature for class "${className}".`);
                }
                if (classImpl[__SIGNATURE] === json[__SIGNATURE]) {
                    throw classImpl;
                }
            });
        } catch(smth) {
            return smth;
        }
        return null;
    }

    convert(json: any, root: boolean = true){
        //Conver to object
        json = this.validate(json);
        if (json instanceof Error){
            return json;
        }
        if (json === null || typeof json !== 'object'){
            return new Error(`Target should be an object and don't null.`);
        }
        //Try to find implementation
        const classImpl = this.find(json);
        if (classImpl instanceof Error){
            return classImpl;
        }
        if (classImpl === null){
            return new Error(`Implementation of class for target isn't found.`);
        }
        //Check nested implementations
        try {
            Object.keys(json).forEach((prop: string) => {
                const smth = json[prop];
                if (typeof smth === 'object' && smth !== null && typeof smth[__SIGNATURE] === 'string' && smth[__SIGNATURE].trim() !== ''){
                    //Probably it's implementation
                    json[prop] = this.convert(json[prop], false);
                }
            });
        } catch(e){
            return new Error(`Cannot create a nested instance of target due error: ${e.message}`);
        }
        //Try to make an instance
        let classInst;
        try {
            classInst = new classImpl(json);
        } catch(e){
            return new Error(`Cannot create instance of target due error: ${e.message}`);
        }
        if (root && json[__TOKEN.prop] !== void 0) {
            try {
                classInst[__TOKEN.setter](json[__TOKEN.prop]);
            } catch(e){
                return new Error(`Cannot set "${__TOKEN.prop}" of target's instance due error: ${e.message}`);
            }
        }
        return classInst;
    }

}

const __parser = new __Parser();

