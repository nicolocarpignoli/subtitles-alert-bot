var TelegramBot = require('node-telegram-bot-api');
var Addic7ed = require('./libs/addic7ed.js');
var BotGui = require('./gui/keyboards.js');
var Common = require('./common.js');
var TvMaze = require('./libs/tvMaze.js');
var Model = require('./models/languages.js');
var telegramBotToken = '398340624:AAH3rtCzaX9Y2fDU0ssRrK4vhRVh1PpZA0w';
var choosingSeries = false;
var choosingSeason = false;
var choosingEpisode = false;
var choosingLanguage = false;
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
    if(!Common.isEmpty(ambiguousSeries)){
        ambiguousSeries.forEach(function(element) {
            if(element.show.name == chosenSeriesFromMenu) choosenSeries = element;
        }, this);
    }else{
        choosenSeries = chosenSeriesFromMenu;
    }
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
        bot.sendMessage(msg.from.id, Common.whichSeasonMessage);
    }
});

bot.onText(/(.*?)/, (msg, match) => {
    var userInput = match.input;

    if (Common.notACommand(userInput) && choosingSeries) {
        let promise = TvMaze.checkSeriesValidity(userInput);
        promise.then(function (response) {
            switch (response.length) {
                case 0:
                    bot.sendMessage(msg.chat.id, Common.failedSeriesMessage);
                    choosingSeries = false;
                    break;
                case 1:
                    bot.sendMessage(msg.chat.id, Common.whichSeasonMessage);
                    handleChosenSeries(response[0]);
                    break;
                default:
                    ambiguousSeries = response;
                    bot.sendMessage(msg.chat.id, Common.ambiguousSeriesMessage, 
                        BotGui.generateSeriesInlineKeyboard(response));
                    break;
            }
        });
    }

    else if (Common.notACommand(userInput) && choosingSeason) {
        if (isNaN(userInput)) {
            bot.sendMessage(msg.chat.id, Common.notANumberMessage);
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
                    choosingLanguage = true;
                    bot.sendMessage(msg.chat.id, "Great! Which language do I have to search for?"); 
                }
            });
        }
    }
    else if(Common.notACommand(userInput) && choosingLanguage){
        resetValues();
        var chosenLanguage = "";
        Object.keys(Model.languages).forEach(function(key,index) {
            // accepted "native" version and 3 chars version (e.g. "english" or "eng")
            if((key.length == 3 && Model.languages[key]["native"][0].toUpperCase() === userInput.toUpperCase())
                || (key.length == 3 && key.toUpperCase() == userInput.toUpperCase())){
                chosenLanguage = key;
                return;
            }
        }, this);
        // da gestire se l'utente inserisce un language errato
        Addic7ed.addic7edGetSubtitle(choosenSeries.show.name, choosenSeason, choosenEpisode, chosenLanguage, bot, msg.chat.id);
        resetValues();
    }
})