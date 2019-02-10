
export interface IWritebleStreamCutted {
    write: (...args: any[]) => void;
}

export interface IArea {
    count: number;
    last: string;
}

const MOVE_UP = new Buffer('1b5b3141', 'hex').toString();
const MOVE_LEFT = new Buffer('1b5b3130303044', 'hex').toString();
const CLEAR_LINE = new Buffer('1b5b304b', 'hex').toString();

export class StdoutController {

    private _areas: Map<string, IArea> = new Map();
    private _stream: IWritebleStreamCutted;

    constructor(stream: IWritebleStreamCutted) {
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
        let clean: string = '';
        if (areasHeight > 0) {
            clean += (MOVE_LEFT + (MOVE_UP + CLEAR_LINE).repeat(areasHeight));
        }
        this._stream.write(`${clean}${content}`);
        if (areasHeight > 0) {
            this._redrawAreas();
        }
    }

    private _outArea(content: string, areaId: string) {
        const area: IArea | undefined = this._areas.get(areaId);
        let last: IArea;
        if (!area) {
            last = { last: '', count: 0 };
        } else {
            last = area;
        }
        const heightAfter: number = this._getHeightAfterArea(areaId);
        let clean: string = '';
        if (heightAfter > 0) {
            clean += (MOVE_UP + CLEAR_LINE).repeat(heightAfter);
        }
        if (last.count > 0) {
            clean += (MOVE_LEFT + (MOVE_UP + CLEAR_LINE).repeat(last.count - 1));
        }
        this._stream.write(`${clean}${content}`);
        if (heightAfter > 0) {
            this._redrawAreasAfter(areaId);
        }
        this._areas.set(areaId, {
            count: content.split(/[\n\r]/gi).length,
            last: content,
        });
    }

    private _redrawAreas() {
        let out: string = '';
        this._areas.forEach((area: IArea) => {
            out += area.last;
        });
        this._stream.write(out);
    }

    private _redrawAreasAfter(areaId: string) {
        let after: boolean = false;
        let out: string = '';
        this._areas.forEach((area: IArea, storedAreaId: string) => {
            if (after) {
                out += area.last;
            }
            if (areaId === storedAreaId) {
                after = true;
            }
        });
        this._stream.write(out);
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
