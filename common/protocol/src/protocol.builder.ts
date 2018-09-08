import * as Tools from '../../platform/tools/index';
import * as FS from 'fs';
import { Reader } from './protocol.reader';
import { Convertor } from './protocol.convertor';

const logger: Tools.Logger = new Tools.Logger('ProtocolBuilder');

export class Builder {

    public build(source: string, dest: string, replace: boolean = false): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (Tools.getTypeOf(source) !== Tools.EPrimitiveTypes.string){
                return reject(new Error(logger.error(`Argument "source" should be a {string} type, but was gotten: ${Tools.inspect(source)}.`)));
            }
            if (Tools.getTypeOf(dest) !== Tools.EPrimitiveTypes.string){
                return reject(new Error(logger.error(`Argument "dest" should be a {string} type, but was gotten: ${Tools.inspect(dest)}.`)));
            }
            const reader = new Reader();
            reader.read(source)
                .then((json: any) => {
                    const convertor = new Convertor();
                    convertor.convert(json)
                        .then((str: string) => {
                            try {
                                if (FS.existsSync(dest) && replace){
                                    FS.unlinkSync(dest);
                                    logger.warn(`File "${dest}" exists. This file will be overwritten.`)
                                } else if (FS.existsSync(dest)){
                                    return reject(new Error(logger.error(`File "${dest}" already exists`)));
                                }
                                FS.writeFile(dest, str, (error) => {
                                    if (error){
                                        return reject(error);
                                    }
                                    return resolve(true);
                                });
                            } catch (error) {
                                reject(error);
                            }
                        })
                        .catch((error: Error) => {
                            reject(error);
                        });
                })
                .catch(reject);
        });
    }
}