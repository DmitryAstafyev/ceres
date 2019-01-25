import * as Tools from './platform/tools/index';
import * as Protocol from './protocols/connection/protocol.connection';
import { TAlias } from './provider.aliases';
import { MessageProcessor } from './provider.msg.processor';
import { ProviderState } from './provider.state';
import { TSender } from './transports/transport.abstract';

export class MessageRegistrationProcessor extends MessageProcessor<Protocol.Message.Registration.Request> {

    constructor(state: ProviderState) {
        super('Registration', state);
    }

    public process(sender: TSender, message: Protocol.Message.Registration.Request): Promise<void> {
        return new Promise((resolveProcess, rejectProcess) => {
            const clientId = message.clientId;
            let status: boolean = false;
            if (message.aliases instanceof Array) {
                if (message.aliases.length === 0) {
                    this.state.unrefAlias(clientId);
                    status = true;
                } else {
                    const aliases: TAlias = {};
                    let valid: boolean = true;
                    message.aliases.forEach((alias: Protocol.KeyValue) => {
                        if (!valid) {
                            return;
                        }
                        if (aliases[alias.key] !== void 0) {
                            valid = false;
                        } else {
                            aliases[alias.key] = alias.value;
                        }
                    });
                    if (valid) {
                        this.state.refAlias(clientId, aliases);
                        status = true;
                    }
                }
            }
            return sender((new Protocol.Message.Registration.Response({
                clientId: clientId,
                guid: message.guid,
                status: status,
            })).stringify()).then(() => {
                this._logger.env(`Registration of aliases for client ${clientId} as "${message.aliases.map((alias: Protocol.KeyValue) => {
                    return `${alias.key}: ${alias.value}`;
                }).join(', ')}" is done.`);
                resolveProcess();
            }).catch((error: Error) => {
                rejectProcess(error);
            });
        });
    }

    public drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

}
