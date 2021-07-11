const { token, channelName } = require('../config');
const Discord = require('discord.js');

const discordClient = new Discord.Client();

const loginOnServer = () => {
    discordClient.login(token);
};

discordClient.once('ready', () => console.log('Ready!') );

async function createChannel(message, channelName) {
    return await message.guild.channels.create(channelName, { 
        type: "text", 
        nsfw: false, 
        permissionOverwrites: { id: message.guild.roles.highest }
    });
}


function getChannel(channelID) {
    return discordClient.channels.cache.get(channelID);
}


const getAllChannelMessages = async (channelID) => {
    const channel = getChannel(channelID);
    let size = 0;
    const options = { limit: 100 };
    const messages = [];

    let isFirst = false;
    do {
        const messagesFounded = await channel.messages.fetch(options) || [new Map()];
        
        for ([key, value] of messagesFounded) {
            
            if (!isFirst) {
                isFirst = true;
                options['before'] = key;
            }

            if (value) messages.push(value);
        }
        isFirst = false;
        size = messagesFounded.size;

    }  while (size == 100);
    
    console.log(`${messages.length} MESSAGES FOUNDED!`);
    console.log(messages);

    return messages;
};


function generateEmbedMessage(originalMessages) { };


const moveMessages = (message) => {
    
    const args = message.content.split(' ');

    const originChannelID = args[1];
    const destChannelID = args[2];
    const messagesFromOriginChannel = await getAllChannelMessages(originChannelID);

    const destChannel = getChannel(destChannelID || 0);
    
    if (!destChannel) destChannel = await createChannel(message, channelName);
    
    messagesFromOriginChannel.forEach( async message => {
        destChannel.
    })
    
};

module.exports = {
    loginOnServer,
    client: discordClient,
    moveMessages
};