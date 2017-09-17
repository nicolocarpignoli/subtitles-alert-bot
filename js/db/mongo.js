var Resources = require('../conf.js');
var Mongoose = require('mongoose');
var Tunnel = require('tunnel-ssh');
var Conf = require('../conf.js');
var TvMaze = require('../libs/tvMaze.js');
var Common = require('../common.js');
var ScheduleManager = require('../schedule/scheduleManager.js');
var Logger = require('../log/logger.js');
var BotGui = require('../gui/keyboards.js');
var Translate = require('../translations.js');

var db = undefined;
var Schema = Mongoose.Schema;
//Mongoose.set('debug', true);

var Alert = Mongoose.model('Alert', new Schema({
    ids: String,
    show_name: String,
    showId: Number,
    language: Schema.Types.Mixed,
    nextepisode_airdate: String,
    nextepisode_season: Number,
    nextepisode_episode: Number
}, {
        _id: false
    }));
var User = Mongoose.model('User', new Schema({
    ids: String,
    chatId: Number,
    first_name: String,
    alerts: Array,
    userLanguage: String
}));
var Language = Mongoose.model('Language', new Schema({
    code: String,
    int: String,
    native: String
}, {
        _id: false
    }));

exports.getMongoConnection = function () {
    return db;
}

exports.getSettings = function (translations) {
    User.find({}, function (err, users){
        if(users && users.length > 0)
            users.forEach(function(user) {
                if(user.userLanguage){
                    translations[user.userLanguage].push(user._doc._id);
                }
            });
    });
}


exports.connectToDatabase = function () {
    if (Conf.mongoHost == "") {
        var server = Tunnel(Conf.mongoConfig, function (error, server) {
            if (error) {
                console.log("SSH connection error: " + error);
            }
            Mongoose.connect('mongodb://localhost:' + Conf.mongoConfig.localPort + "/" + Conf.dbName,
            { server: { reconnectTries: Number.MAX_VALUE } });
            db = Mongoose.connection;
            db.on('error', () => {
                console.log('DB connection error ')
            });
            db.once('open', function () {
                console.log("DB connection successful");
                ScheduleManager.startAgenda();
            });
        });
    } else {
        Mongoose.connect('mongodb://localhost:' + Conf.mongoConfig.localPort + "/" + Conf.dbName,
            { server: { reconnectTries: Number.MAX_VALUE } });
        db = Mongoose.connection;
        db.on('error', () => {
            console.log('DB connection error ')
        });
        db.once('open', function () {
            console.log("DB connection successful");
            ScheduleManager.startAgenda();
        });
    }
}

exports.subscribe = function (session, bot, from) {
    Logger.logEvent("alert", [], session);
    var alertsToStore = [];
    var alertsIdList = [];
    if (session.choosenSeriesAlert.show._links.nextepisode) {
        var nextepisodePromise = TvMaze.getNextEpisodeInformation(session.choosenSeriesAlert.show._links.nextepisode.href);
        nextepisodePromise.then(function (nextepisode) {
            session.chosenLanguagesAlert.forEach(function (languageElement, index) {
                var alertToStore = new Alert({
                    show_name: session.choosenSeriesAlert.show.name,
                    showId: session.choosenSeriesAlert.show.id,
                    language: languageElement,
                    nextepisode_airdate: nextepisode.airdate,
                    nextepisode_season: nextepisode.season,
                    nextepisode_episode: nextepisode.number
                    //FOR DEBUG:
                    // nextepisode_airdate: "today",
                    // nextepisode_season: "1",
                    // nextepisode_episode: "1"
                });
                if (alertToStore._doc._id === undefined) {
                    delete alertToStore._doc._id;
                }
                Alert.findOneAndUpdate({ showId: alertToStore.showId, language: languageElement },
                    alertToStore, { new: true, upsert: true },
                    function (err, storedAlert) {
                        if (err) console.log("ERROR IN SAVE MONGO", err);
                        else {
                            ScheduleManager.activateStoredSchedules(storedAlert._doc, bot, false);
                            alertsIdList.push(storedAlert._doc._id.toString());

                            if (index == session.chosenLanguagesAlert.length - 1) {
                                subscribeUser(alertsIdList, session, bot, from);
                            }
                        }
                    }
                );
            });
        });
    } else {
        var previousEpisode = TvMaze.getNextEpisodeInformation(session.choosenSeriesAlert.show._links.previousepisode.href);
        previousEpisode.then(function(previousEpisode){
            if(previousEpisode){
                bot.sendMessage(from.id, Translate.seasonOverMessage[session.userLanguage](previousEpisode.season,session.choosenSeriesAlert.show.name));                        
            }else{
                bot.sendMessage(from.id, Translate.nextEpisodeNotAvailableMessage[session.userLanguage]);            
            }
            Common.resetValues(session);
        });
        
    }
}

function subscribeUser(alertsList, session, bot, from) {
    var alertsToAdd = [];
    User.findOne({ chatId: from.id }, function (err, user) {
        if (!user) {
            var newUser = new User({
                chatId: from.id,
                first_name: from.first_name,
                alerts: alertsList,
                userLanguage: ""
            });
            User.create(newUser, function (err, value) {
                if (err) console.log("error saving new user");
                bot.sendMessage(from.id, Translate.successSubscribeMessage[session.userLanguage](session.choosenSeriesAlert.show.name));
                Common.resetValues(session);
            });
        } else {
            var actualList = [];
            alertsList.forEach(function(element) {
                if(user._doc.alerts.indexOf(element) == -1) {
                    actualList.push(element);
                }
            });
            if(actualList.length < alertsList.length) bot.sendMessage(from.id, Translate.jobAlreadyExistMessage[session.userLanguage]);
            if(actualList.length > 0){
                user._doc.alerts.addToSet(actualList);
                bot.sendMessage(from.id, Translate.subscribingToMessage[session.userLanguage]);                
                user.save(function () {
                    bot.sendMessage(from.id, Translate.successSubscribeMessage[session.userLanguage](session.choosenSeriesAlert.show.name));
                    Common.resetValues(session);
                });
            }
        }
    });
}

exports.getAlertsFromUser = function (id, bot, session) {
    User.findOne({ chatId: id }, function (err, user) {
        if (!err && user && user._doc.alerts.length > 0) {
            let alertsId = user._doc.alerts.map(function (alert) { return new Mongoose.Types.ObjectId(alert); });
            Alert.find({ _id: { $in: alertsId } }, function (err, alerts) {
                if (!err && alerts && alerts.length > 0)
                    bot.sendMessage(id, Translate.showAlertsMessage[session.userLanguage], BotGui.generateAlertsInlineKeyboard(alerts));
            });
        }
        else {
            bot.sendMessage(id, Translate.noAlertMessage[session.userLanguage], BotGui.generateKeyboardOptions(session.userLanguage));
            Common.resetValues(session);
        }
    });
}


function deleteAlertIfNoUserSubscribed(alert) {
    const alertId = alert._id.toString();
    User.find({alerts: alertId}, function(err, users) {
        if(!err && users.length == 0){
            deleteAlert(alertId);
            ScheduleManager.cancelJob(alert.show_name + "_" + alert.language + "_interval");
        }
    });
}

exports.deleteAlertFromSingleUser = function (chatId, alert, userId, bot, session) {
    var tokens = alert.split("_");
    Alert.findOne({ show_name: tokens[0], language: tokens[1] }, function (err, foundAlert) {
        if (!err && foundAlert != null) {
            User.update({ chatId: chatId }, { $pullAll: { alerts: [foundAlert._doc._id.toString()] } }, function (err) {
                if (err) console.log("Error in updating alerts list of user. " + err);
                else {
                    console.log("Removed active alert: " + foundAlert._doc._id);
                    bot.sendMessage(chatId, Translate.deletedAlertMessage[session.userLanguage], BotGui.generateKeyboardOptions(session.userLanguage));
                }
                deleteAlertIfNoUserSubscribed(foundAlert._doc);
            });
        }
        else
            console.log("Can't find alert ", foundAlert);
    });
}

var deleteAlert = function (alertId) {
    Alert.findByIdAndRemove(Mongoose.Types.ObjectId(alertId), function (err, foundAlert) {
        if (err) {
            console.log("Cannot remove alert because of: ", err);
        }
    });
}

exports.deleteAlertFromAllUsers = function (alert) {
    const alertId = alert._id.toString()
    User.update({ alerts: alertId }, { $pullAll: { alerts: [alertId] } }, function (err) {
        if (err) {
            console.log("Cannot remove alert from users because of: ", err);
        }
        else
            deleteAlertIfNoUserSubscribed(alert);
    });
}

exports.setUserLanguage = function(session, bot, userInput){
    let index = Translate.translations[session.userLanguage].indexOf(session.chatId);
    Translate.translations[session.userLanguage].splice(index,1);
    Translate.translations[userInput].push(session.chatId);
    session.userLanguage = userInput;
    var userToStore;
    User.findOne({ chatId: session.chatId }, function (err, user) {
        if (!err && user ) {
            userToStore = user._doc;
            userToStore.userLanguage = userInput;
            User.findOneAndUpdate({ chatId: session.chatId}, userToStore, { new: true, upsert: true },function(err,storedUser){
                bot.sendMessage(session.chatId, Translate.chosenUserLanguage[userToStore.userLanguage](userToStore.userLanguage), BotGui.generateKeyboardOptions(userToStore.userLanguage));
            });
        }else{
            var newUser = new User({
                chatId: session.chatId,
                first_name: session.firstName,
                alerts: [],
                userLanguage: userInput
            });
            User.create(newUser, function (err, value) {
                if (err) console.log("error saving new user");
                bot.sendMessage(session.chatId, Translate.chosenUserLanguage[userInput](userInput), BotGui.generateKeyboardOptions(userInput));
            }); 
        }
    });
}


exports.Alert = Alert;
exports.User = User;
exports.Language = Language;
exports.deleteAlert = deleteAlert;