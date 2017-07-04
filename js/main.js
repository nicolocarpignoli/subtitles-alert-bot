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

function handleChosenSeries(chosenSeries, session) {
    session.choosenSeries = chosenSeries;
    resetValues(session);
    session.choosingSeason = true;
    Common.pushInSessions(sessions, session);
}

bot.onText(/\/start/, (msg, match) => {
    var session = Common.checkSessions(sessions, msg.chat.id);
    if (!session.choosingSeries) bot.sendMessage(msg.chat.id, Common.instructionsMessage,
        BotGui.generateKeyboardOptions());
});

bot.onText(Common.GETregExp, (msg, match) => {
    var session = Common.checkSessions(sessions, msg.chat.id);
    bot.sendMessage(msg.chat.id, Common.whichSeriesMessage);
    resetValues(session);
    session.choosingSeries = true;
    Common.pushInSessions(sessions, session);
})

bot.on('callback_query', (msg) => {
    var session = Common.checkSessions(sessions, msg.from.id);
    var userInput = msg.data;
    if (Common.notACommand(userInput) && session.choosingSeries && !Common.isEmpty(session.ambiguousSeries)) {
        var seriesObj = session.ambiguousSeries.find(function (elem) { return elem.show.name === userInput; });

        handleChosenSeries(seriesObj, session);
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
                    Common.pushInSessions(sessions, session);
                    break;
                case 1:
                    bot.sendMessage(msg.chat.id, Common.whichSeasonMessage);
                    handleChosenSeries(response[0], session);
                    break;
                default:
                    session.ambiguousSeries = response;
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
                    Common.pushInSessions(sessions, session);
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
            let promise = TvMaze.checkEpisodeValidity(session.choosenSeries.show.id, session.choosenSeason, userInput);
            promise.then(function (response) {
                if (response !== true)
                    bot.sendMessage(msg.chat.id, Common.episodeNotFoundMessage);
                else {
                    session.choosenEpisode = userInput;
                    resetValues(session);
                    session.choosingLanguage = true;
                    Common.pushInSessions(sessions, session);
                    bot.sendMessage(msg.chat.id, Common.whichLanguageMessage);
                }
            });
        }
    }
    else if (Common.notACommand(userInput) && session.choosingLanguage) {
        // accepted "native" version, "int" version and 3 chars version (e.g. "italiano", "italian" or "ita")
        var languageKey = Object.keys(Model.languages).find(function (key) {
            return key.length == 3 && (key.toUpperCase() === userInput.toUpperCase() ||
                Model.languages[key]["native"][0].toUpperCase() === userInput.toUpperCase() ||
                Model.languages[key]["int"][0].toUpperCase() === userInput.toUpperCase())
        })

        if (languageKey) {
            session.chosenLanguage = languageKey;
            let response = Addic7ed.addic7edGetSubtitle(session.choosenSeries.show.name, session.choosenSeason,
                session.choosenEpisode, session.chosenLanguage, bot, msg.chat.id);
            if(response){
                resetValues(session);
                Common.removeSessions(sessions, session); 
            }
            
        }
        else
            bot.sendMessage(msg.chat.id, Common.languageNotFoundMessage);
    }
})