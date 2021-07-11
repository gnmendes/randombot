const { prefix } = require('../config.js');

const { moveMessages } = require('../src/discordwrapper.js');
const commands = {
    mv: moveMessages
};


function isValid(message) {
    if ( !message || !(message.content.startsWith(prefix))) return false;
    return true;
}

const parse = message => {

    if (!isValid(message)) return;
    
    const commandWithArgs = message.content.slice(prefix.length) || ' ';
    const command = commandWithArgs.split(' ')[0];

    const f = commands[command];
    if (!f) return 'Comando inválido';

    

    f(message);
    
};

module.exports = {
    parseMessage: parse
}