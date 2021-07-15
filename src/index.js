const { loginOnServer, getAllChannelMessages, client } = require('./discordwrapper.js');

const { parseMessage } = require('./messageparser');
loginOnServer();

// client.on('message', async message => {
//     await getAllChannelMessages(message.channel);
// });


client.on('message', async message => {
    parseMessage(message);
});
