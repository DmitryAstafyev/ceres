import { TConnection } from './interfaces/iconnection';
import { ITransport } from './interfaces/itransport';

class Transport implements ITransport {

    constructor(connection: TConnection) {

    }

    addConsumer(){
    
    }

    removeConsumer(){

    }

    isConnected(){

    }
}

export { Transport }