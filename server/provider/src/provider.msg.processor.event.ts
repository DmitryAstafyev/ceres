import * as Protocol from './protocols/connection/protocol.connection';
import { MessageProcessor } from './provider.msg.processor';
import { ProviderState } from './provider.state';
import { TSender } from './transports/transport.abstract';

export class MessageEventProcessor extends MessageProcessor<Protocol.Message.Event.Request> {

    constructor(state: ProviderState) {
        super('Event', state);
    }

    public process(sender: TSender, message: Protocol.Message.Event.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            if (typeof message.event.protocol !== 'string' || message.event.protocol.trim() === '' ||
                typeof message.event.event !== 'string' || message.event.event.trim() === '') {
                return sender((new Protocol.ConnectionError({
                    guid: message.guid,
                    message: `Expecting defined fields: protocol {string}; event {string}`,
                    reason: Protocol.ConnectionError.Reasons.NO_DATA_PROVIDED,
                })).stringify() as Protocol.Protocol.TStringifyOutput).then(() => {
                    this._logger.env(`Fail to emit event from client ${clientId}.`);
                }).catch((error: Error) => {
                    this._logger.warn(`Fail to close connection ${clientId} due error: ${error.message}`);
                });
            }
            // Setup default options
            if (message.options === undefined) {
                message.options = new Protocol.Message.Event.Options({});
            }
            message.options.scope = message.options.scope === undefined ? Protocol.Message.Event.Options.Scope.all : message.options.scope;
            // Process event
            this.state.events.emitAll(
                message.event.protocol,
                message.event.event,
                message.event.bodyStr === '' ? new Uint8Array(message.event.bodyBinary) : message.event.bodyStr,
                message.options,
                message.aliases,
            ).then((count: number) => {
                this.state.tasks.resolve();
                return sender((new Protocol.Message.Event.Response({
                    clientId: clientId,
                    guid: message.guid,
                    subscribers: count,
                })).stringify() as Protocol.Protocol.TStringifyOutput).then(() => {
                    this._logger.env(`Emit event from client ${clientId} for event protocol ${message.event.protocol}, event ${message.event.event} is done for ${count} subscribers.`);
                    resolveProcess();
                }).catch((error: Error) => {
                    rejectProcess(error);
                });
            });
        });
    }

    public drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

}
