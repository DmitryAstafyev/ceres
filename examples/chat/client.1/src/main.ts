import * as Protocol from '../../protocol/protocol.chat';
import Transport, { ConnectionParameters } from 'ceres.consumer.browser.ws';
import Consumer from 'ceres.consumer';

// Step 1. Create transport
const transport = new Transport(new ConnectionParameters({
    host: 'http://localhost',
    port: 3005,
    wsHost: 'ws://localhost',
    wsPort: 3005,
}));

let consumer: Consumer;
let messageSequence: number = 0;
let resendTimer: any = -1;

// connection function
function connect() {
    if (consumer !== undefined) {
        // If consumer was defined -> this is reconnection process
        // Stop sending message
        clearTimeout(resendTimer);
        // Unsubscribe from events
        consumer.unsubscribeAll();
        consumer.destroy();
    }

    // Create consumer
    consumer = new Consumer(transport);

    // Subscribe to consumer events
    // Event: consumer successfully connected and ready to work
    consumer.subscribe(Consumer.Events.connected, () => {
        // subscribe to new chat event
        consumer.subscribeEvent(Protocol.Events.NewMessage, Protocol, onNewMessage) .then(() => {
            console.log('Subscription to "NewMessage" is done');
        }).catch((error: Error) => {
            console.log(`Fail to subscribe to "NewMessage" due error: ${error.message}`);
        });
        // Send request to get users list
        getUsersList();
        // Start sending message
        sendChatMessage();
    });

    // Event: consumer disconnected
    consumer.subscribe(Consumer.Events.disconnected, () => {
        // Reconnect with short delay
        setTimeout(connect, 1000);
    });

    // Event: consumer returns an error.
    consumer.subscribe(Consumer.Events.error, () => {
        // Reconnect with short delay
        setTimeout(connect, 1000);
    });

}

// Handler for new message event
function onNewMessage(event: Protocol.Events.NewMessage) {
    const p = document.createElement('p');
    p.innerHTML = `[${event.message.created.toTimeString()}][${event.message.nickname}]: ${event.message.message}`;
    p.style.color = 'rgb(200,230,230)';
    document.body.appendChild(p);
}

function getUsersList() {
    consumer.demand(
        Protocol, 
        new Protocol.Requests.GetUsersInChannel({ channelId: 1 }), 
        Protocol.Responses.ChannelUsersList, 
        { type: 'all' }, 
        { scope: Consumer.DemandOptions.scope.all }
    ).then((response: Protocol.Responses.ChannelUsersList) => {
        const wrapper = document.getElementById('users');
        response.users.forEach((user: Protocol.User) => {
            (wrapper as HTMLElement).innerHTML += `<p>${user.nickname}: ${user.firstName} ${user.lastName}</p>`;
        });
    }).catch((error: Error) => {
        console.log(`Fail to get users list due error: ${error.message}`);
    });
}

function sendChatMessage() {
    const message: Protocol.ChatMessage = new Protocol.ChatMessage({
        id: messageSequence++,
        nickname: 'client.1',
        message: `${Math.random().toFixed(10)}`,
        created: new Date(),
        channelId: 1
    });
    const p = document.createElement('p');
    p.innerHTML = `[my message]: ${message.message}`;
    document.body.appendChild(p);
    consumer.eventEmit(new Protocol.Events.NewMessage({
        channelId: 1,
        message: message
    }), Protocol).then(() => {
        console.log(`Message was sent`);
        resendTimer = setTimeout(sendChatMessage, Math.random() * 2000 + 1000);
    });
}

connect();
