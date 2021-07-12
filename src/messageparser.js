const { prefix } = require('../config.js');

const { moveMessages } = require('../src/discordwrapper.js');
const commands = {
    mv: moveMessages
};


function isValid(message) {
    if ( !message || !(message.content.startsWith(prefix))) return false;
    return true;
}

const parse = async message => {

    if (!isValid(message)) return;
    console.log(message.content);
    const commandWithArgs = message.content.slice(prefix.length) || ' ';
    const command = commandWithArgs.split(' ')[0];

    const f = commands[command];
    if (!f) message.client.send('Comando inválido');
    else await f(message);
    
};

module.exports = {
    parseMessage: parse
}