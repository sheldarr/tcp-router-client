const Commands = require('./commands');
const Protocol = require('../protocol');

function Dispatcher (client, onMessage) {
    var state = {
        credentials: {
            id: 0,
            key: ''
        }
    };

    this.dispatch = (command) => {
        switch (command.type) {

        case Commands.SEND_BROADCAST_REQUEST:
            client.write(JSON.stringify({
                credentials: state.credentials,
                message: command.message,
                type: Protocol.BROADCAST_REQUEST
            }));
            break;

        case Commands.SEND_CREATE_SESSION_REQUEST:
            client.write(JSON.stringify({
                credentials: state.credentials,
                type: Protocol.CREATE_SESSION_REQUEST
            }));
            break;

        case Commands.SEND_CREDENTIALS_REQUEST:
            client.write(JSON.stringify({
                type: Protocol.CREDENTIALS_REQUEST
            }));
            break;

        case Protocol.BROADCAST_RESPONSE:
            onMessage(command.message);
            break;

        case Protocol.CREDENTIALS_RESPONSE:
            state = Object.assign({}, state, {
                credentials: command.credentials
            });
            break;

        default:
            break;
        };
    };
};

module.exports = Dispatcher;
