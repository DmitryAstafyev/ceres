export class SubdomainsController {

    public static getMask(url: string): string | null | Error {
        const match = url.match(/\{.*\}/gi);
        if (match === null) {
            return null;
        }
        if (match.length !== 1) {
            return new Error(`Incorrect format of URL. Example of using mask: "http://{sub1,sub2,sub3}.domain", "http://{sub[1..200]}.domain"`);
        }
        return match[0].replace(/[\{\}]/gi, '');
    }

    private _broadcast:     string = '';
    private _url:           string = '';
    private _subdomains:    string[] = [];
    private _state:         { [key: string]: number } = {};
    private _own:           { [key: string]: number } = {};
    private _channel:       BroadcastChannel;

    constructor(url: string, mask: string, broadcast: string) {
        this._url = url;
        this._broadcast = broadcast;
        const subdomains = this._getList(mask);
        if (subdomains instanceof Error) {
            throw subdomains;
        }
        this._subdomains = subdomains;
        this._channel = new BroadcastChannel(this._broadcast);
        this._onBoardcastMessage = this._onBoardcastMessage.bind(this);
        this._bind();
        this._synchState();
    }

    public destroy() {
        this._subdomains = [];
        this._state = {};
        this._channel.close();
        this._unbind();
    }

    public setBusy(url: string) {
        this._state[url] = (new Date()).getTime();
        this._own[url] = (new Date()).getTime();
        this._channel.postMessage({ busy: [url] });
    }

    public setFree(url: string) {
        delete this._state[url];
        delete this._own[url];
        this._channel.postMessage({ free: [url] });
    }

    public get(): string {
        // First get random
        let url: string = this._getRandom();
        if (this._state[url] === void 0 && this._own[url] === void 0) {
            return url;
        }
        // If random busy - get any first free
        for (let i = this._subdomains.length - 1; i >= 0; i -= 1) {
            if (this._state[this._subdomains[i]] === void 0 && this._own[this._subdomains[i]] === void 0) {
                url = this._subdomains[i];
                break;
            }
        }
        return url !== '' ? url : this._subdomains[0];
    }

    private _bind() {
        this._channel.onmessage = this._onBoardcastMessage;
    }

    private _unbind() {
        this._channel.onmessage = () => void 0;
    }

    private _synchState() {
        this._channel.postMessage({ getBusy: true });
    }

    private _getRandom(): string {
        return this._subdomains[Math.floor(Math.random() * (this._subdomains.length - 1))];
    }

    private _onBoardcastMessage(event: MessageEvent) {
        if (typeof event !== 'object' || event === null) {
            return;
        }
        if (typeof event.data !== 'object' || event.data === null) {
            return;
        }
        const data = event.data;
        data.busy instanceof Array && data.busy.forEach((url: string) => {
            this._state[url] = (new Date()).getTime();
        });
        data.free instanceof Array && data.free.forEach((url: string) => {
            delete this._state[url];
        });
        data.getBusy && this._channel.postMessage({ busy: Object.keys(this._own).map((url: string) => {
            return url;
        })});
    }

    private _getUrl(subdomain: string): string {
        return this._url.replace(/\{.*\}/gi, subdomain);
    }

    private _getList(mask: string): string[] | Error {
        if (mask.split(',').length > 1) {
            return mask.split(',').map((sub: string) => {
                return sub.trim();
            }).filter((sub) => {
                return sub !== '';
            }).map((sub: string) => {
                return this._getUrl(sub);
            });
        }
        if (mask.indexOf('[') !== -1 && mask.indexOf(']') !== -1) {
            const match = mask.match(/\[\d{1,}\.\.\d{1,}\]/gi);
            const base = mask.replace(/\[\d{1,}\.\.\d{1,}\]/gi, '');
            if (match === null || match.length !== 1 || base.replace(/[\w\d\-\.]/gi, '').length > 0) {
                return new Error(`Bad format of sub domain mask: ${mask}. Example of expected mask: "prefix[1..200]".`);
            }
            const range = match[0].replace(/[\[\]]/gi, '').split('..');
            if (range.length !== 2) {
                return new Error(`Bad format of sub domain mask: ${mask}. Example of expected mask: "prefix[1..200]".`);
            }
            const list: string[] = [];
            let s: number;
            let e: number;
            if (range[0] < range[1]) {
                s = parseInt(range[0], 10);
                e = parseInt(range[1], 10);
            } else {
                s = parseInt(range[1], 10);
                e = parseInt(range[0], 10);
            }
            for (let i = e; i >= s; i -= 1) {
                list.push(this._getUrl(`${base}${i}`));
            }
            return list;
        }
        return new Error(`Unsupported sub domain mask: ${mask}. Example of expected mask: "prefix[1..200]" or "sub1,sub2,sub3,sub4".`);
    }
}
