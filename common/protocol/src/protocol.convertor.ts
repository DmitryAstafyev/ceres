import * as Tools from '../../platform/tools/index';
import { IInejection, Injections } from './protocol.injections';
import { IEntity, EEntityType, EntityType } from './protocol.entity';
import * as Path from 'path';

const DEFAULT_INJECTIONS = [
    './injections/injection.root.ts',
    './injections/injection.types.primitive.ts'
];

interface IArgument {
    name: string,
    type: EEntityType,
    protoType: string,
    tsType: string,
    optional: boolean
}

export interface IAdvancedTypeDeclaration {
    implementation: {[key: string]: any},
    path: string
}

export class Convertor {
    private _requestFields : {[key: string]: string} = {
        Request: 'Request',
        Response: 'Response',
        Responses: 'Responses'
    };
    private _logger: Tools.Logger = new Tools.Logger('Protocol.Convertor');
    private _entityType: EntityType = new EntityType();
    private _version: string = '';
    private _entities: { [key: string]: IEntity } = {};
    private _injections: Injections = new Injections();
    private _map: {[key: string]: string } = {};

    public convert(JSON: any, injections: Array<string> = [], adTypes: IAdvancedTypeDeclaration | null = null): Promise<string> {
        return new Promise((resolve, reject) => {
            //Assign advanced types
            if (adTypes !== null) {
                const errors: Array<Error> | undefined = this._entityType.setAdvancedTypes(adTypes.implementation);
                if (errors instanceof Array) {
                    const message: string = errors.map((error: Error) => {
                        return `\t- ${error.message}`;
                    }).join('\n');
                    return reject(new Error(this._logger.error(`Cannot conver protocol due error(s):\n${message}`)));
                }
                //Add to injections
                injections.unshift(Path.join(__dirname, adTypes.path));
            }
            //Get base
            let base: string = '';
            try {
                base = this._getBase(JSON);
            } catch (error) {
                return reject(error);
            }
            //Get injections
            injections.unshift(...(DEFAULT_INJECTIONS.map((file: string) => {
                return Path.join(__dirname, file);
            })));
            this._injections.get(injections).then((injections: Array<IInejection>) => {
                let injectStr: string = '';
                //Validate advanced type injection
                if (adTypes !== null) {
                    let error: any = undefined;
                    injections.forEach((injection: IInejection) => {
                        if (adTypes.path.indexOf(injection.file) !== -1){
                            if (injection.content.indexOf('export const AdvancedTypes:') === -1){
                                error = new Error(`TS file with implementation of advanced types doesn't have definition for it. Expected: "export const AdvancedTypes"`);
                            }
                        }
                    });
                    if (error instanceof Error) {
                        return reject(error);
                    }
                } else {
                    //Inject empty AdvancedTypes declaration
                    injectStr += `\texport const AdvancedTypes: {[key: string]: any} = {};\n`;
                }
                injections.forEach((injection: IInejection) => {
                    injectStr += 
                    '\t/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n' + 
                    `\t* Injection: ${injection.file}\n` + 
                    '\t* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */\n' + 
                    injection.content.split(/[\n\r]/gi).map((row: string) => { return `\t${row}`;}).join('\n') + 
                    '\n';
                });
                let protocolNamespace: string = '';
                protocolNamespace += `namespace Protocol {\n`;
                protocolNamespace += this._getTypes() + '\n';
                protocolNamespace += injectStr + '\n';
                protocolNamespace += this._getMap() + '\n';
                protocolNamespace += '}\n';
                base = protocolNamespace + base + '\n';
                base += this._getInitialization();
                resolve(base);
            }).catch((errors: Array<Error> | Error) => {
                errors instanceof Error && (errors = [errors]);
                const message: string = errors.map((error: Error) => {
                    return `\t- ${error.message}`;
                }).join('\n');
                reject(new Error(this._logger.error(`Cannot conver protocol due error(s):\n${message}`)));
            });
        });
    }

    private _getBase(JSON: any): string {
        if (Tools.getTypeOf(JSON) !== Tools.EPrimitiveTypes.object) {
            throw new Error(this._logger.error(`Expecting object to convert to a protocol implemenation. Gotten: ${Tools.getTypeOf(JSON)}`));
        }
        if (Object.keys(JSON).length < 1) {
            throw new Error(this._logger.error(`No properties found in target JSON.`));
        }
        if (Tools.getTypeOf(JSON.version) !== Tools.EPrimitiveTypes.string || JSON.version.trim() === ''){
            throw new Error(this._logger.error(`Root level of protocol should have property "version" {string}.`));
        }
        this._version = JSON.version;
        delete JSON.version;
        this._entities.root = {
            name: 'root',
            type: EEntityType.root,
            children: {},
            value: JSON,
            single: true,
            parent: null,
            request: false
        };
        this._restoreStructure(JSON);
        this._getEntities(this._entities.root, JSON);
        this._validateEntities(this._entities.root);
        return this._entityType.getInjections() 
            + '\n'
            + this._getImplementation(this._entities.root);
    }

    private _isTargetRequest(target: any): boolean {
        let isRequest: boolean = false;
        if (Tools.getTypeOf(target) !== Tools.EPrimitiveTypes.object) {
            return false;
        }
        Object.keys(target).forEach((key: string) => {
            this._requestFields[key] !== void 0 && (isRequest = true);
        });
        return isRequest;
    }

    private _restoreStructure(target: any){ 
        let isRequest: boolean = this._isTargetRequest(target);
        if (isRequest){
            target[this._requestFields.Request] === void 0 && (target[this._requestFields.Request] = {});
            target[this._requestFields.Response] === void 0 && (target[this._requestFields.Response] = {});
        }
        Object.keys(target).forEach((key: string) => {
             Tools.getTypeOf(target[key]) === Tools.EPrimitiveTypes.object && (this._restoreStructure(target[key]));
        });
    }

    private _getMap(): string{
        let output: string = 
                    '\t/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n' + 
                    `\t* Injection: map of references\n` + 
                    '\t* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */\n';
        output += '\texport let ReferencesMap: {[key: string]: any} = {};\n';
        output += `\texport function init(){\n`;
        Object.keys(this._map).forEach((signature: string) => {
            output += `\t\tReferencesMap["${signature}"] = ${this._map[signature]};\n`;
        });
        output += `\t}\n`;
        return output;
    }

    private _getInitialization(): string {
        let output: string = 
                    '/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n' + 
                    `* Injection: initialization\n` + 
                    '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */\n';
        output += 'Protocol.init();';
        return output;
    }

    private _getTypes(): string {
        let output: string = 
            '\t/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n' + 
            `\t* Injection: map of types\n` + 
            '\t* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */\n';
        output += '\texport type TTypes = \n';
        const count: number = Object.keys(this._map).length;
        Object.keys(this._map).forEach((signature: string, index: number) => {
            output += `\t\t${this._map[signature]}${index !== count - 1 ? ' |': ';'}\n`;
        });
        return output;
    }

    private _getEntities(parent: IEntity, target: any) {
        //Check name conflicts
        Object.keys(target).forEach((prop: string) => {
            const name: string = this._entityType.serializeName(prop);
            if (name === parent.name) {
                throw new Error(this._logger.error(`Parent enitity "${parent.name}" has nested definition with name "${prop}". Use other name for nested definition.`));
            }
        });
        //Proceed entities walking
        Object.keys(target).forEach((prop: string) => {
            const value: any = target[prop];
            const type: EEntityType | Array<Error> = this._entityType.getType(prop, value);
            if (type instanceof Array) {
                throw new Error(this._logger.error(`Error converting: \n ${type.map((error: Error) => { return error.message; }).join('\n')}`));
            }
            if (parent.children[prop] !== void 0) {
                throw new Error(this._logger.error(`Prop "${prop}" is defined twice.`));
            }
            parent.children[prop] = {
                name: this._entityType.serializeName(prop),
                type: type,
                children: {},
                value: value,
                single: this._entityType.isSingle(prop),
                parent: parent,
                request: this._isTargetRequest(value)
            };
            switch(type){
                case EEntityType.class:
                case EEntityType.complex:
                case EEntityType.namespace:
                    this._getEntities(parent.children[prop], target[prop]);
                    break;
                case EEntityType.enum:
                case EEntityType.primitive:
                case EEntityType.reference:
                    break;
            }
        });
    }

    private _validateEntities(entity: IEntity){
        Object.keys(entity.children).forEach((prop) => {
            const target: IEntity = entity.children[prop];
            let ref: string = target.value;
            if (entity.parent === null) {
                return this._validateEntities(target);
            }
            if (entity.request && entity.children.Responses !== void 0) {
                if (!(entity.children.Responses.value instanceof Array)){
                    throw new Error(`Field "Responses" is reserved. Value can be only Array<string>. Check prop "${entity.name}".`);
                }
                entity.children.Responses.value.forEach((ref: string) => {
                    if (entity.children[ref] === void 0 && entity.children[ref] === void 0 && this._entities.root.children[ref] === void 0) {
                        ref = `@${ref}`;
                        if (entity.children[ref] === void 0 && entity.children[ref] === void 0 && this._entities.root.children[ref] === void 0) {
                            ref = this._entityType.serializeName(ref);
                            throw new Error(this._logger.error(`Cannot find definition for "${ref}". Define "${ref}" on root level or on level of "${entity.name}".`));
                        } 
                    }
                    ref = target.value;
                });
            }
            if (target.type !== EEntityType.reference) {
                return this._validateEntities(target);
            }
            //Check parent level
            if (entity.parent.children[ref] === void 0 && entity.children[ref] === void 0 && this._entities.root.children[ref] === void 0) {
                ref = `@${ref}`;
                if (entity.parent.children[ref] === void 0 && entity.children[ref] === void 0 && this._entities.root.children[ref] === void 0) {
                    ref = this._entityType.serializeName(ref);
                    throw new Error(this._logger.error(`Cannot find definition for "${ref}". Define "${ref}" on root level or on level of "${entity.parent.name}" or "${entity.parent.name}.${entity.name}".`));
                }                
            }
            this._validateEntities(target);
        });
    }

    private _getClassConstructor(entity: IEntity, deep: number = 0): string {
        const tab = '\t'.repeat(deep);
        const nested = '\t'.repeat(deep + 1);
        let output: string = '';
        let ownArgs: Array<IArgument> = this._getOwnArguments(entity);
        let parentArgs: Array<IArgument> = entity.parent !== null ? (!entity.single ? this._getParentsArguments(entity.parent) : []) : [];
        let args: Array<IArgument> = [];
        args.push(...parentArgs);
        args.push(...ownArgs);
        //Check conflicts
        ownArgs.forEach((ownArg: IArgument) => {
            let hasConflict: boolean = false;
            parentArgs.forEach((parentArg: IArgument) => {
                if (ownArg.name === parentArg.name) {
                    throw new Error(`Conflict. Property "${entity.name}" has definition for "${ownArg.name}", but this field is already defined on parent's level.`);
                }
            });
        });
        //Build class
        output += `\n${tab}constructor(args: { ${args.map((arg: IArgument) => { return `${arg.name + (arg.optional ? '?' : '')}: ${arg.tsType}`; }).join(', ')} }) {`;
        if (parentArgs.length > 0) {
            output += `\n${nested}super(Object.assign(args, {}));`;
        } else {
            output += `\n${nested}super();`;
        }
        ownArgs.forEach((arg: IArgument) => {
            if (arg.optional) {
                output += `\n${nested}args.${arg.name} !== void 0 && (this.${arg.name} = args.${arg.name});`;
            } else {
                output += `\n${nested}this.${arg.name} = args.${arg.name};`;
            }
        });
        output += `\n${tab}}\n`;
        return output;
    }

    private _getOwnArguments(entity: IEntity): Array<IArgument> {
        let args: Array<IArgument> = [];
        Object.keys(entity.children).forEach((key: string) => {
            const target: IEntity = entity.children[key];
            switch(target.type) {
                case EEntityType.primitive:
                    const type = this._entityType.getTypes()[target.value];
                    args.push({
                        name: target.name.replace(/\?/gi, ''),
                        type: target.type,
                        protoType: target.value,
                        tsType: this._entityType.getTypes()[target.value].tsType,
                        optional: target.name.indexOf('?') !== -1
                    });
                    break;
                case EEntityType.reference:
                    let namespace: string = this._getReferenceNamespace(target);
                    args.push({
                        name: target.name.replace(/\?/gi, ''),
                        type: target.type,
                        protoType: target.value,
                        tsType: `${namespace !== '' ? `${namespace}.` : ''}${target.value}`,
                        optional: target.name.indexOf('?') !== -1
                    });
                    break;
                case EEntityType.repeated:
                    const typeAlias: string = this._entityType.getRepeatedType(target.value);
                    let tsType = '';
                    if (this._entityType.isPrimitive(typeAlias)){
                        tsType = this._entityType.getTypes()[typeAlias].tsType;
                    } else {
                        let namespace: string = this._getReferenceNamespace(target);
                        tsType = `${namespace !== '' ? `${namespace}.` : ''}${typeAlias}`;
                    }
                    args.push({
                        name: target.name.replace(/\?/gi, ''),
                        type: target.type,
                        protoType: target.value,
                        tsType: `Array<${tsType}>`,
                        optional: target.name.indexOf('?') !== -1
                    });
                    break;
            }
        });
        return args;
    }

    private _getParentsArguments(parent: IEntity): Array<IArgument> {
        let args: Array<IArgument> = [];
        switch(parent.type) {
            case EEntityType.class:
            case EEntityType.complex:
            case EEntityType.namespace:
                args.push(...this._getOwnArguments(parent));
                parent.parent !== null && args.push(...this._getParentsArguments(parent.parent));
                break;
        }
        return args;
    }

    private _getClassChain(entity: IEntity): string {
        let signature: string = entity.name;
        return (entity.parent !== null ? (entity.parent.type !== EEntityType.root ? `${this._getClassChain(entity.parent)}.` : '') : '') + signature;
    }

    private _getClassImplementation(entity: IEntity, deep: number = 0): string {
        let output: string = '';
        const tab = '\t'.repeat(deep);
        const exttab = '\t'.repeat(deep + 1);
        const extended: string = (entity.parent !== null ? (entity.parent.type !== EEntityType.root ? ` extends ${entity.parent.name}` : ' extends Protocol.Root') : '');
        //Open class
        output += `${tab}export class ${entity.name}${entity.single ? ' extends Protocol.Root' : extended} {\n`;
        //Define signature
        const chain: string = this._getClassChain(entity);
        const signature: string = Tools.hash(`${this._version}:${chain}`, true);
        output += this._getDescriptionEntity(entity, deep + 1);
        output += `${exttab}static __signature: string = "${signature}";\n`;
        output += `${exttab}static getSignature(): string {\n`;
        output += `${exttab}\treturn ${entity.name}.__signature;\n`;
        output += `${exttab}}\n`;
        output += `${exttab}public __signature: string = ${entity.name}.__signature;\n`;
        output += `${exttab}public getSignature(): string {\n`;
        output += `${exttab}\treturn this.__signature;\n`;
        output += `${exttab}}\n`;
        //Define extractor
        output += `${exttab}static parse(str: string): Protocol.TTypes | Array<Error> {\n`;
        output += `${exttab}\treturn Protocol.parse(str, ${entity.name});\n`;
        output += `${exttab}}\n`;
        //Define stringify
        output += `${exttab}public stringify(): string | Array<Error> {\n`;
        output += `${exttab}\treturn Protocol.stringify(this, ${entity.name});\n`;
        output += `${exttab}}\n`;
        //Save signature
        if (this._map[signature] !== void 0) {
            throw new Error(this._logger.error(`Signature (${signature}) for "${entity.name}" already exsist. Cannot continue converting.`));
        }
        this._map[signature] = chain; 
        //Define properties
        Object.keys(entity.children).forEach((prop: string) => {
            const child: IEntity = entity.children[prop];
            switch(child.type) {
                case EEntityType.primitive:
                case EEntityType.reference:
                case EEntityType.repeated:
                    output += this._getImplementation(child, deep + 1);
                    break;
            }               
        });
        //Add constructor
        output += this._getClassConstructor(entity, deep + 1);
        output += `${tab}}\n`;
        //Close class
        return output;
    }

    private _getDescriptionEntity(entity: IEntity, deep: number = 0): string {
        const tab = '\t'.repeat(deep);
        let ownArgs: Array<IArgument> = this._getOwnArguments(entity);
        let parentArgs: Array<IArgument> = entity.parent !== null ? (!entity.single ? this._getParentsArguments(entity.parent) : []) : [];
        let args: Array<IArgument> = [];
        args.push(...parentArgs);
        args.push(...ownArgs);
        let output: string = `${tab}static getDescription(): {[key: string]: Protocol.IProperty } {\n`;
        output += `${tab}\treturn {\n`;
        args.forEach((arg: IArgument) => {
            const name: string = this._entityType.hardSerializeName(arg.name);
            switch(arg.type) {
                case EEntityType.class:
                case EEntityType.complex:
                case EEntityType.namespace:
                case EEntityType.reference:
                    output += `${tab}\t\t${name}: { name: "${name}", value: ${arg.tsType}, type: Protocol.EEntityType.${arg.type}, optional: ${arg.optional} }, \n`;
                    break;
                case EEntityType.primitive:
                    output += `${tab}\t\t${name}: { name: "${name}", value: "${arg.protoType}", type: Protocol.EEntityType.${arg.type}, optional: ${arg.optional} }, \n`;
                    break;
                case EEntityType.repeated:
                    let repeatedType: string = this._entityType.getRepeatedType(arg.tsType);
                    output += `${tab}\t\t${name}: { name: "${name}", value: ${repeatedType}, type: Protocol.EEntityType.${arg.type}, optional: ${arg.optional} }, \n`;
                    break;
                case EEntityType.enum:
                    break;
            }
        });
        output += `${tab}\t}\n`;
        output += `${tab}}\n`;
        return output;
    }

    private _getReferenceNamespace(entity: IEntity): string {
        let namespace: string = '';
        if (entity.parent !== null && (entity.parent.children[entity.value] !== void 0 || entity.parent.children[this._entityType.getRepeatedType(entity.value)] !== void 0)) {
            namespace = entity.parent.name; 
        }
        return namespace;
    }

    private _getImplementation(entity: IEntity, deep: number = 0): string {
        let output: string = '';
        const tab = '\t'.repeat(deep);
        const exttab = '\t'.repeat(deep + 1);
        switch(entity.type) {
            case EEntityType.root:
                Object.keys(entity.children).forEach((prop: string) => {
                    const child: IEntity = entity.children[prop];
                    output += this._getImplementation(child, deep);
                });
                break;
            case EEntityType.class:
                //Open class
                output += this._getClassImplementation(entity, deep);
                //Close class
                break;
            case EEntityType.complex:
                //Open class
                output += this._getClassImplementation(entity, deep);
                //Close class
                //Open namespace
                output += `${tab}export namespace ${entity.name} {\n`;
                Object.keys(entity.children).forEach((prop: string) => {
                    const child: IEntity = entity.children[prop];
                    if (child.type === EEntityType.enum) {
                        output += this._getImplementation(child, deep + 1);
                    }
                });
                //Close namespace
                output += `${tab}}\n`;
                break;
            case EEntityType.namespace:
                //Open class
                output += this._getClassImplementation(entity, deep);
                //Close class
                //Open namespace
                output += `${tab}export namespace ${entity.name} {\n`;
                Object.keys(entity.children).forEach((prop: string) => {
                    const child: IEntity = entity.children[prop];
                    if (child.type !== EEntityType.primitive && child.type !== EEntityType.reference && child.type !== EEntityType.repeated) {
                        output += this._getImplementation(child, deep + 1);
                    }
                });
                if (entity.request) {
                    //Add type description for request
                    let responses: Array<string> = ['Response'];
                    entity.children.Responses !== void 0 && responses.push(...entity.children.Responses.value);
                    output += `${exttab}type TResponses = ${responses.join(' | ')};\n`;
                }
                //Close namespace
                output += `${tab}}\n`;
                break;
            case EEntityType.primitive:
                const type = this._entityType.getTypes()[entity.value];
                output += `${tab}public ${entity.name}: ${type.tsType} = ${type.init};\n`;
                break;
            case EEntityType.reference:
                let namespace: string = this._getReferenceNamespace(entity);
                output += `${tab}public ${entity.name}: ${namespace !== '' ? `${namespace}.` : ''}${entity.value};\n`; 
                break;
            case EEntityType.repeated:
                const typeAlias: string = this._entityType.getRepeatedType(entity.value);
                let tsType = '';
                if (this._entityType.isPrimitive(typeAlias)){
                    tsType = this._entityType.getTypes()[typeAlias].tsType;
                } else {
                    let namespace: string = this._getReferenceNamespace(entity);
                    tsType = `${namespace !== '' ? `${namespace}.` : ''}${typeAlias}`;
                }
                output += `${tab}public ${entity.name}: Array<${tsType}> = [];\n`;
                break;
            case EEntityType.enum:
                output += `${tab}export enum ${entity.name} {\n`; 
                entity.value.forEach((value: string, index: number) => {
                    output += `${tab}\t${value} = '${value}'${index < entity.value.length - 1 ? ',' : ''}\n`; 
                });
                output += `${tab}}\n`;
                break;
        }
        return output;
    }

}