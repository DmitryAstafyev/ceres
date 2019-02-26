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
    (new ChatClient());
});
