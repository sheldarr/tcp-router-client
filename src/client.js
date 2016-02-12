const net = require('net');
const winston = require('winston');

const Commands = require('./commands');
const Dispatcher = require('./dispatcher');
const Protocol = require('../protocol');

function Client (serverAddress, port, onMessage) {
    const logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)(),
            new (winston.transports.File)({filename: 'client.log'})
        ]
    });

    const client = new net.Socket();
    const dispatcher = new Dispatcher(client, onMessage);

    client.connect(port, serverAddress, () => {
        logger.info(`Connected to ${serverAddress}:${port}`);

        client.write(JSON.stringify({
            type: Protocol.CREDENTIALS_REQUEST
        }));
    });

    client.on('data', (data) => {
        logger.info(`${serverAddress}:${port} > ${data}`);

        var response = JSON.parse(data);

        if (response.error) {
            logger.error(response.error);
            return;
        }

        var command = Object.assign(response, {
            client
        });

        dispatcher.dispatch(command);
    });

    client.on('error', (error) => {
        logger.error(error);
    });

    client.on('close', () => {
        logger.info(`Connection with ${serverAddress}:${port} closed`);
    });

    this.broadcast = (message) => {
        logger.info(`${serverAddress}:${port} > ${message}`);

        dispatcher.dispatch({
            message: message,
            type: Commands.SEND_BROADCAST_REQUEST
        });
    };

    this.createSession = () => {
        logger.info(`${serverAddress}:${port} > ${Commands.CREATE_SESSION_REQUEST}`);

        dispatcher.dispatch({
            type: Commands.SEND_CREATE_SESSION_REQUEST
        });
    };
}

module.exports = Client;
