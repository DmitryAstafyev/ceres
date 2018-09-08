import * as FS from 'fs';
import * as Path from 'path';

const INJECTIONS_COMMENT_OUT = [
    { reg: /declare /g, replaceTo: '// declare ' }
];

export interface IInejection {
    content: string,
    file: string,
    path: string
}

export class Injections {

    private _serialize(content: string): string {
        INJECTIONS_COMMENT_OUT.forEach((toComment: { reg: RegExp, replaceTo: string}) => {
            content = content.replace(toComment.reg, toComment.replaceTo)
        });
        return content;
    }

    public get(files: Array<string>): Promise<Array<IInejection>> {
        return new Promise((resolve, reject) => {
            let errors: Array<Error> = [];
            //Check files
            files.forEach((file: string) => {
                if (!FS.existsSync(file)) {
                    errors.push(new Error(`Injectable file "${file}" doesn't exsist.`));
                }
            });
            if (errors.length > 0){
                return reject(errors);
            }
            let result: Array<IInejection> = [];
            //Read files
            Promise.all(files.map((file: string) => {
                return new Promise((resolve, reject) => {
                    FS.readFile(file, (error: Error, buffer: Buffer) => {
                        if (error) {
                            return reject(error);
                        }
                        result.push({
                            content: this._serialize(buffer.toString('utf8')),
                            file: Path.basename(file),
                            path: Path.dirname(file)
                        });
                        resolve();
                    });
                });
            }))
                .then(() => {
                    resolve(result);
                })
                .catch((error: Error) => {
                    reject(error);
                });
        });
    }
}