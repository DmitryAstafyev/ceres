

export class Switcher {

    public static Transports = {
        longpoll: 'longpoll',
        ws: 'ws'
    };

    private _onSwitchHandler: (transport: string) => any

    constructor(onSwitchHandler: (transport: string) => any) {
        this._onSwitchHandler = onSwitchHandler;
        this._createLayout();
    }

    _createLayout() {
        if (document.body === null) {
            return setTimeout(() => {
                this._createLayout();
            }, 150);
        }
        const holder = document.createElement('div');
        holder.id = 'switcher';
        holder.className = 'switcher';
        const buttons = {
            longpoll: document.createElement('div'),
            ws: document.createElement('div'),
        };
        buttons.longpoll.id = 'button.longpoll';
        buttons.ws.id = 'button.ws';
        buttons.longpoll.className = 'button longpoll';
        buttons.ws.className = 'button ws';
        buttons.longpoll.innerHTML = 'LongPoll';
        buttons.ws.innerHTML = 'WS';
        holder.appendChild(buttons.longpoll);
        holder.appendChild(buttons.ws);
        document.body.appendChild(holder);
        buttons.longpoll.addEventListener('click', this._onSwitch.bind(this, Switcher.Transports.longpoll));
        buttons.ws.addEventListener('click', this._onSwitch.bind(this, Switcher.Transports.ws));
    }

    _onSwitch(transport: string) {
        this._onSwitchHandler(transport);
    }

}


