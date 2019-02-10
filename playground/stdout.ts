import { Writable } from 'stream';
export interface IArea {
    count: number;
    last: string;    
}

const MOVE_UP = new Buffer('1b5b3141', 'hex').toString();
const MOVE_LEFT = new Buffer('1b5b3130303044', 'hex').toString();
const CLEAR_LINE = new Buffer('1b5b304b', 'hex').toString();

export class StdoutController {

    private _areas: Map<string, IArea> = new Map();
    private _stream: Writable;

    constructor(stream: Writable) {
        this._stream = stream;
    }

    public out(content: string, areaId?: string): void {
        if (content.search(/[\n\r]$/gi) === -1) {
            content = `${content}\n`;
        }
        if (areaId) {
            this._outArea(content, areaId);
        } else {
            this._outStream(content);
        }
    }

    private _outStream(content: string) {
        const areasHeight: number = this._getAreasHeight();
        if (areasHeight > 0) {
            this._stream.write(MOVE_LEFT);
            for (let i = areasHeight; i > 0; i -= 1) {
                this._stream.write(CLEAR_LINE);
                this._stream.write(MOVE_UP);
            }
        }
        this._stream.write(content);
        if (areasHeight > 0) {
            this._redrawAreas();
        }
    }

    private _outArea(content: string, areaId: string) {
        let area: IArea | undefined = this._areas.get(areaId);
        let last: IArea;
        if (!area) {
            last = { last: '', count: 0 };
        } else {
            last = area;
        }
        const heightAfter: number = this._getHeightAfterArea(areaId);
        if (heightAfter > 0) {
            for (let i = heightAfter; i > 0; i -= 1) {
                this._stream.write(MOVE_UP);
                this._stream.write(CLEAR_LINE);
            }
        }
        if (last.count > 0) {
            this._stream.write(MOVE_LEFT);
            for (let i = last.count - 1; i > 0; i -= 1) {
                this._stream.write(MOVE_UP);
                this._stream.write(CLEAR_LINE);
            }
            
        }
        this._stream.write(content);
        if (heightAfter > 0) {
            this._redrawAreasAfter(areaId);
        }
        this._areas.set(areaId, {
            last: content,
            count: content.split(/[\n\r]/gi).length
        });
    }

    private _redrawAreas() {
        this._areas.forEach((area: IArea) => {
            this._stream.write(area.last);
        });
    }

    private _redrawAreasAfter(areaId: string) {
        let after: boolean = false;
        this._areas.forEach((area: IArea, storedAreaId: string) => {
            if (after) {
                this._stream.write(area.last);
            }
            if (areaId === storedAreaId) {
                after = true;
            }
        });
    }

    private _getAreasHeight(): number {
        let height: number = 0;
        this._areas.forEach((area: IArea) => {
            height += (area.count - 1);
        });
        return height;
    }

    private _getHeightAfterArea(areaId: string): number {
        let height: number = 0;
        let after: boolean = false;
        this._areas.forEach((area: IArea, storedAreaId: string) => {
            if (after) {
                height += (area.count - 1);
            }
            if (areaId === storedAreaId) {
                after = true;
            }
        });
        return height;
    }
}

const stdout = new StdoutController(process.stdout);

setInterval(() => {
    stdout.out(`[${Math.random().toFixed(8).repeat(Math.round(Math.random() * 10))}] Here is some content income in common area`);

}, Math.random() * 500 + 300);
setInterval(() => {
    stdout.out(`a) parameter: ${Math.random().toFixed(8)}\nb) parameter: ${Math.random().toFixed(8)}\nc) parameter: ${Math.random().toFixed(8)}\n`, 'one');
}, Math.random() * 1000 + 300);
setInterval(() => {
    stdout.out(`\t1) signal: ${Math.random().toFixed(8)}\n\t2) signal: ${Math.random().toFixed(8)}\n`, 'two');
}, Math.random() * 400 + 300);