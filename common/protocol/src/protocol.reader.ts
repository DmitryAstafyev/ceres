import * as Tools from '../../platform/tools/index';
import * as FS from 'fs';
import * as Path from 'path';

const logger: Tools.Logger = new Tools.Logger('ProtocolFileLoader');

export class Reader {

    private _path: string = '';

    public read(file: string): Promise<any>{
        return new Promise((resolve, reject) => {
            if (this._path === '') {
                this._path = Path.dirname(file);
            }
            if (Tools.getTypeOf(file) !== Tools.EPrimitiveTypes.string || file.trim() === '') {
                return reject(new Error(logger.error(`Wrong format of filename.`)));
            }
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

                this._getNested(json).then(resolve).catch(reject);

            });
        });
    }

    private _getNested(json: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (Tools.getTypeOf(json) !== Tools.EPrimitiveTypes.object) {
                return reject(new Error(`Target isn't an object.`));
            }
            const promises: Array<Promise<any>> = [];
            Object.keys(json).forEach((key: string) => {
                const value: any = json[key];
                if (Tools.getTypeOf(value) === Tools.EPrimitiveTypes.object) {
                    promises.push(this._getNested(value).then((nested: any) => {
                        json[key] = nested;
                    }));
                }
                if (Tools.getTypeOf(value) === Tools.EPrimitiveTypes.string) {
                    if (key.indexOf(':findin') !== -1) {
                        const file: string = value;
                        const prop: string = key.replace(':findin', '');
                        delete json[key];
                        promises.push(this.read(Path.resolve(this._path, file)).then((nested: any) => {
                            json[prop] = nested;
                        }));
                    }
                }
            });
            Promise.all(promises).then(() => {
                resolve(json);
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    private _clearComments(str: string): string {
        return str.replace(/[\n\r]/gi, '').replace(/\/\*[^\*\/]*\*\//gi, '')
    }

    private _getJSONFromBuffer(buffer: Buffer): string | Error {
        try {
            return JSON.parse(
                this._clearComments(buffer.toString('utf8'))
            );
        } catch(e){
            return new Error(logger.error(`Error during parsing file: ${e.message}`));
        }
    }

}