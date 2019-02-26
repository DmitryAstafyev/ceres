> README IN PROGRESS...


Network transport/protocol "**Ceres**"

# Self-explained example
Let's create a communication mechanism for simple web-chat.

> Note. We are not talking about HTML/CSS and chat functionality - just about communication.

## Step 1. Think about communication scheme
Would be nice, before to do something - think how our chat should work, which kind of messages server/client should exchange with each other.
As usual this is all about protocol.
Let's describe out protocol as JSON format.
```
{
    /* This is events, which will happen in our system */
    "Events": {
        "NewMessage": {
            "message": "ChatMessage"
        },
        "UsersListUpdated": {
            "users": "Array<User>"
        }
    },
    /* This is description of possible requests and responses in system */
    "Requests": {
        "GetUsers": {},
        "AddUser": {
            "user": "User"
        }
    },
    "Responses": {
        "UsersList": {
            "users": "Array<User>"
        },
        "AddUserResult": {
            "error?": "asciiString"
        }
    },
    /* Description of entities in system */
    "ChatMessage": {
        "nickname": "asciiString",
        "message": "utf8String",
        "created": "datetime"
    },
    "User": {
        "nickname": "asciiString"
    },
    "version": "0.0.1"
}
```
Our simple chat will include:
- Users. Each user is described by object "**User**"
- Messages. Message is described by object "**ChatMessage**"

In our system we will have next events:
- **NewMessage** new message is posted in channel
- **UsersListUpdated** users list was changed

Also we will have a few requests (from client to server)
- **GetUsers** to get list of user in chat; as response we will expect **UsersList**
- **AddUser** to add (register) new user in chat; as response we will expect **ChannelsList**

> **Note**. **Ceres.protocol** allows you describe communication between parts of your system within easy readable JSON format.

Create folder "*chat*", subfolder "**protocol/src**" and save JSON there as "*chat/protocol/src/protocol.chat.json*"

> **Note**. Ceres.protocol suppors comments (`/* comment here */`) in JSON files, so you can leave it there.

## Step 2. Create/generate protocol
To generate protocol we need to install [ceres.protocol](https://github.com/DmitryAstafyev/ceres.protocol). We do **not** need it as dependency, because generated implementation of protocol will have everything to work.

Install globaly 
```
npm install ceres.protocol -g
```

Generate protocol:
```
cd chat
ceres.protocol -s ./protocol/src/protocol.chat.json -o ./protocol/protocol.chat.ts -r
```

Now we have generated protocol implementation in file **./protocol/protocol.chat.ts**.

## Step 3. Create chat server

Let's create new folder "chat/server" and install necessary packages.

Create npm project
```
mkdir server
cd server
npm init
```

Install provider and transport for it
```
npm install ceres.provider --save
npm install ceres.provider.node.ws --save
```

As transport we will use nodeJS with WebSockets.

```typescript
import Transport, { ConnectionParameters }  from 'ceres.provider.node.ws';
import Provider from 'ceres.provider';
import * as Protocol from '../protocol/protocol.chat';

class ChatServer {
    //Create transport
    private transport: Transport = new Transport(new ConnectionParameters({
        port: 3005
    }));
    private provider: Provider;
    private users: { [key: string]: string } = {};

    constructor() {
        // Create provider
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
```

This is it. Our server is done. A few comments, before switching to client.

To create provider, we need create transport before and pass it as argument to provider's constructor:

```typescript
class ChatServer {

    private transport: Transport = new Transport(new ConnectionParameters({
        port: 3005
    }));

    private provider: Provider;
    
    constructor() {
        // Create provider
        this.provider = new Provider(this.transport);
    }
}
```

To allow our provider (chat server in our example) process income requests (**GetUsers** and **AddUser**) we should add listeners of it.

```typescript
    // Listen request GetUsers
    this.provider.listenRequest(
        Protocol.Requests.GetUsers,         // Reference to request, which we would like to process
        this.onGetUsersRequest.bind(this)   // Our handler for request
    );
    // Listen request AddUser
    this.provider.listenRequest(
        Protocol.Requests.AddUser,          // Reference to request, which we would like to process
        this.onAddUserRequest.bind(this)    // Our handler for request
    );
```

Also our server has to "catch" moment of disconnection of client.

```typescript
    this.provider.on(Provider.Events.disconnected, this.onNewClientDisconnected.bind(this));
```

Let's take a look closer to handler of request. For example, listener of request **AddUser**

```typescript
    private onAddUserRequest(
        demand: Protocol.Requests.AddUser,
        clientId: string,
        callback: (error: Error | null, results: Protocol.Responses.AddUserResult) => any 
    ) {
        // Do magin here;
    }
```

- **demand**. Valid instance of request. Demand always will be instance of class, which was defined with method `listenRequest`. If somehow client sent incorrect data and impossible to create valid instance of demand, provider will not call handler of demand at all.
- **clientId**. Unique client ID. This is internal property of each connected client. We will use it to bind nickname and client to correctlly catch moment of client disconnection and update users list
- **callback**. Obviously sender of request expects response: callback is a right way to give this response.

And last note about server - triggering events. We have event **UsersListUpdated** to trigger it, will be enough to call method `emit`:

```typescript
    this.provider.emit(new Protocol.Events.UsersListUpdated({
        users: Object.keys(this.users).map((nickname: string) => {
            return new Protocol.User({ nickname: nickname });
        })
    })).catch((error: Error) => {
        console.log(`Fail to emit event UsersListUpdated due error: ${error.message}`);
    });
```
> Note. You should not define "name" of event, which you are triggering, you already did it, because as argument you pass instance of target event.

## Step 4. Create chat client
We will need at least two clients to demostrate communication process not only between client <-> server, but also between clients.
Because it will be page for browser we will need a little bit more packages. 

> **Note**. You can find source of this example in repository "/examples/chat".

As dependencies we will need only two packages, other we will need just as devDependencies. Bellow package.json of client:
```
{
  "name": "example.chat.client",
  "version": "0.0.1",
  "description": "",
  "main": "./src/main.ts",
  "scripts": {
    "build": "./node_modules/.bin/webpack",
    "build:watch": "./node_modules/.bin/webpack --watch",
    "build-ts": "tsc -p ./tsconfig.json",
    "build-ts:watch": "tsc -p ./tsconfig.json -w",
    "serve": "lite-server -c=bs-config.json",
    "start": "concurrently \"npm run build:watch\" \"npm run serve\""
  },
  "devDependencies": {
    "concurrently": "^4.0.1",
    "lite-server": "^2.4.0",
    "source-map-loader": "^0.2.4",
    "ts-loader": "^5.2.2",
    "typescript": "^3.1.3",
    "webpack": "^4.23.1",
    "webpack-cli": "^3.1.2"
  },
  "dependencies": {
    "ceres.consumer": "latest",
    "ceres.consumer.browser.ws": "latest"
  }
}
```

A few extra actions before creating client class. Let's create folder **build** (chat/client/build) and put there **index.html** file:

```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="./styles.css" type="text/css" />
        <script src="./bundle.js"></script>
        <title>Example.Chat.Client</title>
    </head>
    <body>
    </body>
</html>
```

Also you can add some CSS and save it in *chat/client/build/styles.css*.

But main part for sure, it's client's class. Create folder "src" (chat/client/src) and put there out main file - **main.ts**.


```typescript
import * as Protocol from '../../protocol/protocol.chat';
import Transport, { ConnectionParameters } from 'ceres.consumer.browser.ws';
import Consumer from 'ceres.consumer';

class ChatClient {

    private transport: Transport | undefined;
    private consumer: Consumer | undefined;
    private nickname: string = '';

    constructor() {
        this.connect = this.connect.bind(this);
        this.connect();
    }

    private connect() {
        if (this.consumer !== undefined) {
            // If consumer was defined -> this is reconnection process
            // Unsubscribe from events
            this.consumer.removeAllListeners();
            this.consumer.destroy();
        }
        // Show greeting screen
        this.screenGreeting();
        // Create transport
        this.transport = new Transport(new ConnectionParameters({
            host: 'http://localhost',
            port: 3005,
            wsHost: 'ws://localhost',
            wsPort: 3005,
        }));
        // Create consumer
        this.consumer = new Consumer(this.transport);
        // Subscribe to consumer events
        // Event: consumer successfully connected and ready to work
        this.consumer.on(Consumer.Events.connected, () => {
            if (this.consumer === undefined) {
                return;
            }
            this.screenWelcome();
            // subscribe to new chat event
            this.consumer.subscribe(Protocol.Events.NewMessage, this.onNewMessage.bind(this)).then(() => {
                console.log('Subscription to "NewMessage" is done');
            }).catch((error: Error) => {
                console.log(`Fail to subscribe to "NewMessage" due error: ${error.message}`);
            });
            // subscribe to updating of users in chat
            this.consumer.subscribe(Protocol.Events.UsersListUpdated, this.onUsersListUpdated.bind(this)).then(() => {
                console.log('Subscription to "UsersListUpdated" is done');
            }).catch((error: Error) => {
                console.log(`Fail to subscribe to "UsersListUpdated" due error: ${error.message}`);
            });
        });

        // Event: consumer disconnected
        this.consumer.on(Consumer.Events.disconnected, () => {
            // Reconnect with short delay
            setTimeout(this.connect, 1000);
        });

        // Event: consumer returns an error.
        this.consumer.on(Consumer.Events.error, () => {
            // Reconnect with short delay
            setTimeout(this.connect, 1000);
        });
    }

    private screenGreeting() {
        document.body.innerHTML = '<p>Please wait... Connecting...</p>';
    }

    private screenWelcome() {
        document.body.innerHTML = '<input id="nickname" type="text" placeholder="Type your nickname and press Enter"/>';
        const input: HTMLInputElement | null = document.getElementById('nickname') as HTMLInputElement;
        if (input === null) {
            return;
        }
        input.addEventListener('keyup', this.onNicknameInput.bind(this));
    }

    private screenChat() {
        document.body.innerHTML = `<div id="users"></div><div id="messages"></div><div id="message-holder"><textarea id="message" placeholder="Type your message"></textarea></div>`;
        const textarea: HTMLTextAreaElement | null = document.getElementById('message') as HTMLTextAreaElement;
        textarea.addEventListener('keyup', this.onMessageInput.bind(this));
    }

    private addMessage(message: Protocol.ChatMessage) {
        const holder = document.getElementById('messages');
        if (holder === null) {
            return;
        }
        const p = document.createElement('p');
        p.innerHTML = `[${message.created.toLocaleTimeString()}]${message.nickname}: ${message.message}`;
        if (message.nickname === this.nickname) {
            p.style.color = 'rgb(220,220,220)';
        }
        holder.appendChild(p);
    }

    private onNewMessage(event: Protocol.Events.NewMessage) {
        this.addMessage(event.message);
    }

    private onNicknameInput(event: KeyboardEvent) {
        if (this.consumer === undefined) {
            return;
        }
        const input: HTMLInputElement = event.target as HTMLInputElement;
        const nickname = input.value.trim();
        if (nickname.length < 3) {
            return;
        }
        if (event.keyCode === 13) {
            this.consumer.request(
                new Protocol.Requests.AddUser({
                    user: new Protocol.User({ nickname: nickname })
                }), 
                Protocol.Responses.AddUserResult
            ).then((response: Protocol.Responses.AddUserResult) => {
                if (response.error) {
                    document.body.innerHTML = `<p>Fail to add user due error: ${response.error}</p>`;
                    return;
                }
                this.nickname = nickname;
                this.requestUsersList();
                this.screenChat();
            }).catch((error: Error) => {
                console.log(`Fail to add user due error: ${error.message}`);
            });
        }
    }

    private onMessageInput(event: KeyboardEvent) {
        if (this.consumer === undefined) {
            return;
        }
        const textarea: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
        if (event.keyCode === 13) {
            const message = new Protocol.ChatMessage({
                nickname: this.nickname,
                message: textarea.value,
                created: new Date()
            });
            textarea.value = 'sending ...';
            this.consumer.emit(
                new Protocol.Events.NewMessage({
                    message: message
                })
            ).then(() => {
                textarea.value = '';
                this.addMessage(message);
            }).catch((error: Error) => {
                console.log(`Fail to send message due error: ${error.message}`);
            });
        }
    }

    private requestUsersList() {
        if (this.consumer === undefined) {
            return;
        }
        this.consumer.request(
            new Protocol.Requests.GetUsers(), 
            Protocol.Responses.UsersList
        ).then((response: Protocol.Responses.UsersList) => {
            this.updateUsersList(response.users);
        }).catch((error: Error) => {
            console.log(`Fail to get users list due error: ${error.message}`);
        });
    }

    private onUsersListUpdated(event: Protocol.Events.UsersListUpdated) {
        this.updateUsersList(event.users);
    }

    private updateUsersList(users: Protocol.User[]) {
        const wrapper = document.getElementById('users');
        if (wrapper === null) {
            return;
        }
        (wrapper as HTMLElement).innerHTML = '';
        users.forEach((user: Protocol.User) => {
            (wrapper as HTMLElement).innerHTML += `<p>${user.nickname}</p>`;
        });
    }
}

window.addEventListener('load', () => {
    // Start chat, when everything is ready
    (new ChatClient());
});
```

A few comments to code of client's class:
**Note 1**. To subscribe to such events like connect/disconnect and other simular events (better say - transport events), developer should use method `on`: 
```typescript
    this.consumer.on(Consumer.Events.connected, () => {});
```
All available events are listed in static property of class **Consumer**.

**Note 2**. To subscribe to chat events, we should use method `subscribe`:
```typescript
    this.consumer.subscribe(Protocol.Events.NewMessage, this.onNewMessage.bind(this)).then(() => {
        // Do magin here
    });
```
**Note 3**. To send request to provider we are using method `request`. As first argument we should use request body (demand), as second - reference to class of expected response. This is important - ceres will check result before resolve promise; if result is expected (response instance of defined reference) promise will be resolved; if not - rejected.

```typescript
    this.consumer.request(
        new Protocol.Requests.GetUsers(), 
        Protocol.Responses.UsersList
    ).then((response: Protocol.Responses.UsersList) => {
        // Success. Response is an instance of UsersList
    }).catch((error: Error) => {
        // Fail. Could be a few reasons, include: response is NOT an instance of UsersList
    });
```

## Step 5. Time to test

Let's start client.
```
cd chat/client
npm start
```
Server of client is started. We can open it in browser using url *http://localhost:3000*. Open at least two tabs with it.

Let's start a server
```
cd chat/server
ts-node ./src/server.ts
```
> Note. **ts-node** nice package, which allows you run typescript sources. Install it globally using `npm install ts-node -g`. 

If you don't want to install ts-node, you should build solutions before.

```
cd chat/server
npm run build
node ./build/server/server.js
```
# Table of content


# Components
Network transport/protocol **Ceres** includes next components:
- **Provider**. Provider like a server accepts connections from consumers (clients) and manage it.
- **Consumer**. Consumer is a client for provider.
- **Protocol generator**. Ceres works based on ceres.protocol - JavaScript protocol generated from the scheme (scheme is presented as JSON file). More information about protocol is [here](https://github.com/DmitryAstafyev/ceres.protocol).
- **Transport implementations**. Not consumer, not provider doesn't have transport implementation. Implementation of transport should be delivered to provider and consumer. 

# API

