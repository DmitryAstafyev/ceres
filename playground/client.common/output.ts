export class Output {
    private node: HTMLElement | null = null;
    private _clientName: string = '';

    constructor(clientName: string) {
        this._clientName = clientName;
        this._setTargetNode();
    }

    _setTargetNode() {
        if (this.node === null) {
            this._createLayout();
        }
        this.node = document.querySelector('#output');
    }

    _createLayout() {
        const output = document.createElement('div');
        output.id = 'output';
        output.className = 'output';
        const clientName = document.createElement('div');
        clientName.id = 'client-name';
        clientName.className = 'client-name';
        clientName.innerHTML = this._clientName;
        document.body.appendChild(output);
        document.body.appendChild(clientName);
    }

    _serialize(str: string){
        if (typeof str !== 'string') {
            return '';
        }
        return str.replace(/</gi, '&lt').replace(/>/gi, '&gt');
    }

    _willScrollDown(): boolean {
        if (this.node === null) {
            return false;
        }
        const top: number = this.node.scrollTop;
        const size = this.node.getBoundingClientRect();
        const height: number = size.height;
        const scrollHeight: number = this.node.scrollHeight;
        if (scrollHeight <= height) {
            return false;
        }
        return height + top >= (scrollHeight - 10);
    }

    _scrollDown() {
        if (this.node === null) {
            return false;
        }
        this.node.scrollTo(0, this.node.scrollHeight);
    }

    add(str: string, style?: any) {
        this._setTargetNode();
        if (this.node !== null) {
            const scrollDown = this._willScrollDown();
            const p = document.createElement('P');
            p.innerHTML = `${(new Date).toTimeString()}: ${this._serialize(str)}`;
            Object.assign(p.style, style);
            this.node.appendChild(p);
            scrollDown && this._scrollDown();
        }
    }
}
