const { token } = require('../config');
const DISCORD = require('discord.js');

const discordClient = new DISCORD.Client();

const loginOnServer = () => {
    discordClient.login(token);
}

discordClient.once('ready', () => {
    console.log('Ready!');
});

module.exports = {
    loginOnServer
};