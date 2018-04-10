import * as Tools from '../../platform/tools/index';
import * as FS from 'fs';
import { ProtocolJSONConvertor  } from './protocol.JSON.convertor';
import { Reader, IReaderResult  } from './protocol.reader';

const logger: Tools.Logger = new Tools.Logger('ProtocolBuilder');

export class Builder {

    private _file: string;

    constructor(file: string){
        if (Tools.getTypeOf(file) !== Tools.EPrimitiveTypes.string){
            throw new Error(logger.error(`Argument "file" should be a {string} type, but was gotten: ${Tools.inspect(file)}.`));
        }
        this._file = file;
    }

    public build(output: string): Promise<boolean> {
        if (Tools.getTypeOf(output) !== Tools.EPrimitiveTypes.string){
            throw new Error(logger.error(`Argument "output" should be a {string} type, but was gotten: ${Tools.inspect(output)}.`));
        }
        return new Promise((resolve, reject) => {
            const reader = new Reader(this._file);
            reader.read()
                .then((result: IReaderResult) => {
                    try {
                        const convertor = new ProtocolJSONConvertor(result.json);
                        if (FS.existsSync(output)){
                            return reject(new Error(logger.error(`File "${output}" already exists`)));
                        }
                        FS.writeFile(output, convertor.getImplementation(), (error) => {
                            if (error){
                                return reject(error);
                            }
                            return resolve(true);
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
        });
    }
}