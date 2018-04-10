import * as Tools from '../../platform/tools/index';
import * as FS from 'fs';
import * as Path from 'path';
import { SCHEME                 } from './protocol.scheme.definitions';
import { ProtocolJSONConvertor  } from './protocol.JSON.convertor';

const logger: Tools.Logger = new Tools.Logger('ProtocolFileLoader');

export interface IReaderResult {
    json: any,
    body: any,
    className: string
};

export class Reader {

    private _file: string;
    private _path: string;

    constructor(file: string){
        if (Tools.getTypeOf(file) !== Tools.EPrimitiveTypes.string){
            throw new Error(logger.error(`Argument "file" should be a {string} type, but was gotten: ${Tools.inspect(file)}.`));
        }
        this._file = file;
        this._path = Path.dirname(this._file);
    }

    public read(file: string = ''): Promise<IReaderResult>{
        file = Tools.getTypeOf(file) === Tools.EPrimitiveTypes.string ? (file.trim() !== '' ? Path.join(this._path, file) : this._file) : this._file;
        return new Promise((resolve, reject) => {

            if (!FS.existsSync(file)) {
                return reject(new Error(logger.error(`File "${file}" doesn't exsist.`)));
            }

            FS.readFile(file, (error, buffer: Buffer) => {
                if (error) {
                  return reject(error);
                }
                
                let json: any = this._getJSONFromBuffer(buffer);

                if (json instanceof Error) {
                    reject(json);
                }

                this._validate(json).then(resolve).catch(reject);
            });
        });
    }

    private _getJSONFromBuffer(buffer: Buffer){
        let json = null;
        try {
            json = JSON.parse(buffer.toString('utf8'));
        } catch(e){
            json = new Error(logger.error(`Error during parsing file: ${e.message}`));
        }
        return json;
    }

    private _validate(json: any): Promise<IReaderResult> {
        return new Promise((resolve, reject) => {
            if (Tools.getTypeOf(json) !== Tools.EPrimitiveTypes.object){
                return reject(new Error(logger.error(`Target entity isn't an object.`)));
            }
            if (Object.keys(json).length !== 1){
                return reject(new Error(logger.error(`Expected on root level only one property - name of entity (class).`)));
            }
            const className = Object.keys(json)[0];
            let body = json[className];

            if (Tools.getTypeOf(body[SCHEME.ENTITY.default]) !== Tools.EPrimitiveTypes.object){
                return reject(new Error(logger.error(`Expected type of section "${SCHEME.ENTITY.default}": {object}, but gotten: ${Tools.getTypeOf(body[SCHEME.ENTITY.default])}`)));
            }
            let error: Error | null = null;
            Object.keys(body[SCHEME.ENTITY.default]).forEach((prop: string)=>{
                if (error !== null){
                    return;
                }
                const description = body[SCHEME.ENTITY.default][prop];
                if (Tools.getTypeOf(description) !== Tools.EPrimitiveTypes.object) {
                    error = new Error(logger.error(`Expected type of field "${prop}" in section "${SCHEME.ENTITY.default}": {object}, but gotten: ${Tools.getTypeOf(description)}`));
                }
            });
            if (error !== null){
                return reject(error);
            }
            let refs : {[key:string] : string} = {};
            Object.keys(body[SCHEME.ENTITY.default]).forEach((prop: string)=>{
                const description = body[SCHEME.ENTITY.default][prop];
                if (Tools.getTypeOf(description[SCHEME.FIELDS.findin]) === Tools.EPrimitiveTypes.string) {
                    refs[prop] = description[SCHEME.FIELDS.findin];
                }
            });
            if (Object.keys(refs).length === 0) {
                return resolve({
                    json: json,
                    className: className,
                    body: body
                } as IReaderResult);
            }
            Promise.all(Object.keys(refs).map((prop: string) => {
                return this.read(refs[prop])
                    .then((nested: IReaderResult)=>{
                        body[SCHEME.ENTITY.default][prop][SCHEME.TYPE_DEF.type] = nested.className;
                        if (body[SCHEME.ENTITY.definitions] === void 0){
                            body[SCHEME.ENTITY.definitions] = {};
                        }
                        body[SCHEME.ENTITY.definitions][nested.className] = nested.body;
                    });
            })).then(()=>{
                return resolve({
                    json: json,
                    className: className,
                    body: body
                } as IReaderResult);
            });
        });
    }
}