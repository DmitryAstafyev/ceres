import * as Tools from '../../../platform/tools/index';
import * as FS from 'fs';

const logger: Tools.Logger = new Tools.Logger('ProtocolFileLoader');

export class Loader {

    private _file: string;

    constructor(file: string){
        if (Tools.getTypeOf(file) !== Tools.EPrimitiveTypes.string){
            throw new Error(logger.error(`Argument "file" should be a {string} type, but was gotten: ${Tools.inspect(file)}.`));
        }
        this._file = file;
    }

    public read(){
        return new Promise((resolve, reject) => {
            console.log('1');

            if (!FS.existsSync(this._file)) {
                return reject(new Error(logger.error(`File "${this._file}" doesn't exsist.`)));
            }
            console.log(this._file);

            FS.readFile(this._file, function(error, data) {
                console.log('3');
                if (error) {
                  return reject(error);
                }
                resolve(data);
            });
        });
    }
}
console.log('start');
const test = new Loader('./protocol.json');
test.read().then((data)=>{
    console.log(data);
}).catch((e)=>{
    console.log(e);
})
do {

}while(true);