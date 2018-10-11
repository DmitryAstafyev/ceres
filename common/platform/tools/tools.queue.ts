import * as Types from './tools.primitivetypes';

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_EXECUTE_LIMIT = 3;

export type TExecuter = () => Promise<void>;
type TResolver = (...args: any[]) => any;

export interface ITask {
    id: symbol;
    task: TExecuter;
    alias: string | symbol;
    executed: number;
}

export default class Queue {

    private _tasks: Map<symbol, ITask> = new Map();
    private _timeout: number;
    private _working: boolean = false;
    private _repeatFlag: boolean = false;
    private _destroyResolver: TResolver | null = null;
    private _repeatTimer: any = null;
    private _executeLimit: number;

    constructor(timeout = DEFAULT_TIMEOUT, executeLimit = DEFAULT_EXECUTE_LIMIT) {
        this._timeout = timeout;
        this._executeLimit = executeLimit;
    }

    /**
     * Add task into queue
     * @param executer {TExecuter: () => boolean} task's function
     * @param alias {string | symbol} name of task's group. Is used to drop all tasks for group.
     * @returns symbol
     */
    public add(executer: TExecuter, alias: string | symbol = Symbol()): symbol | Error {
        if (Types.getTypeOf(executer) !== Types.ETypes.function) {
            return new Error(`Cannot add task, because as task expected function, but was gotten: ${Types.getTypeOf(executer)}.`);
        }
        if (Types.getTypeOf(alias) === Types.ETypes.undefined) {
            return new Error(`Cannot add task, because as alias expected string | symbol, but was gotten: ${Types.getTypeOf(alias)}.`);
        }
        const task: ITask = {
            alias: alias,
            executed: 0,
            id: Symbol(),
            task: executer,
        };
        this._tasks.set(task.id, task);
        return task.id;
    }

    /**
     * Drop all tasks of group
     * @param alias {string | symbol} task's group identificator
     * @returns undefined
     */
    public drop(alias: string | symbol) {
        this._stop();
        this._tasks.forEach((task: ITask, taskId: symbol) => {
            task.alias === alias && this._tasks.delete(taskId);
        });
        this._repeat();
    }

    /**
     * Count of tasks bound with alias
     * @param alias {string | symbol} task's group identificator
     * @returns boolean
     */
    public count(alias: string | symbol): number {
        let count: number = 0;
        this._tasks.forEach((task: ITask) => {
            task.alias === alias && (count += 1);
        });
        return count;
    }

    /**
     * Execute all tasks in queue
     * @returns undefined
     */
    public procced() {
        if (this._destroyResolver !== null) {
            return;
        }
        if (this._working) {
            this._repeatFlag = true;
        } else {
            const tasks: Array<Promise<void>> = [];
            // Stop repeatinng by timer
            this._stop();
            // Mark as working
            this._working = true;
            // Execute tasks
            this._tasks.forEach((task: ITask, taskId: symbol) => {
                tasks.push(task.task()
                    .then(() => {
                        this._tasks.delete(taskId);
                    })
                    .catch((error: Error) => {
                        task.executed += 1;
                        if (task.executed >= this._executeLimit) {
                            this._tasks.delete(taskId);
                        } else {
                            this._tasks.set(taskId, task);
                        }
                    }));
            });
            const resolver = () => {
                if (this._destroyResolver !== null) {
                    this._clear();
                    return this._destroyResolver();
                }
                this._repeat();
                this._working = false;
                this._repeatFlag && this.procced();
                this._repeatFlag = false;
            };
            Promise.all(tasks)
                .then(resolver)
                .catch(resolver);
        }
    }

    /**
     * Destroy all tasks and clear queue without executing
     * @returns Promise<void>
     */
    public destory() {
        return new Promise((resolve) => {
            if (!this._working) {
                this._clear();
                return resolve();
            }
            this._destroyResolver = resolve;
        });
    }

    /**
     * Returns count of tasks in queue
     * @returns number
     */
    public getTasksCount() {
        return this._tasks.size;
    }

    private _repeat() {
        this._repeatTimer = setTimeout(this.procced, this._timeout);
    }

    private _stop() {
        if (this._repeatTimer === null) {
            return;
        }
        clearTimeout(this._repeatTimer);
    }

    private _clear() {
        this._stop();
        this._tasks.clear();
        this._working = false;
        this._repeatFlag = false;
    }

}
