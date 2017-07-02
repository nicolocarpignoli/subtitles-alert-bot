var TelegramBot = require('node-telegram-bot-api');
var Addic7ed = require('./libs/addic7ed.js');
var BotGui = require('./gui/keyboards.js');
var Common = require('./common.js');
var TvMaze = require('./libs/tvMaze.js');
var Model = require('./models/languages.js');
var telegramBotToken = '398340624:AAH3rtCzaX9Y2fDU0ssRrK4vhRVh1PpZA0w';
var Session = require('./models/session.js');
var sessions = [];


function resetValues(session) {
    session.choosingSeries = false;
    session.choosingSeason = false;
    session.choosingEpisode = false;
    session.ambiguousSeries = {};
    session.counterLanguage = 0;
}

var bot = new TelegramBot(telegramBotToken, { polling: true });

console.log("Starting bot...");

function handleChosenSeries(chosenSeriesFromMenu){
    if(!Common.isEmpty(ambiguousSeries)){
        ambiguousSeries.forEach(function(element) {
            if(element.show.name == chosenSeriesFromMenu) session.choosenSeries = element;
        }, this);
    }else{
        session.choosenSeries = chosenSeriesFromMenu;
    }
    resetValues(session);
    session.choosingSeason = true;
    //Common.pushInSessions(sessions,session);

}

bot.onText(/\/start/, (msg, match) => {
    var session = Common.checkSessions(sessions,msg.chat.id);
    if (!session.choosingSeries) bot.sendMessage(msg.chat.id, Common.instructionsMessage, 
        BotGui.generateKeyboardOptions());
});

bot.onText(Common.GETregExp, (msg, match) => {
    var session = Common.checkSessions(sessions, msg.chat.id);
    bot.sendMessage(msg.chat.id, Common.whichSeriesMessage);
    resetValues(session);
    session.choosingSeries = true;
    Common.pushInSessions(sessions,session);
})

bot.on('callback_query', (msg) => {
    var session = Common.checkSessions(sessions, msg.chat.id);
    var userInput = msg.data;
    if (Common.notACommand(userInput) && session.choosingSeries){
        handleChosenSeries(userInput);
        bot.sendMessage(msg.from.id, Common.whichSeasonMessage);
    }
});

bot.onText(/(.*?)/, (msg, match) => {
    var userInput = match.input;
    var session = Common.checkSessions(sessions, msg.chat.id);
    if (Common.notACommand(userInput) && session.choosingSeries) {
        let promise = TvMaze.checkSeriesValidity(userInput);
        promise.then(function (response) {
            switch (response.length) {
                case 0:
                    bot.sendMessage(msg.chat.id, Common.failedSeriesMessage);
                    session.choosingSeries = false;
                    //Common.pushInSessions(sessions,session);
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

    else if (Common.notACommand(userInput) && session.choosingSeason) {
        if (isNaN(userInput)) {
            bot.sendMessage(msg.chat.id, Common.notANumberMessage);
            return;
        }
        else {
            let promise = TvMaze.checkSeasonValidity(session.choosenSeries.show.id, userInput);
            promise.then(function (response) {
                if (response === false)
                    bot.sendMessage(msg.chat.id, Common.seasonNotFoundMessage);
                else {
                    session.choosenSeason = userInput;
                    resetValues(session);
                    session.choosingEpisode = true;
                    //Common.pushInSessions(sessions,session);
                    bot.sendMessage(msg.chat.id, Common.whichEpisodeMessage);
                }
            });
        }
    }
    else if (Common.notACommand(userInput) && session.choosingEpisode) {
        if (isNaN(userInput)) {
            bot.sendMessage(msg.chat.id, Common.notANumberMessage);
            return;
        }
        else {
            let promise = TvMaze.checkEpisodeValidity(choosenSeries.show.id, session.choosenSeason, userInput);
            promise.then(function (response) {
                if (response !== true)
                    bot.sendMessage(msg.chat.id, Common.episodeNotFoundMessage);
                else {
                    session.choosenEpisode = userInput;
                    resetValues(session);
                    session.choosingLanguage = true;
                    //Common.pushInSessions(sessions,session);
                    bot.sendMessage(msg.chat.id, Common.whichLanguageMessage); 
                }
            });
        }
    }
    else if(Common.notACommand(userInput) && session.choosingLanguage){
        var chosenLanguage = "";
        Object.keys(Model.languages).forEach(function(key,index) {
            // accepted "native" version and 3 chars version (e.g. "english" or "eng")
            if((key.length == 3 && Model.languages[key]["native"][0].toUpperCase() === userInput.toUpperCase())
                || (key.length == 3 && key.toUpperCase() == userInput.toUpperCase())){
                session.chosenLanguage = key;
                resetValues(session);
                Addic7ed.addic7edGetSubtitle(session.choosenSeries.show.name, session.choosenSeason, 
                    session.choosenEpisode, session.chosenLanguage, bot, msg.chat.id);
                Common.removeSessions(sessions,session);
                return;
            }
            counterLanguage++;
        }, this);
        if(counterLanguage == Object.keys(Model.languages).length){
            bot.sendMessage(msg.chat.id, Common.languageNotFoundMessage);
            counterLanguage = 0; 
        }
    }
})