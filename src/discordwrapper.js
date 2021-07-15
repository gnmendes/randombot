const { token, 
        channelName, 
        embedMessageTitle, 
        color, 
        expectedError 
    } = require('../config');
const Discord = require('discord.js');

const discordClient = new Discord.Client();

const loginOnServer = () => discordClient.login(token);

discordClient.once('ready', () => console.log('Ready!'));

const deleteMessageCommand = {
    true: deleteSingleMessage,
    false: bulkDeleteMessages
};


const moveMessages = async message => {
    
    const args = message.content.split(' ');

    const originChannelID = args[1] || '';
    const destChannelID = args[2] || '';

    const originChannel = getChannel(originChannelID || 0);
    let destChannel = getChannel(destChannelID || 0);
    
    if (!destChannel) destChannel = await createChannel(message, channelName);
    
    const messagesFromOriginChannel = await getAllChannelMessages(originChannel);
    
    for (const _message of messagesFromOriginChannel) {
        try {
            const embedMessage = generateEmbedMessage(_message);
            await notify(destChannel, embedMessage);
        } catch (error) {
            console.log(error);
        }
    }
    
    const deleteArgs = {
        messages: createChunks(messagesFromOriginChannel, 100),
        channel: originChannel
    };

    deleteMessageCommand[messagesFromOriginChannel.length == 1](deleteArgs);

    const delEmbedMessage = {
        embed: {
            title: 'Deletando mensagens',
            description: 'O processo de limpeza do canal foi startado e em breve todas essas mensagens serão deletadas',
            color: '#ff0000'
        }
    };
    notify(originChannel, delEmbedMessage);
};

async function notify(channel, message) {
    await channel.send(message);
};

function getChannel(channelID) {
    return discordClient.channels.cache.get(channelID);
};

async function createChannel(message, channelName) {
    try {
        return await message.guild.channels.create(channelName, { 
            type: 'text', 
            nsfw: false, 
            permissionOverwrites: [{ 
                id: message.guild.roles.highest,
                allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS', 'MANAGE_ROLES']
            }]
        });
    } catch (error) {
        console.log(error.message);
    }
    
};

function createChunks(arr, chunkSize) {
    const res = [];
    while (arr.length > 0) {
        const chunk = arr.splice(0, chunkSize);
        res.push(chunk);
    }
    return res;
}

const getAllChannelMessages = async (channel) => {
    let size = 0;
    const options = { limit: 100 };
    const messages = [];

    do {
        const messagesFounded = await channel.messages.fetch(options);
        const lastMessage = messagesFounded.last();
        options['before'] = lastMessage.id;

        for ([key, value] of messagesFounded) {
            messages.push(value);
        }

        size = messagesFounded.size;

    }  while (size == 100);

    console.log(`${messages.length} MESSAGES FOUNDED!`);
    console.log(messages);

    return messages;
};

function generateEmbedMessage(originalMessage) {
    let parameters = {};
    if (originalMessage.embeds.length) {
        parameters = getEmbedMessageBasicProperties(originalMessage);
    } else {
        parameters.color = color;
        parameters.content = originalMessage.content;
    }
    parameters.userID = originalMessage.author.tag;
    parameters.authorName = originalMessage.author.username;
    parameters.avatarURL = originalMessage.author.avatarURL() || originalMessage.author.defaultAvatarURL;
    parameters.title = embedMessageTitle;
    parameters.files = verifyAndTreatAttachments(originalMessage.attachments);
    return getEmbedMessage(parameters);
};

function getEmbedMessageBasicProperties(originalMessage) {
    const embedMessage = originalMessage.embeds[0];
    return {
        color: embedMessage.hexColor,
        content: embedMessage.description,
        type: embedMessage.type
    };
};

function verifyAndTreatAttachments(attachments) {
    const files = [];
    
    for (const [, { attachment, name }] of attachments) {
        const fileInfo = {
            attachment: attachment,
            imageName: name || 'Random image'
        }
        files.push(fileInfo);
    }

    return files;
};

function getEmbedMessage({ color, userID, authorName, content, avatarURL, title, files }) {
    const embedMessage = new Discord.MessageEmbed()
                .setColor(color)
                .setTitle(title)
                .setAuthor(`${authorName}/${userID}`, avatarURL)
                .setDescription(content)
                .setThumbnail(avatarURL);
    
    return addImages(files, embedMessage);
}

function addImages(files, embedMessage) {
    for ( const { attachment, imageName } of files) {
        embedMessage.setImage(attachment)
                    .addField('Image title', imageName, true);
    }
    return embedMessage;
};

async function deleteSingleMessage({ message }) {
    try {
        await message.delete();    
    } catch (error) {
        console.log(error.message);
    }
    
}

async function bulkDeleteMessages({ messages, channel }) {

    messages.forEach(async message => {
        try {
            await channel.bulkDelete(message);
        } catch (error) {
            console.log('Erro ao tentar deletar um grupo de mensagens', error.message);
            retryIfPossible(error.message, message, channel);
            
        }
    });
};

function retryIfPossible(errorMessage, messages, channel) {
    
    if (errorMessage === expectedError) {
        deleteOneByOne(messages, channel);
    };
};

async function deleteOneByOne(messages, channel) {
    messages.forEach( async message => await deleteSingleMessage({message}));
};

module.exports = {
    loginOnServer,
    client: discordClient,
    moveMessages,
    getAllChannelMessages
};