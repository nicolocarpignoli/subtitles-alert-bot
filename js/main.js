var TelegramBot = require('node-telegram-bot-api');
var addic7edApi = require('addic7ed-api');
var BotGui = require('./gui/keyboards.js');
var Common = require('./common.js');
var TvMaze = require('./libs/tvMaze.js');
var telegramBotToken = '398340624:AAH3rtCzaX9Y2fDU0ssRrK4vhRVh1PpZA0w';
var choosingSeries = false;

// Setup polling way
var bot = new TelegramBot(telegramBotToken, { polling: true });

console.log("Starting bot..");
bot.onText(/\/start/, (msg, match) => {
    if (!choosingSeries) bot.sendMessage(msg.chat.id, Common.instructionsMessage, BotGui.generateKeyboardOptions());
});

var regExp = new RegExp(Common.getCommand);
bot.onText(regExp, (msg, match) => {
    bot.sendMessage(msg.chat.id, Common.whichSeriesMessage);
    choosingSeries = true;
})

bot.onText(/(.*?)/, (msg, match) => {
    var userInput = match.input;
    if (userInput != Common.getCommand && choosingSeries) {
        choosingSeries = false;
        console.log("Ok you just choose ", userInput);
        let seriesSearched = tvMaze.checkSeriesValidity(userInput);
        if(seriesSearched.length > 1){
            bot.sendMessage(msg.chat.id, "Mmh ambigous! Which of these?", BotGui.generateSeriesInlineKeyboard(seriesSearched));
        }
        //TODO qui facciamo partire le api di TvMaze per vedere se la serie esiste, ecc.
        // quindi il flusso di dialogo fra utente/bot per la Get (tramite inlineKeyboards)
    }
})