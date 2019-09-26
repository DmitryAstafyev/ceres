<a name="start"></a>
Network transport/protocol "**Ceres**"

# Table of content
- [Table of content](#table-of-content)
- [Self-explained example](#self-explained-example)
  - [Step 1. Think about communication scheme](#step-1-think-about-communication-scheme)
  - [Step 2. Create/generate protocol](#step-2-creategenerate-protocol)
  - [Step 3. Create chat server](#step-3-create-chat-server)
  - [Step 4. Create chat client](#step-4-create-chat-client)
  - [Step 5. Time to test](#step-5-time-to-test)
- [Components](#components)
- [Provider](#provider)
  - [Creating](#creating)
  - [Destroy](#destroy)
  - [Provider events](#provider-events)
  - [Works with consumers](#works-with-consumers)
- [Consumer](#consumer)
  - [Creating](#creating-1)
  - [Destroy](#destroy-1)
  - [Consumer events](#consumer-events)
  - [Works with provider and other consumers](#works-with-provider-and-other-consumers)
  - [Connection / reconnection](#connection--reconnection)
- [Security & authorization](#security--authorization)
  - [Consumer](#consumer-1)
  - [Provider](#provider-1)
- [Other](#other)
  - [Debug](#debug)
- [Developing / How to use this repo](#developing--how-to-use-this-repo)

# Self-explained example
<a name="self-explained-example"></a>
Let's create a communication mechanism for simple web-chat.

> Note. We are not talking about HTML/CSS and chat functionality - just about communication.

## Step 1. Think about communication scheme
Would be nice, before to do something to think how our chat should work, which kind of messages server/client should exchange with each other.
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
        // Do magic here;
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

But main part for sure, it's client's class. Create folder "src" (chat/client/src) and put there our main file - **main.ts**.


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
        // Do magic here
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

**Note 4**. Even we are using transport based on WebSocket we still have to define two kind of address
```typescript
    // Create transport
    this.transport = new Transport(new ConnectionParameters({
        host: 'http://localhost',
        port: 3005,
        wsHost: 'ws://localhost',
        wsPort: 3005,
    }));
```
This is because WebSocket uses as major way of communiction, but "big" packages will be sent using XMLHTTPRequest in any way to keep stable work of connection and do not "break" stream of events.

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

# Components
Network transport/protocol **Ceres** includes next components:
- **Provider**. Provider like a server accepts connections from consumers (clients) and manage it.
- **Consumer**. Consumer is a client for provider.
- **Protocol generator**. Ceres works based on ceres.protocol - JavaScript protocol generated from the scheme (scheme is presented as JSON file). More information about protocol is [here](https://github.com/DmitryAstafyev/ceres.protocol).
- **Transport implementations**. Not consumer, not provider doesn't have transport implementation. Implementation of transport should be delivered to provider and consumer. 

# Provider
Provider functionality:
- manage connections form consumers
- emit/trigger events
- process requests (demands)

## Creating
To create provider developer should install package **ceres.provider**. Also provider needs a transport.

Available transports for provider

| Package name (npm) | Platform | Description | Related consumer <br/> transports (npm) |
| --- | --- | --- | --- |
| ceres.provider.node.longpoll | node | Implements connections using long polling technology | ceres.consumer.browser.longpoll |
| ceres.provider.node.ws | node | Implements connections using Web Socket technology. This transport uses WebSocket as primiry way of communition, but if size of single package is too big, it send data using http(s) requests to client | ceres.consumer.browser.ws |

Example of provider creating

```typescript
import Transport, { ConnectionParameters }  from 'ceres.provider.node.ws';
import Provider from 'ceres.provider';

// Create transport
const transport: Transport = new Transport(new ConnectionParameters({
    port: 3005
}));

// Create provider
const provider: Provider = new Provider(transport);
```
Provider as it is doesn't require any parameter to be created. Only transport expected some parameters to set up server.

## Destroy

To destroy provider developer should use next method:

```typescript
provider.destroy(): Promise<void>;
```

Provider will:
- disconnect all consumers; 
- clear all pending tasks and not resolved requests (demands);
- remove all event listeners;

## Provider events
**Attaching listener**
```typescript
provider.on(event: any, handler: (...args: any[]) => any): boolean;
```

Provider emit next events
- **connected**. Triggered if new consumer was connected.
- **disconnected**. Triggered if new consumer was disconnected.

List of provider's events are available as static property **Provider.Events**.

```typescript
provider.on(Provider.Events.connected, (clientId: string) => {
    // To do something
});

provider.on(Provider.Events.disconnected, (clientId: string) => {
    // To do something
});

```

**Remove listener**
```typescript
provider.removeListener(event: any, handler: (...args: any[]) => any): boolean
```

**Remove all listeners**
```typescript
provider.removeAllListeners(event?: any): void
```

## Works with consumers
**Listening requests from consumers**

To start listen any request from consumer, provider should subscribe on it.

```typescript
provider.listenRequest(
        demand  : any,
        handler : ( demand  : any, 
                    clientId: string, 
                    callback: ( error   : Error | null, 
                                results : any ) => any ) => any,
        query   : { [key: string]: string } = {},
    ): void | Error
```
- **demand** reference to class of request, which should be listen (protocol implementation with such kind of classes should generated using library **ceres.protocol**. To get more details see an [example](#self-explained-example)
- **handler** handler, which will be called with income request.
- **query** Optional query, which can be used to order income requests (demands)

Handler will have next arguments:
- **demand** instance of request's class. *Note* handler will not be called, if request data isn't valid. So, handler always gets correct and valid data.
- **clientId** unique ID of consumer, who sent request
- **callback** callback to send results of request to consumer back. As the fisrt argument should be defined error; as second instance of result's class. To avoid error, should be used **null** instead. As result can be used only instance of class from same protocol as demand was generated. Using as result any other data will make an exception.

Optionaly developer can define **query**. This is simple javascript object:

```javascript
{
    firstname: "Brad",
    lastname: "Pitt"
}
```

If **query** is defined, handler of request (demand) will be called only in case of match query of listener and query of sender (consumer).

**Stop listening requests from consumers**

```typescript
provider.removeRequestListener(demand: any): void | Error
```

To stop listening some kind of request, should provided reference to class of request.

> Note. If developer defined a few listeners (for example with several quiries), method **removeRequestListener** will remove all listener for defined request (demand).

**Listening events from consumers**

```typescript
provider.subscribe(event: any, handler: (event: any) => any): void | Error
```

- **event** reference to class of event, which should be listen (protocol implementation with such kind of classes should generated using library **ceres.protocol**. To get more details see an [example](#self-explained-example))
- **handler** handler, which will be called with income event. As single argument handler will get instance of event's class. Because it's event, no way to send response.

**Stop listening events from consumers**

```typescript
provider.unsubscribe(event: any, handler?: THandler): void | Error
```

- **event** reference to class of event
- **handler** handler, which was defined as listener. If handler will not be defined - will be removed all listeners of defined event.

**Emiting/sending events to consumers**
```typescript
provider.emit(event: any, aliases?: TAlias, options?: Protocol.Message.Event.Options): Promise<number>
```
- **event** instance of event's class.
- **aliases** can be used to define one or limited group of consumers, which should receive event. 
- **options** options to define nature of receivers

Optionaly developer can define **aliases**. This is simple javascript object:

```javascript
{
    group: "A"
}
```
As result event will be gotten only by consumers, which registred itself with alias `{ group: "A" }`, all other consumers will not get event.

**Aliases of provider**

Provider can set up own aliases for income events. 

```typescript
provider.ref(alias: { [key: string]: string }): Error | void
```

Or remove existin aliases

```typescript
provider.unref(): void
```

For example,

```typescript
provider.ref({ who: 'server', region: 'UK' });
```

From now consumers are able to send direct events to this server using alias `{ who: 'server', region: 'UK' }`.

> **Note**. Aliases on provider was included as experemental functionlity. Full support of this feature on provider will be available after developing of *ceres.proxy* will be finished. But on consumer level aliases works as well.

# Consumer
Consumer functionality:
- connect to provider
- trigger events
- sending requests (demands)

## Creating

To create consumer developer should install package **ceres.consumer**. Also consumer needs a transport.

Available transports for consumer

| Package name (npm) | Platform | Description | Related consumer <br/> transports (npm) |
| --- | --- | --- | --- |
| ceres.consumer.browser.longpoll | browser | Implements connections using long polling technology | ceres.provider.node.longpoll |
| ceres.consumer.browser.ws | browser | Implements connections using Web Socket technology. This transport uses WebSocket as primiry way of communition, but if size of single package is too big, it send data using http(s) requests to client | ceres.provider.node.ws |

Example of consumer creating

```typescript
import * as Protocol from '../../protocol/protocol.chat';
import Transport, { ConnectionParameters } from 'ceres.consumer.browser.ws';

// Create transport
const transport: Transport = new Transport(new ConnectionParameters({
    host: 'http://localhost',
    port: 3005,
    wsHost: 'ws://localhost',
    wsPort: 3005,
}));
// Create consumer
const consumer: Consumer = new Consumer(transport);
```
Consumer as it is doesn't require any parameter to be created. Only transport expected some parameters to create connection to provider.

## Destroy

To destroy consumer developer should use next method:

```typescript
consumer.destroy(): Promise<void>;
```

Consumer will:
- close all open connections to provider (as usual it will not be one connection); 
- clear all pending tasks and not resolved requests (demands);
- remove all event listeners;

## Consumer events
**Attaching listener**
```typescript
consumer.on(event: any, handler: (...args: any[]) => any): boolean;
```

Consumer emit next events
- **connected**. Triggered if new consumer was connected.
- **disconnected**. Triggered if new consumer was disconnected.
- **demandSent**. Triggered after request (demand) was sent to provider and provider accept it. At this moment response isn't yet gotten.
- **error**. Error of connection.
- **eventSent**. Triggered after event was sent to provider and provider accept it.
- **referenceAccepted**. Triggered after consumer alias was accepted by provider.
- **subscriptionDone**. Triggered after subscription on event was accepted by provider.
- **subscriptionToRequestDone**. Triggered after consumer was accepted as respondent (of demand/request) by provider.
- **unsubscriptionAllDone**. Triggered after all subscriptions of consumer were dropped by provider.
- **unsubscriptionDone**. Triggered after defined subscription of consumer was dropped by provider.
- **unsubscriptionToRequestDone**. Triggered after provider remove role "respondent" of consumer.

List of consumer's events are available as static property **Consumer.Events**.

```typescript
consumer.on(Consumer.Events.connected, () => {
    // To do something
});

consumer.on(Consumer.Events.disconnected, () => {
    // To do something
});

consumer.on(Consumer.Events.error, (error: Error) => {
    // To do something
});

consumer.on(Consumer.Events.eventSent, (event: any) => {
    // To do something
});

consumer.on(Consumer.Events.referenceAccepted, (aliases: { [key: string]: string  }) => {
    // To do something
});

consumer.on(Consumer.Events.subscriptionDone, (event: any) => {
    // To do something
});

consumer.on(Consumer.Events.subscriptionToRequestDone, (providerResponse: any) => {
    // To do something
});

consumer.on(Consumer.Events.unsubscriptionAllDone, (providerResponse: any) => {
    // To do something
});

consumer.on(Consumer.Events.unsubscriptionToRequestDone, (providerResponse: any) => {
    // To do something
});
```

**Remove listener**
```typescript
consumer.removeListener(event: any, handler: (...args: any[]) => any): boolean
```

**Remove all listeners**
```typescript
consumer.removeAllListeners(event?: any): void
```

## Works with provider and other consumers
**Listening events from provider/consumers**

```typescript
consumer.subscribe(event: any, handler: (event: any) => any): Promise<ProviderResponse>
```

- **event** reference to class of event, which should be listen (protocol implementation with such kind of classes should generated using library **ceres.protocol**. To get more details see an [example](#self-explained-example))
- **handler** handler, which will be called with income event. As single argument handler will get instance of event's class. Because it's event, no way to send response.

Method **subscribe** will be resolved if subscription was accepted by provider. In all other cases - rejected.

**Stop listening events**

```typescript
consumer.unsubscribe(event: any): Promise<ProviderResponse>
```

- **event** reference to class of event

```typescript
consumer.unsubscribeAll(protocol: any): Promise<ProviderResponse>
```

- **protocol** reference to protocol. All events related to this protocol will be unsubscribed

 
Method **unsubscribe** and **unsubscribeAll** will be resolved if subscription was dropped by provider. In all other cases - rejected.

**Aliases of consumer**

Consumer can set up own aliases for income events. 

```typescript
consumer.ref(alias: { [key: string]: string }): Promise<ProviderResponse>
```

> Note. To remove/drop aliases, just do `consumer.ref({});`

For example,

```typescript
consumer.ref({ myId: 'R2D2', myGroup: 'FarFar' });
```

From now this consumer is able to get "private" events, which was triggered with aliases `{ myId: 'R2D2', myGroup: 'FarFar' }`. Also this consumer will "catch" event for `{ myId: 'R2D2' }` or `{ myGroup: 'FarFar' }`, but will not for `{ myId: 'R2D2', myGroup: 'FarFar', state: 'updated' }`, because property "state" isn't defined in aliases of consumer.


**Emiting/sending events to consumers/provider**

```typescript
consumer.emit(event: any, aliases: { [key: string]: string } = {}): Promise<ProviderResponse>;
```

- **event**. Instance of event's class
- **aliases**. Optional. To make event available only for defined group of consumers (or for one consumer), could be defined aliases.

Method **emit** will be resolver if provider accepted event; in all other cases - rejected.

**Sending requests/demands**

```typescript
consumer.request(demand: any,
                 expected: any,
                 query: { [key: string]: string } = {},
                 options: IDemandOptions = {}): Promise<any>;
```
- **demand**. Instance of request's class.
- **expected**. Reference to class of expected response. If response will not be an instance of expected class, method will be rejected.
- **query**. Optional query, which can be used to target request
- **options**. Addition options of request

Method **request** doesn't have timeout. It will be resolved only in one case - when expected response will be gotten. In all other cases (include connection errors) - rejected.

Example of query could be:

```
{
    location: "London"
}
```

In this case event will be sent only to consumers, "who" defined its location as "London"

**Listening requests/demands**

>**Note**. Not only provider can listen income requests, but also consumer can. 

```typescript
consumer.listenRequest( demand : any, 
                        handler: (  demand  : any, 
                                    callback: ( error   : Error | null, 
                                                results : any ) => any ) => any,
                        query  : { [key: string]: string }): Promise<ProviderResponse>;
```

- **demand** reference to class of request, which should be listen (protocol implementation with such kind of classes should generated using library **ceres.protocol**. To get more details see an [example](#self-explained-example))
- **handler** handler, which will be called with income request.
- **query** Optional query, which can be used to order income requests (demands)

Handler will have next arguments:
- **demand** instance of request's class. *Note* handler will not be called, if request data isn't valid. So, handler always gets correct and valid data.
- **callback** callback to send results of request back. As the fisrt argument should be defined error; as second instance of result's class. To avoid error, should be used **null** instead. As result can be used only instance of class from same protocol as demand was generated. Using as result any other data will make an exception.

Optionaly developer can define **query**. For example to process only requests/demands for US language:

```javascript
{
    language: "US"
}
```

Method **listenRequest** will be resolved after provider will accept consumer as respondent of defined request; in all other cases - rejected.

**Stop processing requests/demands**

```typescript
consumer.removeRequestListener(demand: any): Promise<ProviderResponse>;
```

- **demand**. Reference to class of demand (request), which should not be processed any more.

Method **removeRequestListener** will be resolved after provider will drop role of consumer as respondent for defined request; in all other cases - rejected.

## Connection / reconnection

Consumer automatically starts connecting to provider from moment it was created.

```typescript
const consumer: Consumer = new Consumer(transport);
```

On fail of connection, consumer will made attempt to reconnect. But all subscriptions will be dropped. To keep it under controll, developer would reconnect consumer manualy: destroy and create:

```typescript
let consumer: Consumer | undefined;

function connect() {
    if (consumer !== undefined) {
        // Destroy instance of consumer
        consumer.destroy();
    }
    // Create
    consumer = new Consumer(transport);
    consumer.on('error', (error: Error) => {
        // This is connection error. Consumer is already disconnected.
        // Do reconnection.
        setTimeout(connect, 1000);
    });
    // Do subscriptions
    // ...
}
```
# Security & authorization

Developer can define a middleware to secure / authorize connections. This happens on transport level.

## Consumer
Both transport implementations (**ceres.consumer.browser.ws**, **ceres.consumer.browser.longpoll**) for consumer allows defined middleware class.

```typescript
import Transport, { ConnectionParameters } from 'ceres.consumer.browser.ws';
import Consumer from 'ceres.consumer';

// This method will be called before consumer will make the first request to provider.
// This is good chance to setup for example some token.
function touch(request: XMLHttpRequest): XMLHttpRequest {
    // Set up extra header for authorization
    request.setRequestHeader('x-sec-token', 'xxx-xxx-xxx-xxx');
    // modified XMLHttpRequest should be returned
    return request;
}

// This method will be called with the first response on provider
function connecting(response: XMLHttpRequest, message: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
        // Validate server response
        resolve();
    });
};

// Create middleware instance
const middleware: Middleware = new Middleware({
    connecting: connecting,
    touch: touch
});

// Create transport
const transport: Transport = new Transport(new ConnectionParameters({
    host: 'http://localhost',
    port: 3005,
    wsHost: 'ws://localhost',
    wsPort: 3005,
}), middleware);

// Create consumer
const consumer = new Consumer(transport);
```

> Pay you attention, to allow custom headers (like "*x-sec-token*") in example, provider transport should allow it. It's quite easy to do:


```typescript
import Transport, { ConnectionParameters, Middleware, Connection }  from 'ceres.provider.node.ws';
import Provider from 'ceres.provider';

const transport: Transport = new Transport(new ConnectionParameters({
    port: 3005,
    allowedHeaders: ['x-sec-token'] // Allow custom header from consumer
}));

const provider: Provider = new Provider(transport);

```

## Provider
Both transport implementations (**ceres.provider.node.ws**, **ceres.provider.node.longpoll**) for provider allows to defined middleware methods.

```typescript
import Transport, { ConnectionParameters, Middleware, Connection }  from 'ceres.provider.node.ws';
import Provider from 'ceres.provider';

// Create handler for authorization
function auth(clientId: string, request: Connection): Promise<void> {
    return new Promise((resolve, reject) => {
        // Here we have access to original request. For example we can check here HEADERS of request.
        // We can accept connection and resolve
        // Or we can deny connection and reject
        return resolve();
    });
};

// Create instance of middleware
const middleware: Middleware<Connection> = new Middleware({ auth: auth });

// Create transport
const transport: Transport = new Transport(new ConnectionParameters({
    port: 3005
}), middleware);

// Create provider
const provider = new Provider(transport);

```

# Other
## Debug
Default level of logs (for provider, consumer and transports) is 0 (ERROR). Available leveles:
- 0: ERROR
- 1: WARNINGS
- 2: DEBUG
- 3: INFO
- 4: ENV
- 5: VERBOS

To change log level on **consumer** 
```javascript
// Set global variable as soon as possible
window.CERES_LOGS_LEVEL = 2;
```

To change log level on **provider** add environment variable CERES_LOGS_LEVEL with value you want. Also you can just run it

```
CERES_LOGS_LEVEL=3 node myapp.js

# or if you have fish

env CERES_LOGS_LEVEL=3 node myapp.js
```

# Developing / How to use this repo
To start play around with this repo you should do a few simple steps:

> Note. You should have installed: ruby, node, typescript (globaly)

```
# Clone repo
git clone https://github.com/DmitryAstafyev/ceres.git
# Go into project's folder
cd ceres
# Install it (you need to do it once)
rake install
```

`rake install` will install all you need. After it will be finished, you are able to start test playground. 

Prepare playground first (needs once)
```
rake playground_install
rake playground_build
```

Now you can start two client and server:
```
cd playground/client.0
npm start

# In new terminal
cd playground/client.1
npm start

# In new terminal
cd playground/server
npm run build-ts
node playground/server/build/playground/server/src/main.js
```