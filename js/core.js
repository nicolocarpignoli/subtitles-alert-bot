var TelegramBot = require('node-telegram-bot-api');
var Addic7ed = require('./libs/addic7ed.js');
var BotGui = require('./gui/keyboards.js');
var Common = require('./common.js');
var TvMaze = require('./libs/tvMaze.js');
var Model = require('./models/languages.js');
var telegramBotToken = '398340624:AAH3rtCzaX9Y2fDU0ssRrK4vhRVh1PpZA0w';
var Session = require('./models/session.js');
var Mongo = require('./db/mongo.js');
var Core = require('./core.js');

exports.handleGetLogic = function(userInput, session, sessions, msg, match, bot){
    if (Common.notACommand(userInput) && session.choosingSeries) {
        let promise = TvMaze.checkSeriesValidity(userInput);
        promise.then(function (response) {
            switch (response.length) {
                case 0:
                    bot.sendMessage(msg.chat.id, Common.failedSeriesMessage);
                    Common.pushInSessions(sessions, session);
                    break;
                case 1:
                    bot.sendMessage(msg.chat.id, Common.whichSeasonMessage);
                    Common.handleChosenSeries(response[0], session, sessions);
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
        if (!Common.isValidNumber(userInput)) {
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
                    Common.resetValues(session);
                    session.choosingEpisode = true;
                    Common.pushInSessions(sessions, session);
                    bot.sendMessage(msg.chat.id, Common.whichEpisodeMessage);
                }
            });
        }
    }
    else if (Common.notACommand(userInput) && session.choosingEpisode) {
        if (!Common.isValidNumber(userInput)) {
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
                    Common.resetValues(session);
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
            bot.sendMessage(msg.chat.id, Common.LoadingSubtitleMessage);
            Addic7ed.addic7edGetSubtitle(session, session.chosenLanguage, bot, msg.chat.id, sessions);         
        }
        else
            bot.sendMessage(msg.chat.id, Common.languageNotFoundMessage);
    }
}

exports.handleStartAlertLogic = function(userInput, session, sessions, msg, match, bot){
   if (Common.notACommand(userInput) && session.choosingSeriesAlert) {
        let promise = TvMaze.checkSeriesValidity(userInput);
        promise.then(function (response) {
            switch (response.length) {
                case 0:
                    bot.sendMessage(msg.chat.id, Common.failedSeriesMessage);
                    Common.pushInSessions(sessions, session);
                    break;
                case 1:
                    if(response[0].show.status !== Common.runningState){
                        bot.sendMessage(msg.chat.id, Common.seriesNotRunningMessage(response[0].show.name));
                    }else{
                        bot.sendMessage(msg.chat.id, Common.whichLanguagesAlertMessage(response[0].show.name),
                            BotGui.generatesLanguageInlineKeyboard());
                        Common.resetValues(session);
                        session.choosingLanguageAlert = true;
                        session.choosenSeriesAlert = response[0];
                        Common.pushInSessions(sessions,session);
                    }
                    break;
                default:
                    session.ambiguousSeriesAlert = response;
                    bot.sendMessage(msg.chat.id, Common.ambiguousSeriesMessage,
                        BotGui.generateSeriesInlineKeyboard(response));
                    break;
            }
        });
    }
    if (Common.notACommand(userInput) && session.choosingLanguageAlert){
       var languageKey = Object.keys(Model.languages).find(function (key) {
            return key.length == 3 && (key.toUpperCase() === userInput.toUpperCase() ||
                Model.languages[key]["native"][0].toUpperCase() === userInput.toUpperCase() ||
                Model.languages[key]["int"][0].toUpperCase() === userInput.toUpperCase())
        })

        if (languageKey) {
            if(!Common.languageAlreadyPresent(session.chosenLanguagesAlert, languageKey)){
                session.chosenLanguagesAlert.push(languageKey);
                bot.sendMessage(msg.chat.id, Common.addLanguageMessage, BotGui.generatesLanguageInlineKeyboard());
            }else{
                bot.sendMessage(msg.chat.id, Common.languageAlreadyPresentMessage, BotGui.generatesLanguageInlineKeyboard()); 
            }
        }
        else
            bot.sendMessage(msg.chat.id, Common.languageNotFoundMessage, BotGui.generatesLanguageInlineKeyboard()); 
    } 
}