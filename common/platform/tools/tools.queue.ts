
import * as Types from './tools.primitivetypes';
const DEFAULT_TIMEOUT = 10000;

export interface ITask {
    id: symbol;
    task: Function;
    timer: number;
    alias: string | symbol;
}

export default class Queue {

    private _tasks: Map<symbol, ITask> = new Map();
    private _timeout: number;

    constructor(timeout = DEFAULT_TIMEOUT) {
        this._timeout = timeout;
    }

    public add(executer: Function, alias: string | symbol): symbol | Error {
        if (Types.getTypeOf(executer) !== Types.ETypes.function) {
            return new Error(`Cannot add task, because as task expected function, but was gotten: ${Types.getTypeOf(executer)}.`);
        }
        if (Types.getTypeOf(alias) === Types.ETypes.undefined) {
            return new Error(`Cannot add task, because as alias expected string | symbol, but was gotten: ${Types.getTypeOf(alias)}.`);
        }
        const task: ITask = {
            id: Symbol(),
            task: executer,
            timer: -1,
            alias: alias
        };
        this._tasks.set(task.id, task);
        this._setTimer(task.id);
        return task.id;
    }

    public remove(taskId: symbol) {
        const task = this._tasks.get(taskId);
        if (task === undefined) {
            return;
        }
        this._clearTimer(taskId);
        this._tasks.delete(taskId);
    }

    public drop(alias: string | symbol){
        const toRemove: Array<symbol> = [];
        this._tasks.forEach((task: ITask, taskId: symbol) => {
            if (task.alias === alias) {
                toRemove.push(taskId);
            }
        });
        toRemove.forEach((taskId: symbol) => {
            this.remove(taskId);
        });
    }

    public procced(){
        const done: Array<symbol> = [];
        this._tasks.forEach((task: ITask, taskId: symbol) => {
            if (task.task()) {
                this._clearTimer(taskId);
                done.push(taskId);
            }
        });
        done.forEach((taskId: symbol) => {
            this.remove(taskId);
        });
    }

    public getTasksCount(){
        return this._tasks.size;
    }

    private _setTimer(taskId: symbol){
        const task = this._tasks.get(taskId);
        if (task === undefined) {
            return;
        }
        task.timer = setTimeout(this._onTimeout.bind(this, taskId), this._timeout);
        this._tasks.set(taskId, task);
    }

    private _clearTimer(taskId: symbol){
        const task = this._tasks.get(taskId);
        if (task === undefined) {
            return;
        }
        clearTimeout(task.timer);
    }

    private _onTimeout(taskId: symbol){
        this.remove(taskId);
    }

}