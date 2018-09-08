import * as Tools from '../../platform/tools/index';
import { PrimitiveTypes, IPrimitiveType } from './injections/injection.types.primitive';

export enum EEntityType {
    root = 'root',
    class = 'class',
    namespace = 'namespace',
    complex = 'complex',
    primitive = 'primitive',
    repeated = 'repeated',
    reference = 'reference',
    enum = 'enum'
};

export class EntityType {

    private _types: {[key: string]: any} = {};

    constructor(){
        let defTypes = Object.assign({}, PrimitiveTypes);
        this._types = Object.assign({}, defTypes);
    }

    public getTypes(): {[key: string]: IPrimitiveType<any>} {
        return this._types;
    }

    public setAdvancedTypes(advancedTypes: {[key: string]: any}): Array<Error> | undefined {
        const errors: Array<Error> | undefined = this._getAdvancedTypeErrors(advancedTypes);
        if (errors instanceof Array) {
            return errors;
        }
        let defTypes = Object.assign({}, PrimitiveTypes);
        let adTypes = Object.assign({}, advancedTypes);
        this._types = Object.assign(defTypes, adTypes); 
    }

    private _getAdvancedTypeErrors(advancedTypes: {[key: string]: any}): Array<Error> | undefined {
        if (typeof advancedTypes !== 'object' || advancedTypes === null) {
            return [new Error(`Expecting as advanced types - object: {[key: string]: any }.`)];
        }
        const errors: Array<Error> = [];
        const props: {[key: string]: string } = {
            tsType: 'string',
            init: 'string',
            parse: 'function',
            serialize: 'function',
            validate: 'function'
        };
        const optional: {[key: string]: string } = {
            implementation: 'function'
        };
        Object.keys(advancedTypes).forEach((key: string) => {
            const type: any = advancedTypes[key];
            if (PrimitiveTypes[key] !== void 0) {
                return errors.push(new Error(`Type with alias "${key}" is defined on default level.`));
            }
            Object.keys(props).forEach((prop: string) => {
                if (typeof type[prop] !== props[prop]) {
                    return errors.push(new Error(`Type with alias "${key}" has wrong type of property "${prop}". Expected type is {${props[prop]}}, but gotten: "${(typeof type[prop])}" .`));
                }
            });
            Object.keys(optional).forEach((prop: string) => {
                if (type[prop] !== void 0 && typeof type[prop] !== props[prop]) {
                    return errors.push(new Error(`Type with alias "${key}" has wrong type of property "${prop}". Expected type is {${props[prop]}}, but gotten: "${(typeof type[prop])}" .`));
                }
            });
        });
        return errors.length > 0 ? errors : undefined;
    }

    private _getEnumError(target: Array<string>): null | Error {
        if (!(target instanceof Array)){
            return new Error(`As enum type expected an array<string>, but gotten: ${Tools.inspect(target)}`);
        }
        try {
            target.forEach((value: string) => {
                if (Tools.getTypeOf(value) !== Tools.EPrimitiveTypes.string) {
                    throw new Error(`As enum type expected an array<string>, but gotten: ${Tools.inspect(target)}`);
                }
                if (value.trim() === '') {
                    throw new Error(`Value of enum cannot be empty string. Enum: ${Tools.inspect(target)}`);
                }
            });
        } catch (e) {
            return e;
        }
        return null;
    }

    public isPrimitive(type: string): boolean{
        return this._types[type] !== void 0;
    }

    public isClassReference(type: string): boolean{
        return type[0] === type[0].toUpperCase();
    }

    public isRepeated(type: string): boolean{
        return type.search(/array<.*>/gi) !== -1;
    }

    public serializeName(name: string): string {
        return name.replace(/@/gi, '');
    }

    public hardSerializeName(name: string): string {
        return name.replace(/@/gi, '').replace(/\?/gi, '');
    }

    public isSingle(name: string): boolean {
        return name.indexOf('@') === 0;
    }

    public getRepeatedType(type: string): string{
        return type.replace(/array</gi, '').replace(/>/gi, '');
    }

    public getType(prop: string, target: any): EEntityType | Array<Error> {
        let error: Error | null;
        switch(Tools.getTypeOf(target)) {
            case Tools.EPrimitiveTypes.string:
                if (target.trim() === '') {
                    return [new Error(`Definition of type cannot be empty string. Property "${prop}".`)];
                }
                if (this.isRepeated(target)){
                    const error = this.getType(prop, this.getRepeatedType(target));
                    if (error instanceof Array){
                        return error;
                    }
                    return EEntityType.repeated;
                }
                if (this.isClassReference(target)){
                    return EEntityType.reference;
                }
                if (this.isPrimitive(target)){
                    return EEntityType.primitive;
                }
                return [new Error(`Cannot parse prop "${prop}" due error: unknown primitive / generic type "${target}". Available types: ${Object.keys(this._types).join(', ')}. To define reference to class, use uppercase for the first letter.`)];
            case Tools.EPrimitiveTypes.array:
                error = this._getEnumError(target);
                return error === null ? EEntityType.enum : [new Error(`Cannot parse prop "${prop}" due error: ${error.message}`)];
            case Tools.EPrimitiveTypes.object:
                let types: { [key: string]: boolean } = {};
                let errors: Array<Error> = [];
                Object.keys(target).forEach((prop: string) => {
                    const type = this.getType(prop, target[prop]);
                    if (type instanceof Array) {
                        errors.push(...type);
                    } else {
                        types[type] = true;
                    }
                });
                if (errors.length > 0) {
                    return errors;
                }
                let isClass: boolean = true;
                let isComplex: boolean = true;
                Object.keys(types).forEach((key: string) => {
                    if (key !== EEntityType.primitive && key !== EEntityType.reference && key !== EEntityType.repeated) {
                        isClass = false;
                    }
                    if (key !== EEntityType.primitive && key !== EEntityType.reference && key !== EEntityType.repeated && key !== EEntityType.enum) {
                        isComplex = false;
                    }
                });
                if (isClass) {
                    return EEntityType.class;
                }
                if (isComplex) {
                    return EEntityType.complex;
                }
                return EEntityType.namespace;
        }
        return [new Error(`Prop "${prop}" has unexpected type: ${Tools.getTypeOf(target)}. Allowed types: string, object, array<string>.`)];
    }

    public getInjections(): string{
        let injections = '';
        Object.keys(this._types).forEach((alias: string) => {
            const type: IPrimitiveType<any> = this._types[alias];
            if (Tools.getTypeOf(type.implementation) === Tools.EPrimitiveTypes.function) {
                injections += (type.implementation as Function).toString() + '\n';
            }
        });
        if (injections !== '') {
            injections = 
            '/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n' + 
            '* Primitive type injections\n' + 
            '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */\n' + 
            injections;
        }
        return injections;
    }
}

export interface IEntity {
    type: EEntityType,
    name: string,
    children: { [key: string]: IEntity },
    value: any,
    single: boolean, //Classes marked with "@" will not extends from parents
    parent: IEntity | null,
    request: boolean
}
