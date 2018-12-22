
const MOVE_LEFT = new Buffer('1b5b3130303044', 'hex').toString();
const MOVE_UP = new Buffer('1b5b3141', 'hex').toString();
const CLEAR_LINE = new Buffer('1b5b304b', 'hex').toString();
const OCT = new Buffer('1b', 'hex').toString();

type TLayoutId = string | symbol;
type TLauout = {
    rows: number;
    start: number;
};

class StdoutCursor {

    private stdout: NodeJS.WriteStream;

    constructor(stdout: NodeJS.WriteStream) {
        this.stdout = stdout;
    }

    public save() {
        this.stdout.write(`${OCT}[s`);
    }

    public restore() {
        this.stdout.write(`${OCT}[u`);
    }

    public clear() {
        this.stdout.write(`${OCT}[2J`);
    }

    public moveTo(row: number, column: number) {
        this.stdout.write(`${OCT}[${row};${column}H`);
    }

    public up(count: number) {
        this.stdout.write(`${OCT}[${count}A`);
    }

    public down(count: number) {
        this.stdout.write(`${OCT}[${count}B`);
    }

    public right(count: number) {
        this.stdout.write(`${OCT}[${count}C`);
    }

    public left(count: number) {
        this.stdout.write(`${OCT}[${count}D`);
    }

    public clearEnd() {
        this.stdout.write(`${OCT}[K`);
    }
}

const stdoutCursor = new StdoutCursor(process.stdout);
let index = 1;
setInterval(() => {
    index += 1;
    stdoutCursor.clear();
    stdoutCursor.moveTo(0, 0);
    process.stdout.write(`${index}`);
}, 1000);

process.stdout.write('12345678');
/*
class StdoutMonitor {

    private layouts: Map<TLayoutId, TLauout> = new Map();
    private row: number;

    public add(layout: TLayoutId, rows: number): Error | undefined {
        if (this.layouts.has(layout)) {
            return new Error(`Layout already created.`);
        }
        this.layouts.set(layout, { rows: rows, start: this._getStartRow() });
    }

    public update(layoutId: TLayoutId, msg: string | Buffer): Error | undefined {
        const layout = this.layouts.get(layoutId);
        if (layout === undefined) {
            return new Error(`Layout doesn't exist`);
        }

    }

    private _getStartRow(): number {
        let row: number = 0;
        this.layouts.forEach((layout: TLauout) => {
            row += layout.rows;
        });
        return row;
    }

}
*/