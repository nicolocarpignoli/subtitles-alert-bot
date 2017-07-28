var Resources = require('../conf.js');
var Mongoose = require('mongoose');
var Tunnel = require('tunnel-ssh');
var Conf = require('../conf.js');
var TvMaze = require('../libs/tvMaze.js');
var Common = require('../common.js');
var ScheduleManager = require('../schedule/scheduleManager.js');
var Logger = require('../log/logger.js');
var BotGui = require('../gui/keyboards.js');


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
    alerts: Array
}));
var Language = Mongoose.model('Language', new Schema({
    code: String,
    int: String,
    native: String
}, {
        _id: false
    }));

exports.getMongoConnection = function(){
    return db;
}

exports.connectToDatabase = function () {
    if(Conf.mongoHost == ""){
        var server = Tunnel(Conf.mongoConfig, function (error, server) {
            if (error) {
                console.log("SSH connection error: " + error);
            }
            Mongoose.connect('mongodb://localhost:' + Conf.mongoConfig.localPort + "/" + Conf.dbName);
            db = Mongoose.connection;
            db.on('error', () => {
                console.log('DB connection error ')
            });
            db.once('open', function () {
                console.log("DB connection successful");
            });
        });
    }else{
        Mongoose.connect('mongodb://localhost:' + Conf.mongoConfig.localPort + "/" + Conf.dbName);
            db = Mongoose.connection;
            db.on('error', () => {
                console.log('DB connection error ')
            });
            db.once('open', function () {
                console.log("DB connection successful");
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
                if (alertToStore._id === undefined) {
                    delete alertToStore._id;
                }
                Alert.findOneAndUpdate({ showId: alertToStore.showId, language: languageElement },
                    alertToStore, { new: true, upsert: true },
                    function (err, storedAlert) {
                        if (err) console.log("ERROR IN SAVE MONGO", err);
                        else {
                            ScheduleManager.activateStoredSchedules(storedAlert._doc, bot);
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
        bot.sendMessage(from.id, nextEpisodeNotAvailableMessage);
        Common.resetValues(session);
    }
}

function subscribeUser(alertsList, session, bot, from) {
    var alertsToAdd = [];
    User.findOne({ chatId: from.id }, function (err, user) {
        if (!user) {
            var newUser = new User({
                chatId: from.id,
                first_name: from.first_name,
                alerts: alertsList
            });
            User.create(newUser, function (err, value) {
                if (err) console.log("error saving new user");
            });
        } else {
            user._doc.alerts.addToSet(alertsList);
            user.save(function () {
                bot.sendMessage(from.id, Common.successSubscribeMessage(session.choosenSeriesAlert.show.name));
                Common.resetValues(session);
            });

        }
    });
}

exports.getAlertsFromUser = function(id, bot){
    var alerts = [];
    User.findOne({ chatId: id }, function (err, user) {
        if (user) {
            user._doc.alerts.forEach(function(alertId, index) {
                Alert.findById(Mongoose.Types.ObjectId(alertId), function (err, foundAlert) { 
                    alerts.push(foundAlert);
                        if(index == user.alerts.length - 1){
                            if(alerts.length > 0) bot.sendMessage(id, Common.showAlertsMessage, BotGui.generateAlertsInlineKeyboard(alerts));
                    }
                });
                    
            });
        }
    });
}


exports.deleteAlert = function(alert){
    Alert.findByIdAndRemove(Mongoose.Types.ObjectId(alert._id), function(err, foundAlert){
        if(err){
            console.log("Cannot remove alert ", err);
        }
    });
}

exports.deleteAlertFromAllUsers = function(alert){
    this.deleteAlert(alert);
    //TODO to continue
}



exports.Alert = Alert;
exports.User = User;
exports.Language = Language;
