import * as Tools from './platform/tools/index';
import * as Protocol from './protocols/connection/protocol.connection';
import ATransport from './transports/transport.abstract';

export type TClientId = string;

export interface IPacket {
    data: string | Uint8Array;
    onReject: (error: Error) => void;
    onResolve: () => void;
}

const LIMIT_TASKS_PER_CLIENT = 50;

export class Queue {

    private _logger: Tools.Logger = new Tools.Logger('Queue');

    private _packets: Map<TClientId, IPacket[]> = new Map();
    private _isWorking: { [key: string]: boolean } = {};
    private _transport: ATransport<any, any>;

    constructor(transport: ATransport<any, any>) {
        this._transport = transport;
    }

    public addPacket(clientId: TClientId, packet: IPacket): void {
        let packets: IPacket[] | undefined = this._packets.get(clientId);
        if (packets === undefined) {
            packets = [];
        }
        if (!this._transport.isConnected(clientId)) {
            packet.onReject(new Error(this._logger.warn(`Fail to add task for client "${clientId}" because client isn't connected.`)));
            return;
        }
        if (packets.length >= LIMIT_TASKS_PER_CLIENT) {
            packet.onReject(new Error(this._logger.warn(`Fail to add new task to client "${clientId}", because client already has ${packets.length} tasks pending.`)));
            return;
        }
        packets.push(packet);
        this._packets.set(clientId, packets);
    }

    public drop(clientId: TClientId) {
        const packets: IPacket[] | undefined = this._packets.get(clientId);
        if (packets === undefined) {
            return;
        }
        packets.forEach((packet: IPacket) => {
            packet.onReject(new Error(this._logger.warn(`Fail to do task for client "${clientId}" because client is dropped in queue.`)));
        });
        this._packets.delete(clientId);
    }

    public destory() {
        this._packets.clear();
    }

    public resolve(clientId?: TClientId) {
        if (clientId !== undefined && !this._transport.isAvailable(clientId)) {
            return;
        } else if (clientId !== undefined && this._transport.isAvailable(clientId)) {
            return this._resolveClientPackets(clientId).catch((error: Error) => {
                this._logger.warn(error.message);
            });
        }
        this._packets.forEach((packets: IPacket[], storedClientId: TClientId) => {
            if (!this._transport.isAvailable(storedClientId)) {
                return;
            }
            if (this._isWorking[storedClientId]) {
                return;
            }
            this._isWorking[storedClientId] = true;
            this._resolveClientPackets(storedClientId).then(() => {
                delete this._isWorking[storedClientId];
            }).catch((error: Error) => {
                delete this._isWorking[storedClientId];
                this._logger.warn(error.message);
            });
        });
    }

    public getTasksInfo(): { details: { [key: string]: number }, summary: string } {
        const info: { details: { [key: string]: number }, summary: string } = {
            details: {},
            summary: '',
        };
        let count: number = 0;
        this._packets.forEach((packets: IPacket[], clientId: string) => {
            info.details[clientId] = packets.length;
            count += packets.length;
        });
        info.summary = `c: ${this._packets.size} / p: ${count}`;
        return info;
    }

    private _resolveClientPackets(clientId: TClientId): Promise<void> {
        return new Promise((resolve, reject) => {
            const packets: IPacket[] | undefined = this._packets.get(clientId);
            if (packets === undefined) {
                return resolve();
            }
            let toSend: any;
            if (packets.length === 1) {
                toSend = packets[0].data;
            } else {
                toSend = Protocol.join(...packets.map((packet: IPacket) => {
                    return packet.data;
                }));
            }
            this._packets.delete(clientId);
            this._transport.send(clientId, toSend).then(() => {
                packets.forEach((packet: IPacket) => {
                    if (this._transport.isConnected(clientId)) {
                        packet.onResolve();
                    } else {
                        packet.onReject(new Error(this._logger.warn(`Fail to resolve task for client "${clientId}" because client was disconnected.`)));
                    }
                });
                resolve();
            }).catch((sendingError: Error) => {
                const error: Error = new Error(`Fail send packets to client "${clientId}" due error: ${sendingError.message}`);
                packets.forEach((packet: IPacket) => {
                    packet.onReject(error);
                });
                this._transport.isConnected(clientId) && this._rollback(clientId, packets);
                reject(error);
            });
        });
    }

    private _rollback(clientId: TClientId, packets: IPacket[]) {
        let stored: IPacket[] | undefined = this._packets.get(clientId);
        if (stored === undefined) {
            stored = [];
        }
        stored.unshift(...packets);
        this._packets.set(clientId, stored);
    }

}
