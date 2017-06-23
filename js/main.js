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
        var result = TvMaze.checkSeriesValidity(userInput);
        if (result)
            result.then(function (response) {
                // console.log('------RESULT------: ', response);
                switch (response.length) {
                    case 0:
                        bot.sendMessage(msg.chat.id, "Sorry, no series found with that name :(");
                        break;
                    case 1:
                        bot.sendMessage(msg.chat.id, "Good! Wich season?");
                        break;
                    default:
                        bot.sendMessage(msg.chat.id, "Mmh ambiguous! Which of these?", BotGui.generateSeriesInlineKeyboard(response));
                        break;
                }
            });
    }
})