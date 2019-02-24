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
    { type: 'all' },                                      
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