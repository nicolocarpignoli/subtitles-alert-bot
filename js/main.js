var TelegramBot = require('node-telegram-bot-api');
var Addic7ed = require('./libs/addic7ed.js');
var BotGui = require('./gui/keyboards.js');
var Common = require('./common.js');
var TvMaze = require('./libs/tvMaze.js');
var Session = require('./models/session.js');
var Mongo = require('./db/mongo.js');
var Core = require('./core.js');
var ScheduleManager = require('./schedule/scheduleManager.js')

var telegramBotToken = '398340624:AAH3rtCzaX9Y2fDU0ssRrK4vhRVh1PpZA0w';
var paymentTestToken = 'NjExZmQ4MTcxYjhi';

require('events').EventEmitter.prototype._maxListeners = 100;

var sessions = [];
var bot = new TelegramBot(telegramBotToken, { polling: true });
console.log("Starting bot...");
Mongo.connectToDatabase();

bot.onText(/\/start/, (msg, match) => {
    var session = Common.checkSessions(sessions, msg.chat);
    Common.resetValues(session);
    if (!session.choosingSeries) bot.sendMessage(msg.chat.id, Common.instructionsMessage,
        BotGui.generateKeyboardOptions());
});

bot.onText(/\/help/, (msg, match) => {
    bot.sendMessage(msg.chat.id, Common.helpMessage,
        BotGui.generateKeyboardOptions());
});

bot.onText(Common.GETregExp, (msg, match) => {
    var session = Common.checkSessions(sessions, msg.chat);
    Common.resetValues(session);
    bot.sendMessage(msg.chat.id, Common.whichSeriesMessage(msg.chat.first_name));
    session.choosingSeries = true;
    Common.pushInSessions(sessions, session);
})

bot.onText(Common.STARTregExp, (msg, match) => {
    var session = Common.checkSessions(sessions, msg.chat);
    Common.resetValues(session);
    bot.sendMessage(msg.chat.id, Common.whichSeriesAlertMessage(msg.chat.first_name));
    session.choosingSeriesAlert = true;
    Common.pushInSessions(sessions, session);
})

bot.onText(Common.STOPregExp, (msg, match) => {
    var session = Common.checkSessions(sessions, msg.chat);
    Common.resetValues(session);
    session.deletingAlert = true;
    var alerts = Mongo.getAlertsFromUser(msg.chat.id, bot);
})

bot.on('callback_query', (msg) => {
    var session = Common.checkSessions(sessions, msg.from);
    var userInput = msg.data;
    if (Common.notACommand(userInput) && session.choosingSeries && !Common.isEmpty(session.ambiguousSeries)) {
        var seriesObj = session.ambiguousSeries.find(function (elem) {
            return elem.show.name === userInput;
        });
        Common.handleChosenSeries(seriesObj, session, sessions);
        bot.sendMessage(msg.from.id, Common.whichAmbigousSeasonMessage(userInput));
    }
    if (Common.notACommand(userInput) && session.choosingSeriesAlert && !Common.isEmpty(session.ambiguousSeriesAlert)) {
        var seriesObj = session.ambiguousSeriesAlert.find(function (elem) { 
            return elem.show.name === userInput; 
        });
        Common.handleChosenSeriesAlert(seriesObj, session, sessions);
        if(seriesObj.show.status !== Common.runningState){
            bot.sendMessage(msg.from.id, Common.seriesNotRunningMessage(seriesObj.show.name));
        }else{
            bot.sendMessage(msg.from.id, Common.whichLanguagesAlertMessage(seriesObj.show.name),
                BotGui.generatesLanguageInlineKeyboard());
            Common.resetValues(session);
            session.choosingLanguageAlert = true;
            session.choosenSeriesAlert = seriesObj;
            Common.pushInSessions(sessions,session);
        }
    }
    if (Common.notACommand(userInput) && session.choosingLanguageAlert && userInput == Common.doneLanguageCallback){        
        if(session.chosenLanguagesAlert.length == 0){
            bot.sendMessage(msg.from.id, Common.chooseAtLeastALanguageMessage, BotGui.generatesLanguageInlineKeyboard());
        }else{
            session.choosingLanguageAlert = false;
            bot.sendMessage(msg.from.id, Common.subscribingToMessage);
            Mongo.subscribe(session, bot, msg.from);
        }
    }

});

bot.onText(/(.*?)/, (msg, match) => {
    var userInput = match.input;
    var session = Common.checkSessions(sessions, msg.chat);
    Core.handleGetLogic(userInput, session, sessions, msg, match, bot);
    Core.handleStartAlertLogic(userInput, session, sessions, msg, match, bot);
    if(session.deletingAlert && (userInput == Common.revertCallback || Common.confirmCallback)){
        Core.handleDeleteLogic(userInput, session, sessions, bot);
    }
})

exports.getBotInstance = function(){
    return bot;
}