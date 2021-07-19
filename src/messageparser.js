const { prefix } = require('../config.js');
const { moveMessages } = require('../src/discordwrapper.js');

const commands = {
    mv: moveMessages
};


function isValid(message) {
    if ( !message || !(message.content.startsWith(prefix))) return false;
    return true;
}

function validateArgs(message) {
    const arguments = message.content.split(' ');
    return isValid(message) || lengthIsValid(arguments) || argsContent(arguments);
};

function lengthIsValid(args) {
  return args.length === 3;
};

function argsContent(args) {
    let flag = true;
    for (const arg in args) {
        if (!arg) {
            flag = false;
            break;
        }
    }
    return flag;
};

const parse = async message => {

    if (!validateArgs(message)) return;

    const msgContent = message.content;
    console.log(msgContent);
    const commandWithArgs = msgContent.slice(prefix.length) || ' ';
    const command = commandWithArgs.split(' ')[0];

    const args = msgContent.split(' ');

    const content = {
        firstArg: args[1],
        secondArg: args[2],
        actualMessage: message
    };

    const f = commands[command];
    if (!f) return;
    else await f(content);
    
};

module.exports = {
    parseMessage: parse
}