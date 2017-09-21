var TelegramBot = require('node-telegram-bot-api');
var Addic7ed = require('./libs/addic7ed.js');
var BotGui = require('./gui/keyboards.js');
var Common = require('./common.js');
var Translate = require('./translations.js');
var TvMaze = require('./libs/tvMaze.js');
var Session = require('./models/session.js');
var Mongo = require('./db/mongo.js');
var Core = require('./core.js');
var Mongoose = require('mongoose');
var ScheduleManager = require('./schedule/scheduleManager.js')

var telegramBotToken = '398340624:AAH3rtCzaX9Y2fDU0ssRrK4vhRVh1PpZA0w';
var paymentTestToken = 'NjExZmQ4MTcxYjhi';

require('events').EventEmitter.prototype._maxListeners = 10000;

var sessions = [];
var bot = new TelegramBot(telegramBotToken, { polling: true });
console.log("Starting bot...");
Mongo.connectToDatabase();
Mongo.getSettings(Translate.translations);

bot.onText(/\/start/, (msg, match) => {
    var session = Common.getUserSession(sessions, msg, Translate.translations);
    Common.resetValues(session);
    if (!session.choosingSeries) bot.sendMessage(msg.chat.id, Translate.instructionsMessage[session.userLanguage],
        BotGui.generateKeyboardOptions(session.userLanguage));
});

bot.onText(/\/help/, (msg, match) => {
    bot.sendMessage(msg.chat.id, Translate.helpMessage[session.userLanguage],
        BotGui.generateKeyboardOptions(session.userLanguage));
});

bot.onText(Translate.HELPRegExp, (msg, match) => {
    var session = Common.getUserSession(sessions, msg, Translate.translations);
    Common.resetValues(session);
    bot.sendMessage(msg.chat.id, Translate.helpMessage[session.userLanguage],
        BotGui.generateKeyboardOptions(session.userLanguage));
    Common.pushInSessions(sessions, session);
});

bot.onText(Translate.GETregExp, (msg, match) => {
    var session = Common.getUserSession(sessions, msg, Translate.translations);
    Common.resetValues(session);
    bot.sendMessage(msg.chat.id, Translate.whichSeriesMessage[session.userLanguage](msg.chat.first_name));
    session.choosingSeries = true;
    Common.pushInSessions(sessions, session);
})

bot.onText(Translate.STARTregExp, (msg, match) => {
    var session = Common.getUserSession(sessions, msg, Translate.translations);
    Common.resetValues(session);
    bot.sendMessage(msg.chat.id, Translate.whichSeriesAlertMessage[session.userLanguage](msg.chat.first_name));
    session.choosingSeriesAlert = true;
    Common.pushInSessions(sessions, session);
})

bot.onText(Translate.DONATERegExp, (msg, match) => {
    var session = Common.getUserSession(sessions, msg, Translate.translations);
    Common.resetValues(session);
    bot.sendMessage(msg.chat.id, Translate.donateMessage[session.userLanguage], BotGui.generateKeyboardOptions(session.userLanguage));
    Common.pushInSessions(sessions, session);
})

bot.onText(Translate.SHOWregExp, (msg, match) => {
    var session = Common.getUserSession(sessions, msg, Translate.translations);
    Common.resetValues(session);
    Common.pushInSessions(sessions, session);
    var alerts = Mongo.getAlertsFromUser(msg.chat.id, bot, session);
})

bot.onText(Translate.STOPregExp, (msg, match) => {
    var session = Common.getUserSession(sessions, msg, Translate.translations);
    Common.resetValues(session);
    session.deletingAlert = true;
    Common.pushInSessions(sessions, session);
    var alerts = Mongo.getAlertsFromUser(msg.chat.id, bot, session);
})

bot.onText(Translate.LANGUAGERegExp, (msg, match) => {
    var session = Common.getUserSession(sessions, msg, Translate.translations);
    Common.resetValues(session);
    session.choosingUserLanguage = true;
    Common.pushInSessions(sessions, session);
    bot.sendMessage(msg.from.id, Translate.whichUserLanguageMessage[session.userLanguage],
        BotGui.generateLanguagesInlineKeyboard());
})

bot.on('callback_query', (msg) => {
    var session = Common.getUserSession(sessions, msg, Translate.translations);
    var userInput = msg.data;
    bot.answerCallbackQuery(msg.id,[]);
    if (Common.notACommand(userInput) && session.choosingSeries && !Common.isEmpty(session.ambiguousSeries)) {
        var seriesObj = session.ambiguousSeries.find(function (elem) {
            return elem.show.name === userInput;
        });
        Common.handleChosenSeries(seriesObj, session, sessions);
        bot.sendMessage(msg.from.id, Translate.whichAmbigousSeasonMessage[session.userLanguage](userInput));
    }
    if (Common.notACommand(userInput) && session.choosingSeriesAlert && !Common.isEmpty(session.ambiguousSeriesAlert)) {
        var seriesObj = session.ambiguousSeriesAlert.find(function (elem) {
            return elem.show.name === userInput;
        });
        Common.handleChosenSeriesAlert(seriesObj, session, sessions);
        if (seriesObj.show.status !== Common.runningState) {
            bot.sendMessage(msg.from.id, Translate.seriesNotRunningMessage[session.userLanguage](seriesObj.show.name));
        } else {
            bot.sendMessage(msg.from.id, Translate.whichLanguagesAlertMessage[session.userLanguage](seriesObj.show.name));
            Common.resetValues(session);
            session.choosingLanguageAlert = true;
            session.choosenSeriesAlert = seriesObj;
            Common.pushInSessions(sessions, session);
        }
    }

    if(Common.notACommand(userInput) && session.choosingUserLanguage){
        Common.resetValues(session);
        session.choosingUserLanguage = false;        
        Common.pushInSessions(sessions, session);
        Mongo.setUserLanguage(session, bot, userInput);
    }
    if(Common.notACommand(userInput) && session.isDonating){
        Common.resetValues(session);
        session.isDonating = false;        
        Common.pushInSessions(sessions, session);
        Core.handleDonateLogic(userInput, session, sessions, msg, match, bot);
    }
   
    if (Common.notACommand(userInput) && session.deletingAlert && userInput.indexOf("_") > -1) {
        // if exist remove jobs named "showname_language_interval/giventime"
        var seriesName = userInput.length > 1 ? userInput.substring(0, userInput.indexOf('_')) : null;
        session.alertToDelete = userInput;
        Common.pushInSessions(sessions, session);
        if (seriesName != null) {
            session.deletingAlert = false;
            session.confirmDelete = true;
            bot.sendMessage(msg.from.id, Translate.areYouSureRemoveAlert[session.userLanguage](seriesName), BotGui.generatesConfirmInlineKeyboard(session));
        }
    }
    if (Common.notACommand(userInput) && session.confirmDelete && (userInput == Translate.revertCallback[session.userLanguage] || userInput == Translate.confirmCallback[session.userLanguage])) {
        Core.handleDeleteLogic(msg, userInput, session, sessions, bot);
    }
});

bot.onText(/(.*?)/, (msg, match) => {
    var userInput = match.input;
    var session = Common.getUserSession(sessions, msg, Translate.translations);
    Core.handleGetLogic(userInput, session, sessions, msg, match, bot);
    Core.handleStartAlertLogic(userInput, session, sessions, msg, match, bot);
    Core.handleLanguageConfirmation(userInput, session, msg, bot);
});

exports.getBotInstance = function () {
    return bot;
}