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
            "channelId": "int16",
            "message": "ChatMessage"
        },
        "RemovedMessage": {
            "channelId": "int16",
            "messageId": "int16"
        }
    },
    /* This is description of possible requests and responses in system */
    "Requests": {
        "GetUsersInChannel": {
            "channelId": "int16"
        },
        "GetChannels": {}
    },
    "Responses": {
        "ChannelUsersList": {
            "channelId": "int16",
            "users": "Array<User>"
        },
        "ChannelsList": {
            "channels": "Array<Channel>"
        }
    },
    /* Description of entities in system */
    "ChatMessage": {
        "id": "int16",
        "channelId": "int16",
        "nickname": "asciiString",
        "message": "utf8String",
        "created": "datetime"
    },
    "User": {
        "nickname": "asciiString",
        "firstName": "utf8String",
        "lastName": "utf8String"
    },
    "Channel": {
        "name": "utf8String",
        "created": "datetime"
    },
    "version": "0.0.1"
}
```
Our simple chat will include:
- Channels. One channel is described by object "**Channel**"
- Users in each channel. Each user is described by object "**User**"
- Messages. Message is described by object "**ChatMessage**"

In our system we will have next events:
- **NewMessage** new message is posted in channel
- **RemovedMessage** message is removed from channel

Also we will have a few requests (from client to server)
- **GetUsersInChannel** to get list of user in channel and as response we will expect **ChannelUsersList**
- **GetChannels** to get list of available channels and as response we will expect **ChannelsList**

> **Note**. **Ceres.protocol** allows you describe communication between parts of your system within very easy readable JSON format.

Create folder "*chat*", subfolder "*protocol*" and save JSON there as "*chat/protocol/protocol.chat.json*"

> **Note**. Ceres.protocol suppors comments (`/**/`) in JSON files, so you can leave it there.

## Step 2. Create protocol
To create protocol we need to install [ceres.protocol](https://github.com/DmitryAstafyev/ceres.protocol). We do **not** need it as dependency, because generated implementation of protocol will have everything to work.

Install globaly 
```
npm install ceres.protocol -g
```

Generate protocol:
```
cd chat
ceres.protocol -s ./protocol/protocol.chat.json -o ./protocol/protocol.chat.ts -r
```

Now we have generated protocol implementation in file **./protocol/protocol.chat.ts**

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

// Step 1. Create transport
const transport = new Transport(new ConnectionParameters({
    port: 3005 // We will use port 3005 for WebSocket
}));

// Step 2. Create provider
const provider = new Provider(transport);
```

Basicaly we already created server. Yes, 6 lines of code and we already have a server.

In our system we have a few requests to server as it was described before: 
- GetUsersInChannel
- GetChannels

Let's implement support of this requests. We will need our protocol, which we generated a step ago.

```typescript
import Transport, { ConnectionParameters }  from 'ceres.provider.node.ws';
import Provider from 'ceres.provider';
// Attach protocol
import * as Protocol from '../protocol/protocol.chat';

const transport = new Transport(new ConnectionParameters({
    port: 3005
}));

const provider = new Provider(transport);

// Make subscription to requests
provider.subscribeToRequest(
    Protocol,                       // Reference to our protocol
    Protocol.Requests.GetChannels,  // Reference to request, which we would like to process
    { 
        type: 'available'           // Query. Basicaly it's a filter, which allow us make process same requests, but with different nature. 
    },                              // For example "available" means all channels with users; but also we can add "offline" - all empty channels and so on.
    onRequestGetChannels            // Our handler for request
);

function onRequestGetChannels(
    demand: Protocol.Requests.GetChannels,                                              // As first argument we will get body of request (demand)
    callback: (error: Error | null, results: Protocol.Responses.ChannelsList) => any    // As second - callback to send our response
) {
    callback(null, new Protocol.Responses.ChannelsList({
        channels: [
            new Protocol.Channel({ name: 'channel #1', created: new Date() }),
            new Protocol.Channel({ name: 'channel #2', created: new Date() }),
            new Protocol.Channel({ name: 'channel #3', created: new Date() }),
        ]
    }));
}

provider.subscribeToRequest(
    Protocol,                               
    Protocol.Requests.GetUsersInChannel,
    { 
        type: 'all'                         
    },                                      
    onRequestGetUsersInChannel                    
);

function onRequestGetUsersInChannel(
    demand: Protocol.Requests.GetUsersInChannel,                                              
    callback: (error: Error | null, results: Protocol.Responses.ChannelUsersList) => any
) {
    /*
    // Do something with request
    const users = DB.get({ channel: demand.channelId });
    */

    callback(null, new Protocol.Responses.ChannelUsersList({
        channelId: demand.channelId,
        users: [
            new Protocol.User({ nickname: 'user #1', firstName: 'fakename', lastName: 'fakename'}),
            new Protocol.User({ nickname: 'user #2', firstName: 'fakename', lastName: 'fakename'}),
            new Protocol.User({ nickname: 'user #3', firstName: 'fakename', lastName: 'fakename'}),
            new Protocol.User({ nickname: 'user #4', firstName: 'fakename', lastName: 'fakename'}),
        ]
    }));
}
```

That's all. Server for our chat is done.

## Step 4. Create chat client
We will need at least two clients to demostrate communication process not only between client <-> server, but also between clients.
Because it will be page for browser we will need a little bit more packages. 

> **Note**. You can find source of this example in repository "/examples/chat".

As dependencies we will need only two packages, other we will need just as devDependencies. Bellow package.json of client:
```
{
  "name": "example.chat.client.0",
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
  "author": "Dmitry Astafyev",
  "license": "MIT",
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








# Components
Network transport/protocol **Ceres** includes next components:
- **Provider**. Provider like a server accepts connections from consumers (clients) and manage it.
- **Consumer**. Consumer is a client for provider.
- **Protocol generator**. Ceres works based on ceres.protocol - JavaScript protocol generated from the scheme (scheme is presented as JSON file). More information about protocol is [here](https://github.com/DmitryAstafyev/ceres.protocol).
- **Transport implementations**. Not consumer, not provider doesn't have transport implementation. Implementation of transport should be delivered to provider and consumer. 


