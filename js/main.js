var TelegramBot = require('node-telegram-bot-api');
var addic7edApi = require('addic7ed-api');
var BotGui = require('./gui/keyboards.js');
var Common = require('./common.js');
var TvMaze = require('./libs/tvMaze.js');
var telegramBotToken = '398340624:AAH3rtCzaX9Y2fDU0ssRrK4vhRVh1PpZA0w';
var choosingSeries = false;
var choosingSeason = false;
var choosingEpisode = false;
var choosenSeries = {};
var choosenSeason;
var choosenEpisode;
var ambiguousSeries = {};

function resetValues() {
    choosingSeries = false;
    choosingSeason = false;
    choosingEpisode = false;
    ambiguousSeries = {};
}

var bot = new TelegramBot(telegramBotToken, { polling: true });

console.log("Starting bot...");

function handleChosenSeries(chosenSeriesFromMenu){
    ambiguousSeries.forEach(function(element) {
        if(element.show.name == chosenSeriesFromMenu) choosenSeries = element;
    }, this);
    resetValues();
    choosingSeason = true;
}

bot.onText(/\/start/, (msg, match) => {
    if (!choosingSeries) bot.sendMessage(msg.chat.id, Common.instructionsMessage, BotGui.generateKeyboardOptions());
});

bot.onText(Common.GETregExp, (msg, match) => {
    bot.sendMessage(msg.chat.id, Common.whichSeriesMessage);
    resetValues();
    choosingSeries = true;
})

bot.on('callback_query', (msg) => {
    var userInput = msg.data;
    if (Common.notACommand(userInput) && choosingSeries){
        handleChosenSeries(userInput);
        bot.sendMessage(msg.from.id, "Good! Wich season?");
    }
});

bot.onText(/(.*?)/, (msg, match) => {
    var userInput = match.input;

    if (Common.notACommand(userInput) && choosingSeries) {
        console.log("Ok you just choose ", userInput);
        let promise = TvMaze.checkSeriesValidity(userInput);
        promise.then(function (response) {
            // console.log('------RESULT------: ', response);
            switch (response.length) {
                case 0:
                    bot.sendMessage(msg.chat.id, "Sorry, no series found with that name :(");
                    choosingSeries = false;
                    break;
                case 1:
                    bot.sendMessage(msg.chat.id, "Good! Wich season?");
                    handleChosenSeries(response[0]);
                    break;
                default:
                    ambiguousSeries = response;
                    bot.sendMessage(msg.chat.id, "Mmh ambiguous! Which of these? (if none of these is " +
                        + "the series you are looking for, try GET again with a more precise name)", 
                        BotGui.generateSeriesInlineKeyboard(response));
                    break;
            }
        });
    }

    else if (Common.notACommand(userInput) && choosingSeason) {
        if (isNaN(userInput)) {
            bot.sendMessage(msg.chat.id, "This doesn't seem to be a valid number, dude... retry!");
            return;
        }
        else {
            let promise = TvMaze.checkSeasonValidity(choosenSeries.show.id, userInput);
            promise.then(function (response) {
                if (response === false)
                    bot.sendMessage(msg.chat.id, "Season not found or not out yet. Retry or restart GET!");
                else {
                    choosenSeason = userInput;
                    resetValues();
                    choosingEpisode = true;
                    bot.sendMessage(msg.chat.id, "Great! Wich episode?");
                }
            });
        }
    }
    else if (Common.notACommand(userInput) && choosingEpisode) {
        if (isNaN(userInput)) {
            bot.sendMessage(msg.chat.id, "This doesn't seem to be a valid number, dude... retry!");
            return;
        }
        else {
            let promise = TvMaze.checkEpisodeValidity(choosenSeries.show.id, choosenSeason, userInput);
            promise.then(function (response) {
                if (response !== true)
                    bot.sendMessage(msg.chat.id, "Episode doesn't exist or not found. Retry or restart GET!");
                else {
                    choosenEpisode = userInput;
                    resetValues();
                    bot.sendMessage(msg.chat.id, "Great! I'll search your subtitles ;)"); 
                    //e invece deve scegliere la lingua e poi si può chiamare addic7ed
                }
            });
        }
    }
})