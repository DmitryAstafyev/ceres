export enum EIndicatorState {
    pending = 'pedning',
    success = 'success',
    fail = 'fail'
} 

type TIndicator = {
    node: HTMLElement,
    count: number,
    state: EIndicatorState,
    caption: string,
    mount: boolean
}

export class Indicators {

    static States = EIndicatorState;

    private node: HTMLElement | null = null;
    private indicators: Map<string, TIndicator> = new Map();

    constructor() {
        this._setTargetNode();
    }

    private _setTargetNode() {
        if (this.node === null) {
            this._createLayout();
        }
        this.node = document.querySelector('#indicators');
    }

    private _createLayout() {
        if (document.body === null) {
            return;
        }
        const indicators = document.createElement('ul');
        indicators.id = 'indicators';
        indicators.className = 'indicators';
        document.body.appendChild(indicators);
        this.node = indicators;
        this.indicators.forEach((indicator: TIndicator, id: string) => {
            this.indicators.set(id, this.mount(indicator));
        });
    }

    private mount(indicator: TIndicator): TIndicator{
        if (this.node === null) {
            return indicator;
        }
        if (indicator.mount) {
            return indicator;
        }
        this.node.appendChild(indicator.node);
        indicator.mount = true;
        return indicator;
    }

    add(id: string, caption: string) {
        if (this.indicators.get(id) !== undefined) {
            return;
        }
        this._setTargetNode();
        const li = document.createElement('li');
        li.innerHTML = `${this.getState(EIndicatorState.pending)}<span class="caption">${caption}</span><span class="count">: 0</span>`
        this.node !== null && this.node.appendChild(li);
        this.indicators.set(id, {
            caption: caption,
            count: 0,
            node: li,
            state: EIndicatorState.pending,
            mount: this.node !== null
        });
    }

    increase(id: string) {
        this._setTargetNode();
        const indicator = this.indicators.get(id);
        if (typeof indicator === 'undefined') {
            return;
        }
        indicator.count = indicator.count + 1;
        this.indicators.set(id, indicator);
        indicator.node.innerHTML = `${this.getState(indicator.state)}<span class="caption">${indicator.caption}</span><span class="count">: ${indicator.count}</span>`;
    }

    state(id: string, state: EIndicatorState) {
        this._setTargetNode();
        const indicator = this.indicators.get(id);
        if (typeof indicator === 'undefined') {
            return;
        }
        indicator.state = state;
        this.indicators.set(id, indicator);
        indicator.node.innerHTML = `${this.getState(indicator.state)}<span class="caption">${indicator.caption}</span><span class="count">: ${indicator.count}</span>`;
    }

    private getState(state: EIndicatorState) {
        switch (state) {
            case EIndicatorState.pending: 
                return '<span class="state" style="color: rgb(170,170,170)">[pending]</span>';
            case EIndicatorState.fail: 
                return '<span class="state" style="color: rgb(255,0,0)">[fail]</span>';
            case EIndicatorState.success: 
                return '<span class="state" style="color: rgb(0,255,0)">[success]</span>';
        }
    }

}


