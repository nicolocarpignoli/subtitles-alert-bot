var TelegramBot = require('node-telegram-bot-api');
var addic7edApi = require('addic7ed-api');
var BotGui = require('./gui/keyboards.js');
var http = require('http');
var telegramBotToken = '398340624:AAH3rtCzaX9Y2fDU0ssRrK4vhRVh1PpZA0w';
var Common = require('./common.js');
var choosingSeries = false;

// Setup polling way
var bot = new TelegramBot(telegramBotToken, {polling: true});

console.log("Starting bot..");
bot.onText(/\/start/, (msg, match) => {
    if(!choosingSeries) bot.sendMessage(msg.chat.id, Common.instructionsMessage, BotGui.generateKeyboardOptions());
});

var regExp = new RegExp(Common.getCommand);
bot.onText(regExp, (msg, match) => {
    bot.sendMessage(msg.chat.id, Common.whichSeriesMessage);
    choosingSeries = true;
})

bot.onText(/(.*?)/, (msg, match) => {
    if(match.input != Common.getCommand && choosingSeries){
        choosingSeries = false;
        console.log("Ok u just chose ", match.input);
        //TODO qui facciamo partire le api di TvMaze per vedere se la serie esiste, ecc.
        // quindi il flusso di dialogo fra utente/bot per la Get (tramite inlineKeyboards)
    }
})


