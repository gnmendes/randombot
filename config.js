const dotenv = require('dotenv');

dotenv.config();


module.exports = Object.freeze({
    token: process.env.TOKEN,
    prefix: '!',
    channelID: process.env.GENERAL_CHANNELID,
    channelName:'bkpmsgs',
    embedMessageTitle: 'MENSAGEM MOVIDA',
    color: '#009ff',
    expectedError: 'You can only bulk delete messages that are under 14 days old.'
});