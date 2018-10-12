import * as FS from 'fs';
import * as Path from 'path';

const INJECTIONS_COMMENT_OUT = [
    { reg: /declare /g, replaceTo: '// declare ' },
];

export interface IInejection {
    content: string;
    file: string;
    path: string;
}

export class Injections {

    public get(files: string[]): Promise<IInejection[]> {
        return new Promise((resolve, reject) => {
            const errors: Error[] = [];
            // Check files
            files.forEach((file: string) => {
                if (!FS.existsSync(file)) {
                    errors.push(new Error(`Injectable file "${file}" doesn't exsist.`));
                }
            });
            if (errors.length > 0) {
                return reject(errors);
            }
            const result: IInejection[] = [];
            // Read files
            Promise.all(files.map((file: string) => {
                return new Promise((resolveFileTask, rejectFileTask) => {
                    FS.readFile(file, (error: Error, buffer: Buffer) => {
                        if (error) {
                            return rejectFileTask(error);
                        }
                        result.push({
                            content: this._serialize(buffer.toString('utf8')),
                            file: Path.basename(file),
                            path: Path.dirname(file),
                        });
                        resolveFileTask();
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

    private _serialize(content: string): string {
        INJECTIONS_COMMENT_OUT.forEach((toComment: { reg: RegExp, replaceTo: string}) => {
            content = content.replace(toComment.reg, toComment.replaceTo);
        });
        return content;
    }

}
