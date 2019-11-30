// tslint:disable:object-literal-sort-keys
// tslint:disable:max-classes-per-file

interface IPropery<T> {
    set: (value: T) => Promise<void>;
    get: () => T | undefined;
    subscribe: (handler: (prev: T, cur: T) => void) => void;
    unsubscribe: () => void;
}

interface IMyCustomState {
    name: string;
}

enum EMyCustomState {
    name = 'name',
}

class State {

    private _state: IMyCustomState | undefined;

    protected _get<T>(prop: keyof IMyCustomState): T | undefined {
        if (this._state === undefined) {
            return undefined;
        }
        return (this._state[prop] as any) as T;
    }

    protected _set<T>(prop: string, value: T): Promise<void> {
        return new Promise(() => {
            //
        });
    }

    protected _subscribe<T>(prop: string, handler: (prev: T, cur: T) => void): void {
        //
    }

    protected _unsubscribe(prop: string): void {
        //
    }

}

class MyCustomState extends State {

    constructor() {
        super();
    }

    public name(): IPropery<string> {
        return {
            get: this._get.bind<MyCustomState, keyof IMyCustomState, string | undefined>(this, EMyCustomState.name),
            set: this._set.bind<MyCustomState, keyof IMyCustomState, string[], Promise<void>>(this, EMyCustomState.name),
            subscribe: this._subscribe.bind<MyCustomState, keyof IMyCustomState, Array<(prev: string, cur: string) => void>, void>(this, EMyCustomState.name),
            unsubscribe: this._unsubscribe.bind<MyCustomState, keyof IMyCustomState, void>(this, EMyCustomState.name),
        };
    }

}

const t: MyCustomState = new MyCustomState();

t.name().set('fsd').then();
t.name().subscribe((prev: string, cur: string) => {
    //
});

interface IMyState {
    name: string;
    email: string;
}
