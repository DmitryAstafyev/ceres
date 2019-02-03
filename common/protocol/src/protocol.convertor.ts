import { EEntityType, EntityType, IEntity } from './protocol.entity';
import { IInejection, Injections } from './protocol.injections';

import * as Path from 'path';
import * as Tools from '../../platform/tools/index';

const DEFAULT_INJECTIONS = [
    './injections/injection.convertor.ts',
    './injections/injection.root.ts',
    './injections/injection.types.primitive.ts',
];

interface IArgument {
    name: string;
    type: EEntityType;
    protoType: string;
    tsType: string;
    optional: boolean;
}

export interface IAdvancedTypeDeclaration {
    implementation: {[key: string]: any};
    path: string;
}

export class Convertor {
    private _requestFields: {[key: string]: string} = {
        Request: 'Request',
        Response: 'Response',
        Responses: 'Responses',
    };
    private _logger: Tools.Logger = new Tools.Logger('Protocol.Convertor');
    private _entityType: EntityType = new EntityType();
    private _version: string = '';
    private _entities: { [key: string]: IEntity } = {};
    private _injections: Injections = new Injections();
    private _map: {[key: string]: string } = {};
    private _keysMapLeft: {[key: string]:
        {[key: string]: string },
    } = {};
    private _keysMapRight: {[key: string]:
        {[key: string]: string },
    } = {};
    private _typedMap: { [key: string]: any } = {};

    public convert(JSON: any, injections: string[] = [], adTypes: IAdvancedTypeDeclaration | null = null): Promise<string> {
        return new Promise((resolve, reject) => {
            // Assign advanced types
            if (adTypes !== null) {
                const errors: Error[] | undefined = this._entityType.setAdvancedTypes(adTypes.implementation);
                if (errors instanceof Array) {
                    const message: string = errors.map((error: Error) => {
                        return `\t- ${error.message}`;
                    }).join('\n');
                    return reject(new Error(this._logger.error(`Cannot conver protocol due error(s):\n${message}`)));
                }
                // Add to injections
                injections.unshift(Path.join(__dirname, adTypes.path));
            }
            // Get base
            let base: string = '';
            try {
                base = this._getBase(JSON);
            } catch (error) {
                return reject(error);
            }
            // Get injections
            injections.unshift(...(DEFAULT_INJECTIONS.map((file: string) => {
                return Path.join(__dirname, file);
            })));
            this._injections.get(injections).then((readyInjections: IInejection[]) => {
                let injectStr: string = '';
                // Validate advanced type injection
                if (adTypes !== null) {
                    let error: any;
                    readyInjections.forEach((injection: IInejection) => {
                        if (adTypes.path.indexOf(injection.file) !== -1) {
                            if (injection.content.indexOf('export const AdvancedTypes:') === -1) {
                                error = new Error(`TS file with implementation of advanced types doesn't have definition for it. Expected: "export const AdvancedTypes"`);
                            }
                        }
                    });
                    if (error instanceof Error) {
                        return reject(error);
                    }
                } else {
                    // Inject empty AdvancedTypes declaration
                    injectStr += `\texport const AdvancedTypes: {[key: string]: any} = {};\n`;
                }
                readyInjections.forEach((injection: IInejection) => {
                    injectStr +=
                    '\t/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n' +
                    `\t* Injection: ${injection.file}\n` +
                    '\t* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */\n' +
                    injection.content.split(/[\n\r]/gi).map((row: string) => `\t${row}`).join('\n') +
                    '\n';
                });
                const lints: string = '/* tslint:disable */\n';
                let greeting: string = '';
                greeting += `/*\n`;
                greeting += `* This file generated automaticaly (${(new Date()).toString()})\n`;
                greeting += `* Do not remove or change this code.\n`;
                greeting += `* Protocol version: ${this._version}\n`;
                greeting += `*/\n\n`;
                let protocolNamespace: string = '';
                protocolNamespace += `export namespace Protocol {\n`;
                protocolNamespace += this._getTypes() + '\n';
                protocolNamespace += this._getKeysMaps() + '\n';
                protocolNamespace += this._getTypedMap() + '\n';
                protocolNamespace += injectStr + '\n';
                protocolNamespace += this._getMap() + '\n';
                protocolNamespace += this._getProtocolSignature() + '\n';
                protocolNamespace += '}\n';
                base = lints + greeting + protocolNamespace + base + '\n';
                base += this._getGlobalExport();
                base += this._getInitialization();
                resolve(base);
            }).catch((errors: Error[] | Error) => {
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
        if (Tools.getTypeOf(JSON.version) !== Tools.EPrimitiveTypes.string || JSON.version.trim() === '') {
            throw new Error(this._logger.error(`Root level of protocol should have property "version" {string}.`));
        }
        this._version = JSON.version;
        delete JSON.version;
        this._entities.root = {
            children: {},
            name: 'root',
            parent: null,
            request: false,
            single: true,
            type: EEntityType.root,
            value: JSON,
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

    private _restoreStructure(target: any) {
        const isRequest: boolean = this._isTargetRequest(target);
        if (isRequest) {
            target[this._requestFields.Request] === void 0 && (target[this._requestFields.Request] = {});
            target[this._requestFields.Response] === void 0 && (target[this._requestFields.Response] = {});
        }
        Object.keys(target).forEach((key: string) => {
             Tools.getTypeOf(target[key]) === Tools.EPrimitiveTypes.object && (this._restoreStructure(target[key]));
        });
    }

    private _getMap(): string {
        let output: string =
                    '\t/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n' +
                    `\t* Injection: map of references\n` +
                    '\t* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */\n';
        output += '\texport let ConvertedTypedEntitiesMap: {[key: string]: any} = {};\n';
        output += '\texport let ReferencesMap: {[key: string]: any} = {};\n';
        output += `\texport function init(){\n`;
        Object.keys(this._map).forEach((signature: string) => {
            output += `\t\tReferencesMap["${signature}"] = ${this._map[signature]};\n`;
        });
        output += `\t\tConvertedTypedEntitiesMap = convertTypesToStandard(TypedEntitiesMap);\n`;
        output += `\t}\n`;
        return output;
    }

    private _getProtocolSignature(): string {
        let signature: string = this._version;
        Object.keys(this._map).forEach((entitySignature: string) => {
            signature += entitySignature;
        });
        signature = Tools.hash(signature, true);
        let output: string =
                    '\t/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n' +
                    `\t* Injection: protocol signature\n` +
                    '\t* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */\n';
        output += '\texport function getSignature() {\n';
        output += `\t\treturn "${signature}";\n`;
        output += `\t}\n`;
        return output;
    }

    private _getInitialization(): string {
        let output: string =
                    '/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n' +
                    `* Injection: initialization\n` +
                    '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */\n';
        output += 'Protocol.init();\n';
        return output;
    }

    private _getGlobalExport(): string {
        let output: string =
                    '/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n' +
                    `* Injection: export from Protocol namespace\n` +
                    '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */\n';
        output += 'export type TProtocolTypes = Protocol.TTypes;\n';
        output += 'export const parse = Protocol.parse;\n';
        output += 'export const parseFrom = Protocol.parseFrom;\n';
        output += 'export const stringify = Protocol.stringify;\n';
        output += 'export const getSignature = Protocol.getSignature;\n';
        output += 'export interface IClass { getSignature: () => string; parse: (str: string | object) => any; }\n';
        output += 'export interface IImplementation { getSignature: () => string; stringify: () => string | Uint8Array; }\n';
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
            output += `\t\t${this._map[signature]}${index !== count - 1 ? ' |' : ';'}\n`;
        });
        return output;
    }

    private _getEntities(parent: IEntity, target: any) {
        // Check name conflicts
        Object.keys(target).forEach((prop: string) => {
            const name: string = this._entityType.serializeName(prop);
            if (name === parent.name) {
                throw new Error(this._logger.error(`Parent enitity "${parent.name}" has nested definition with name "${prop}". Use other name for nested definition.`));
            }
        });
        // Proceed entities walking
        Object.keys(target).forEach((prop: string) => {
            const value: any = target[prop];
            const type: EEntityType | Error[] = this._entityType.getType(prop, value);
            if (type instanceof Array) {
                throw new Error(this._logger.error(`Error converting: \n ${type.map((error: Error) => error.message).join('\n')}`));
            }
            if (parent.children[prop] !== void 0) {
                throw new Error(this._logger.error(`Prop "${prop}" is defined twice.`));
            }
            parent.children[prop] = {
                children: {},
                name: this._entityType.serializeName(prop),
                parent: parent,
                request: this._isTargetRequest(value),
                single: this._entityType.isSingle(prop),
                type: type,
                value: value,
            };
            switch (type) {
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

    private _validateEntities(entity: IEntity) {
        Object.keys(entity.children).forEach((prop) => {
            const target: IEntity = entity.children[prop];
            const ref: string = target.value;
            if (entity.parent === null) {
                return this._validateEntities(target);
            }
            if (entity.request && entity.children.Responses !== void 0) {
                if (!(entity.children.Responses.value instanceof Array)) {
                    throw new Error(`Field "Responses" is reserved. Value can be only string[]. Check prop "${entity.name}".`);
                }
                entity.children.Responses.value.forEach((childRef: string) => {
                    const childRefImpl: string = this._findRefImpl(entity, childRef);
                    if (childRefImpl === '') {
                        throw new Error(this._logger.error(`Cannot find definition for "${childRef}". Define "${childRef}" on root level or on parent levels of "${entity.name}".`));
                    }
                });
            }
            if (target.type !== EEntityType.reference) {
                return this._validateEntities(target);
            }
            // Check reference implementation
            const refImpl: string = this._findRefImpl(entity, ref);
            if (refImpl === '') {
                throw new Error(this._logger.error(`Cannot find definition for "${ref}". Define "${ref}" on root level or on parent levels of "${entity.name}".`));
            }
            this._validateEntities(target);
        });
    }

    private _findEntityWithRefImpl(entity: IEntity, ref: string): IEntity | undefined {
        const _ref: string = `@${ref}`;
        if (entity.children[ref] === void 0 && entity.children[_ref] === void 0) {
            if (entity.parent !== null) {
                return this._findEntityWithRefImpl(entity.parent, ref);
            }
            return undefined;
        }
        return entity;
    }

    private _findEntityByPath(path: string): IEntity | undefined {
        const parts = path.split('.');
        let entity: IEntity | undefined = this._entities.root;
        parts.forEach((part: string) => {
            if (entity === undefined || entity.children === void 0 || (entity.children[part] === void 0 && entity.children[`@${part}`] === void 0)) {
                entity = undefined;
                return;
            }
            entity = entity.children[part] !== void 0 ? entity.children[part] : entity.children[`@${part}`];
        });
        return entity;
    }

    private _getPathToRef(parent: IEntity, path: string[] = []): string {
        parent.type !== EEntityType.root && path.unshift(parent.name);
        if (parent.parent !== null) {
            this._getPathToRef(parent.parent, path);
        }
        return path.join('.');
    }

    private _findRefImpl(parent: IEntity, ref: string): string {
        const entity: IEntity | undefined = this._findEntityWithRefImpl(parent, ref);
        if (entity === undefined) {
            return '';
        }
        if (entity.type === EEntityType.root) {
            // Implementation of reference on root level - don't need full path
            return ref;
        }
        const path: string = this._getPathToRef(entity);
        return path === '' ? ref : `${path}.${ref}`;
    }

    private _getClassConstructor(entity: IEntity, deep: number = 0): string {
        const tab = '\t'.repeat(deep);
        const nested = '\t'.repeat(deep + 1);
        let output: string = '';
        const ownArgs: IArgument[] = this._getOwnArguments(entity);
        const parentArgs: IArgument[] = entity.parent !== null ? (!entity.single ? this._getParentsArguments(entity.parent) : []) : [];
        const args: IArgument[] = [];
        args.push(...parentArgs);
        args.push(...ownArgs);
        // Check conflicts
        ownArgs.forEach((ownArg: IArgument) => {
            parentArgs.forEach((parentArg: IArgument) => {
                if (ownArg.name === parentArg.name) {
                    throw new Error(`Conflict. Property "${entity.name}" has definition for "${ownArg.name}", but this field is already defined on parent's level.`);
                }
            });
        });
        // Build class
        if (args.length === 0) {
            output += `\n${tab}constructor() {`;
        } else {
            output += `\n${tab}constructor(args: { ${args.map((arg: IArgument) => `${arg.name + (arg.optional ? '?' : '')}: ${arg.tsType}`).join(', ')} }) {`;
        }
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
        output += `\n`;
        if (args.length > 0) {
            output += `${nested}const errors: Error[] = Protocol.validateParams(args, ${entity.name});\n`;
            output += `${nested}if (errors.length > 0) {\n`;
            output += `${nested}\tthrow new Error(\`Cannot create class of "${entity.name}" due error(s):\\n\${errors.map((error: Error) => { return \`\\t- \${error.message}\`; }).join('\\n')}\`);\n`;
            output += `${nested}}\n`;
        }
        output += `\n${tab}}\n`;
        return output;
    }

    private _getOwnArguments(entity: IEntity): IArgument[] {
        const args: IArgument[] = [];
        Object.keys(entity.children).forEach((key: string) => {
            const target: IEntity = entity.children[key];
            switch (target.type) {
                case EEntityType.primitive:
                    const type = this._entityType.getTypes()[target.value];
                    args.push({
                        name: target.name.replace(/\?/gi, ''),
                        optional: target.name.indexOf('?') !== -1,
                        protoType: target.value,
                        tsType: this._entityType.getTypes()[target.value].tsType,
                        type: target.type,

                    });
                    break;
                case EEntityType.reference:
                    args.push({
                        name: target.name.replace(/\?/gi, ''),
                        optional: target.name.indexOf('?') !== -1,
                        protoType: target.value,
                        tsType: this._findRefImpl(target.parent as IEntity, target.value),
                        type: target.type,
                    });
                    break;
                case EEntityType.repeated:
                    const typeAlias: string = this._entityType.getRepeatedType(target.value);
                    let tsType = '';
                    if (this._entityType.isPrimitive(typeAlias)) {
                        tsType = this._entityType.getTypes()[typeAlias].tsType;
                    } else {
                        tsType = this._findRefImpl(target.parent as IEntity, typeAlias);
                    }
                    args.push({
                        name: target.name.replace(/\?/gi, ''),
                        optional: target.name.indexOf('?') !== -1,
                        protoType: target.value,
                        tsType: `Array<${tsType}>`,
                        type: target.type,
                    });
                    break;
            }
        });
        return args;
    }

    private _getParentsArguments(parent: IEntity): IArgument[] {
        const args: IArgument[] = [];
        switch (parent.type) {
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
        const signature: string = entity.name;
        return (entity.parent !== null ? (entity.parent.type !== EEntityType.root ? `${this._getClassChain(entity.parent)}.` : '') : '') + signature;
    }

    private _getClassImplementation(entity: IEntity, deep: number = 0): string {
        let output: string = '';
        const tab = '\t'.repeat(deep);
        const exttab = '\t'.repeat(deep + 1);
        const extended: string = (entity.parent !== null ? (entity.parent.type !== EEntityType.root ? ` extends ${entity.parent.name}` : ' extends Protocol.Root') : '');
        // Open class
        output += `${tab}export class ${entity.name}${entity.single ? ' extends Protocol.Root' : extended} {\n`;
        // Define signature
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
        // Define extractor
        output += `${exttab}static parse(str: string | object): Protocol.TTypes | Error {\n`;
        output += `${exttab}\treturn Protocol.parse(str, ${entity.name});\n`;
        output += `${exttab}}\n`;
        // Define stringify
        output += `${exttab}public stringify(): string {\n`;
        output += `${exttab}\treturn Protocol.stringify(this, ${entity.name}) as string;\n`;
        output += `${exttab}}\n`;
        // Save signature
        if (this._map[signature] !== void 0) {
            throw new Error(this._logger.error(`Signature (${signature}) for "${entity.name}" already exsist. Cannot continue converting.`));
        }
        this._map[signature] = chain;
        // Create keys map
        this._setKeysMap(entity, signature);
        // Create json/typed map
        this._setTypedMap(entity, signature);
        // Define properties
        Object.keys(entity.children).forEach((prop: string) => {
            const child: IEntity = entity.children[prop];
            switch (child.type) {
                case EEntityType.primitive:
                case EEntityType.reference:
                case EEntityType.repeated:
                    output += this._getImplementation(child, deep + 1);
                    break;
            }
        });
        // Add constructor
        output += this._getClassConstructor(entity, deep + 1);
        output += `${tab}}\n`;
        // Close class
        return output;
    }

    private _getDescriptionEntity(entity: IEntity, deep: number = 0): string {
        const tab = '\t'.repeat(deep);
        const ownArgs: IArgument[] = this._getOwnArguments(entity);
        const parentArgs: IArgument[] = entity.parent !== null ? (!entity.single ? this._getParentsArguments(entity.parent) : []) : [];
        const args: IArgument[] = [];
        args.push(...parentArgs);
        args.push(...ownArgs);
        let output: string = `${tab}static getDescription(): {[key: string]: Protocol.IProperty } {\n`;
        output += `${tab}\treturn {\n`;
        args.forEach((arg: IArgument) => {
            const name: string = this._entityType.hardSerializeName(arg.name);
            switch (arg.type) {
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
                    let repeatedType: string = this._entityType.getRepeatedType(arg.protoType);
                    repeatedType = this._entityType.isPrimitive(repeatedType) ? `"${repeatedType}"` : this._entityType.getRepeatedType(arg.tsType);
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

    private _getTypedMap(target?: {[key: string]: any}, deep: number = 1, signature?: string) {
        let output: string = '';
        const tab = '\t'.repeat(deep);
        if (target === undefined) {
            output =
            `${tab}/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n` +
            `${tab}* Injection: typed map\n` +
            `${tab}* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */\n` +
            `${tab}export const TypedEntitiesMap: {[key: string]: any} = {\n`;
            Object.keys(this._typedMap).forEach((signatureKey: string) => {
                const map = this._typedMap[signatureKey];
                output += `${tab}\t"${signatureKey}": {\n`;
                Object.keys(map).forEach((key: string) => {
                    let value = map[key];
                    if (typeof value === 'string') {
                        output += `${tab}\t\t${key}: "${value}",\n`;
                    } else if (value instanceof Array && value.length === 1) {
                        value = value[0];
                        if (typeof value === 'string') {
                            output += `${tab}\t\t${key}: ["${value}"],\n`;
                        } else if (typeof value === 'object' && value !== null && !(value instanceof Array)) {
                            output += `${tab}\t\t${key}: [${this._getTypedMap(value, deep + 1, signatureKey)}],\n`;
                        } else {
                            throw new Error(`Unsupported type is detected or incorrect structure. Check name: ${key} for signature ${signatureKey}.`);
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        output += `${tab}\t\t${key}: ${this._getTypedMap(value, deep + 1, signatureKey)},\n`;
                    } else {
                        throw new Error(`Unsupported type is detected or incorrect structure. Check name: ${key} for signature ${signatureKey}.`);
                    }
                });
                output += `${tab}\t},\n`;
            });
            output += `${tab}};\n`;
        } else if (target !== undefined) {
            output = `{\n`;
            Object.keys(target).forEach((key: string) => {
                let value = target[key];
                if (typeof value === 'string') {
                    output += `${tab}\t\t${key}: "${value}",\n`;
                } else if (value instanceof Array && value.length === 1) {
                    value = value[0];
                    if (typeof value === 'string') {
                        output += `${tab}\t\t${key}: ["${value}"],\n`;
                    } else if (typeof value === 'object' && value !== null && !(value instanceof Array)) {
                        output += `${tab}\t\t${key}: [${this._getTypedMap(value, deep + 1, signature)}],\n`;
                    } else {
                        throw new Error(`Unsupported type is detected or incorrect structure. Check name: ${key} for signature ${signature}.`);
                    }
                } else if (typeof value === 'object' && value !== null) {
                    output += `${tab}\t\t${key}: ${this._getTypedMap(value, deep + 1, signature)},\n`;
                } else {
                    throw new Error(`Unsupported type is detected or incorrect structure. Check name: ${key} for signature ${signature}.`);
                }
            });
            output += `${tab}\t}`;
        }
        return output;
    }

    private _setTypedMap(entity: IEntity, signature: string) {
        this._typedMap[signature] = this._getEntityTypedMap(entity);
    }

    private _getEntityTypedMap(entity: IEntity): { [key: string]: any } {
        const chain: string = this._getClassChain(entity);
        const signature: string = Tools.hash(`${this._version}:${chain}`, true);
        const map: any = {};
        const ownArgs: IArgument[] = this._getOwnArguments(entity);
        const parentArgs: IArgument[] = entity.parent !== null ? (!entity.single ? this._getParentsArguments(entity.parent) : []) : [];
        const args: IArgument[] = [];
        if (this._keysMapLeft[signature] === undefined) {
            this._setKeysMap(entity, signature);
        }
        const propsAliases = this._keysMapLeft[signature];
        if (propsAliases === undefined) {
            throw new Error(`Fail to find keys map for "${signature}"`);
        }
        args.push(...parentArgs);
        args.push(...ownArgs);
        args.forEach((arg: IArgument) => {
            const name: string = this._entityType.hardSerializeName(arg.name);
            const nameAlias: string = propsAliases[name];
            let refEntity: IEntity | undefined;
            switch (arg.type) {
                case EEntityType.class:
                case EEntityType.complex:
                case EEntityType.namespace:
                case EEntityType.reference:
                    refEntity = this._findEntityByPath(arg.tsType);
                    if (refEntity === undefined) {
                        refEntity = this._findEntityByPath(arg.tsType);
                        throw new Error(`[reference] Cannot find reference for "${name}". Reference: "${arg.tsType}"`);
                    }
                    if (refEntity.type === EEntityType.enum) {
                        map[nameAlias] = 'string';
                    } else {
                        map[nameAlias] = this._getEntityTypedMap(refEntity);
                    }
                    break;
                case EEntityType.primitive:
                    map[nameAlias] = arg.protoType;
                    break;
                case EEntityType.repeated:
                    let repeatedType: string = this._entityType.getRepeatedType(arg.protoType);
                    if (this._entityType.isPrimitive(repeatedType)) {
                        map[nameAlias] = [repeatedType];
                    } else {
                        repeatedType = this._entityType.getRepeatedType(arg.tsType);
                        refEntity = this._findEntityByPath(repeatedType);
                        if (refEntity === undefined) {
                            throw new Error(`[repeated] Cannot find reference for "${name}". Reference: "${repeatedType}"`);
                        }
                        if (refEntity.type === EEntityType.enum) {
                            map[nameAlias] = ['string'];
                        } else {
                            map[nameAlias] = [this._getEntityTypedMap(refEntity)];
                        }
                    }
                    break;
                case EEntityType.enum:
                    map[nameAlias] = ['string'];
                    break;
            }
        });
        return map;
    }

    private _setKeysMap(entity: IEntity, signature: string) {
        if (this._keysMapLeft[signature] !== undefined && this._keysMapRight[signature] !== undefined) {
            return;
        }
        const index = {
            l: 97,
            n: 0,
        };
        let cache: any = {};
        function next(): string {
            const key = `${String.fromCharCode(index.l)}${index.n === 0 ? '' : index.n}`;
            if (cache[String.fromCharCode(index.l)] === void 0) {
                cache[String.fromCharCode(index.l)] = true;
                return key;
            }
            if (index.l < 122 && index.l >= 97) {
                index.l += 1;
            } else if (index.l < 90 && index.l >= 65) {
                index.l += 1;
            } else if (index.l === 122) {
                index.n += 1;
                index.l = 65;
            } else if (index.l === 90) {
                index.l = 97;
            }
            return next();
        }
        const ownArgs: IArgument[] = this._getOwnArguments(entity);
        const parentArgs: IArgument[] = entity.parent !== null ? (!entity.single ? this._getParentsArguments(entity.parent) : []) : [];
        const args: IArgument[] = [];
        args.push(...parentArgs);
        args.push(...ownArgs);
        const keyMapLeft: any = {};
        const keyMapRight: any = {};
        args.forEach((arg: IArgument) => {
            const name: string = this._entityType.hardSerializeName(arg.name);
            switch (arg.type) {
                case EEntityType.class:
                case EEntityType.complex:
                case EEntityType.namespace:
                case EEntityType.reference:
                case EEntityType.primitive:
                case EEntityType.repeated:
                    keyMapLeft[name] = next();
                    keyMapRight[keyMapLeft[name]] = name;
                    break;
                case EEntityType.enum:
                    break;
            }
        });
        cache = null;
        this._keysMapLeft[signature] === undefined && (this._keysMapLeft[signature] = keyMapLeft);
        this._keysMapRight[signature] === undefined && (this._keysMapRight[signature] = keyMapRight);
    }

    private _getKeysMaps(): string {
        let output: string =
        '\t/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n' +
        `\t* Injection: map of types\n` +
        '\t* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */\n';
        output += '\texport const KeysMapLeft: {[key: string]: any} = {\n';
        Object.keys(this._keysMapLeft).forEach((signature: string) => {
            const map = this._keysMapLeft[signature];
            output += `\t\t"${signature}": {\n`;
            Object.keys(map).forEach((key: string) => {
                output += `\t\t\t${key}: "${map[key]}",\n`;
            });
            output += `\t\t},\n`;
        });
        output += '\t};\n';
        output += '\texport const KeysMapRight: {[key: string]: any} = {\n';
        Object.keys(this._keysMapLeft).forEach((signature: string) => {
            const map = this._keysMapLeft[signature];
            output += `\t\t"${signature}": {\n`;
            Object.keys(map).forEach((key: string) => {
                output += `\t\t\t${map[key]}: "${key}",\n`;
            });
            output += `\t\t},\n`;
        });
        output += '\t};';
        return output;
    }

    private _getImplementation(entity: IEntity, deep: number = 0): string {
        let output: string = '';
        const tab = '\t'.repeat(deep);
        const exttab = '\t'.repeat(deep + 1);
        switch (entity.type) {
            case EEntityType.root:
                Object.keys(entity.children).forEach((prop: string) => {
                    const child: IEntity = entity.children[prop];
                    output += this._getImplementation(child, deep);
                });
                break;
            case EEntityType.class:
                // Open class
                output += this._getClassImplementation(entity, deep);
                // Close class
                break;
            case EEntityType.complex:
                // Open class
                output += this._getClassImplementation(entity, deep);
                // Close class
                // Open namespace
                output += `${tab}export namespace ${entity.name} {\n`;
                Object.keys(entity.children).forEach((prop: string) => {
                    const child: IEntity = entity.children[prop];
                    if (child.type === EEntityType.enum) {
                        output += this._getImplementation(child, deep + 1);
                    }
                });
                // Close namespace
                output += `${tab}}\n`;
                break;
            case EEntityType.namespace:
                // Open class
                output += this._getClassImplementation(entity, deep);
                // Close class
                // Open namespace
                output += `${tab}export namespace ${entity.name} {\n`;
                Object.keys(entity.children).forEach((prop: string) => {
                    const child: IEntity = entity.children[prop];
                    if (child.type !== EEntityType.primitive && child.type !== EEntityType.reference && child.type !== EEntityType.repeated) {
                        output += this._getImplementation(child, deep + 1);
                    }
                });
                if (entity.request) {
                    // Add type description for request
                    const responses: string[] = ['Response'];
                    entity.children.Responses !== void 0 && responses.push(...entity.children.Responses.value);
                    output += `${exttab}type TResponses = ${responses.join(' | ')};\n`;
                }
                // Close namespace
                output += `${tab}}\n`;
                break;
            case EEntityType.primitive:
                const type = this._entityType.getTypes()[entity.value];
                output += `${tab}public ${entity.name}: ${type.tsType} = ${type.init};\n`;
                break;
            case EEntityType.reference:
                output += `${tab}public ${entity.name}: ${this._findRefImpl(entity.parent as IEntity, entity.value)};\n`;
                break;
            case EEntityType.repeated:
                const typeAlias: string = this._entityType.getRepeatedType(entity.value);
                let tsType = '';
                if (this._entityType.isPrimitive(typeAlias)) {
                    tsType = this._entityType.getTypes()[typeAlias].tsType;
                } else {
                    tsType = this._findRefImpl(entity.parent as IEntity, typeAlias);
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
