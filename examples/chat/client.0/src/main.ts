import * as Protocol from '../../protocol/protocol.chat';
import Transport, { ConnectionParameters } from 'ceres.consumer.browser.ws';
import Consumer from 'ceres.consumer';

// Step 1. Create transport
const transport = new Transport(new ConnectionParameters({
    host: 'http://{sub[1..200]}.localhost',
    port: 3005,
    wsHost: 'ws://localhost',
    wsPort: 3005,
}));

// Step 2. Create consumer
const consumer = new Consumer(transport);

// Step 3. Subscribe to consumer events
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
});
// Event: consumer disconnected
consumer.subscribe(Consumer.Events.disconnected, () => {
    // Unsubscribe from events
    consumer.unsubscribeAll();
});
// Event: consumer returns an error.
consumer.subscribe(Consumer.Events.error, () => {
    // Drop connection. Here we should define procedure of reconnection
    consumer.unsubscribeAll();
    consumer.destroy();
});

// Handler for new message event
function onNewMessage(event: Protocol.Events.NewMessage) {
    const p = document.createElement('p');
    p.innerHTML = `[${event.message.created.toTimeString()}][${event.message.nickname}]: ${event.message.message}`;
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
