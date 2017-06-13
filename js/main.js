var TelegramBot = require('node-telegram-bot-api');
var addic7edApi = require('addic7ed-api');
var http = require('http');


var token = '398340624:AAH3rtCzaX9Y2fDU0ssRrK4vhRVh1PpZA0w';
// Setup polling way
var bot = new TelegramBot(token, {polling: true});

console.log("Starting..");

// Matches /echo [whatever]
bot.onText(/\/charm (.+)/, (msg, match) => {

    bot.sendMessage(msg.chat.id, 'Received your message coglione');

});
