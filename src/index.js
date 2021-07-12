const { loginOnServer, listMessagesFromChannel, client } = require('./discordwrapper.js');

const { parseMessage } = require('./messageparser');
loginOnServer();


client.on('message', async message => {
    parseMessage(message);
});
