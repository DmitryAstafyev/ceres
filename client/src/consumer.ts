import { IProvisioning } from './interfaces/iprovisioning';
import { TConnection } from './interfaces/iconnection';
import { IConsumer } from './interfaces/iconsumer';
import { IScheme } from './interfaces/ischeme';

type TConsumerProvisioning = { scheme: IScheme, provisioning: IProvisioning, connection: TConnection };

class Consumer implements IConsumer {

    constructor( consumerProvisioning: TConsumerProvisioning ) {

    }

    bindEvent(){
    
    }

    unbindEvent(){

    }

    triggerEvent(){

    }

    bindRequest(){

    }

    unbindRequest(){

    }

    sendRequest(){

    }
}

export { Consumer }