import Transport, { ConnectionParameters }  from 'ceres.provider.node.ws';
import Provider from 'ceres.provider';
import * as Protocol from '../protocol/protocol.chat';

class ChatServer {

    private transport: Transport = new Transport(new ConnectionParameters({
        port: 3005
    }));
    private provider: Provider;
    private users: { [key: string]: string } = {};

    constructor() {
        this.provider = new Provider(this.transport);
        // Listen request GetUsers
        this.provider.listenRequest(
            Protocol.Requests.GetUsers,         // Reference to request, which we would like to process
            this.onGetUsersRequest.bind(this)   // Our handler for request
        );
        // Listen request AddUser
        this.provider.listenRequest(
            Protocol.Requests.AddUser,         
            this.onAddUserRequest.bind(this) 
        );
        // Listen connect/disconnect events (when client connects/disconnects)
        this.provider.on(Provider.Events.connected, this.onNewClientConnected.bind(this));
        this.provider.on(Provider.Events.disconnected, this.onNewClientDisconnected.bind(this));
    }

    private onGetUsersRequest(
        demand: Protocol.Requests.GetUsers,
        clientId: string,
        callback: (error: Error | null, results: Protocol.Responses.UsersList) => any 
    ) {
        const users: Protocol.User[] = Object.keys(this.users).map((nickname: string) => {
            return new Protocol.User({ nickname: nickname });
        });
        callback(null, new Protocol.Responses.UsersList({ users: users }));
    }

    private onAddUserRequest(
        demand: Protocol.Requests.AddUser,
        clientId: string,
        callback: (error: Error | null, results: Protocol.Responses.AddUserResult) => any 
    ) {
        if (this.users[demand.user.nickname] !== void 0) {
            return callback(null, new Protocol.Responses.AddUserResult({ error: 'user already exist' }));
        }
        // Add user to list
        this.users[demand.user.nickname] = clientId;
        // Send response
        callback(null, new Protocol.Responses.AddUserResult({ }));
        // Broadcast actual users list
        this.broadcastUsersList();
    }

    private onNewClientConnected(clientId: string) {
        console.log(`New client ${clientId} is connected`);
    }

    private onNewClientDisconnected(clientId: string) {
        // Remove user
        Object.keys(this.users).forEach((nickname: string) => {
            if (this.users[nickname] === clientId) {
                delete this.users[nickname];
            }
        });
        // Broadcast actual users list
        this.broadcastUsersList();
    }

    private broadcastUsersList() {
        this.provider.emit(new Protocol.Events.UsersListUpdated({
            users: Object.keys(this.users).map((nickname: string) => {
                return new Protocol.User({ nickname: nickname });
            })
        })).catch((error: Error) => {
            console.log(`Fail to emit event UsersListUpdated due error: ${error.message}`);
        });
    }

 }

(new ChatServer());