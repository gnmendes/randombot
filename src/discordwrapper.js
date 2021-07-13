const { token, channelName, embedMessageTitle, color } = require('../config');
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
            await destChannel.send(embedMessage);    
        } catch (error) {
            console.log(error);
        }
    }

    deleteMessageCommand[messagesFromOriginChannel.length == 1](messagesFromOriginChannel, message.channel);
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

const getAllChannelMessages = async (channel) => {
    let size = 0;
    const options = { limit: 100 };
    const messages = [];

    let isFirst = false;

    const messagesFounded = await channel.messages.fetch(options) || [new Map()];
    
    for (const [key, value] of messagesFounded) {
        
        if (!isFirst) {
            isFirst = true;
            options['before'] = key;
        }

        if (value) messages.push(value);
    }
    isFirst = false;
    size = messagesFounded.size;

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

async function deleteSingleMessage(message, channel) {
    await message.delete();
    const notifyMessage = `Mensagem excluida! ${message[0]}`;
    channel.send(notifyMessage);
}

function bulkDeleteMessages(messages, channel) {
    channel.bulkDelete(messages).catch( error => console.log('DEU ERRO TENTANDO DELETAR', error));
};

module.exports = {
    loginOnServer,
    client: discordClient,
    moveMessages
};