import * as Types from './tools.primitivetypes';

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_EXECUTE_LIMIT = 3;

export interface ITask {
    id: symbol;
    task: Function;
    timer: number;
    alias: string | symbol;
    executed: number;
}

export default class Queue {

    private _tasks: Map<symbol, ITask> = new Map();
    private _timeout: number;
    private _executeLimit: number;

    constructor(timeout = DEFAULT_TIMEOUT, executeLimit = DEFAULT_EXECUTE_LIMIT) {
        this._timeout = timeout;
        this._executeLimit = executeLimit;
    }
    
    /**
     * Add task into queue 
     * @param executer {function} task's function
     * @param alias {string | symbol} name of task's group. Is used to drop all tasks for group.
     * @returns symbol
     */
    public add(executer: Function, alias: string | symbol = Symbol()): symbol | Error {
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
            alias: alias,
            executed: 0
        };
        this._tasks.set(task.id, task);
        this._setTimer(task.id);
        return task.id;
    }

    /**
     * Remove task from queue 
     * @param taskId {symbol} task's id
     * @returns undefined
     */
    public remove(taskId: symbol) {
        const task = this._tasks.get(taskId);
        if (task === undefined) {
            return;
        }
        this._clearTimer(taskId);
        this._tasks.delete(taskId);
    }

    /**
     * Drop all tasks of group
     * @param alias {string | symbol} task's group identificator
     * @returns undefined
     */
    public drop(alias: string | symbol){
        this._tasks.forEach((task: ITask, taskId: symbol) => {
            task.alias === alias && this.remove(taskId);
        });
    }

    /**
     * Execute all tasks in queue 
     * @returns undefined
     */
    public procced(){
        this._tasks.forEach((task: ITask, taskId: symbol) => {
            if (task.task() === true) {
                this.remove(taskId);
            } else {
                task.executed += 1;
                if (task.executed >= this._executeLimit) {
                    return this.remove(taskId);
                }
                //comment
                this._tasks.set(taskId, task);
            }
        });
    }

    /**
     * Returns count of tasks in queue 
     * @returns number
     */
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