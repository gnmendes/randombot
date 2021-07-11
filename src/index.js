const { loginOnServer, listMessagesFromChannel, client } = require('./discordwrapper.js');

const { parseMessage } = require('./messageparser');
loginOnServer();


client.on('message', async message => {
    const channel = await message.guild.channels.create(channelName, { 
        type: "text", 
        nsfw: false, 
        permissionOverwrites: { id: message.guild.roles.highest }
    });
    
    parseMessage(message);
});
