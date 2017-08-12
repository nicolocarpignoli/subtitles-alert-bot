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
    //Logger.logEvent("alert", [], session);
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
                bot.sendMessage(from.id, Common.successSubscribeMessage(session.choosenSeriesAlert.show.name));
                Common.resetValues(session);
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

exports.getAlertsFromUser = function(id, bot, session){
    var alerts = [];
    var counter = 0;
    User.findOne({ chatId: id }, function (err, user) {
        if (user) {
            if(user._doc.alerts.length > 0){
                user._doc.alerts.forEach(function(alertId) {
                    Alert.findById(Mongoose.Types.ObjectId(alertId), function (err, foundAlert) { 
                        alerts.push(foundAlert);
                            if(counter == user.alerts.length - 1){
                                counter = 0;
                                if(alerts.length > 0 && alerts.length == user.alerts.length) 
                                    bot.sendMessage(id, Common.showAlertsMessage, BotGui.generateAlertsInlineKeyboard(alerts));
                            }else{
                                counter++;
                            }
                    });
                });
            }else{
               bot.sendMessage(id, Common.noAlertMessage, BotGui.generateKeyboardOptions());
               Common.resetValues(session); 
            }
        }
    });
}

exports.deleteAlertFromSingleUser = function(chatId,alert, userId, bot){
    var tokens = alert.split("_");
    Alert.findOne({show_name : tokens[0], language: tokens[1]}, function(err, foundAlert){
        if(!err && foundAlert != null){
            this.deleteAlertFromUser(chatId,userId, foundAlert, bot);
        }
    });
}

deleteAlertFromUser = function(chatId, userId, alert, bot){
    User.findOne({ chatId: userId }, function (err, user) {
        if(!err){   
            var index = user._doc.alerts.indexOf(alert._doc._id);
            var newAlertList = user._doc.alerts.filter(function(value, arrIndex){
                return index !== arrIndex;
            });
            var userToStore = new User({
                chatId : userId,
                first_name: user._doc.first_name,
                alerts: newAlertList
            });
            delete userToStore._doc._id;
            User.findOneAndUpdate({chatId : userId}, userToStore, { new: true, upsert: true }, function(err, doc){
                if(err){
                    console.log("Error in updating alerts list of user " + err);
                }else{
                    console.log("Removed active alert: " + alert._id);
                    bot.sendMessage(chatId, Common.deletedAlertMessage, BotGui.generateKeyboardOptions()); 
                }
            }) 
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
    User.find({}, function(error, users){
        if(!error){
            users.forEach(function(user) {
                var index = user.doc.alerts.indexOf(alert._id);
                if(index > -1){
                    var newAlertList = user._doc.alerts.filter(function(value, arrIndex){
                        return index !== arrIndex;
                    });
                    var userToStore = new User({
                        chatId : user._doc.chatId,
                        first_name: user._doc.first_name,
                        alerts: newAlertList
                    });
                    delete userToStore._doc._id;
                    User.findOneAndUpdate({chatId : user._doc.chatId},userToStore, { new: true, upsert: true }, function(err, doc){
                        if(err) console.log("Error in updating alerts list of user");
                    })
                }
            });
        }
    });
}



exports.Alert = Alert;
exports.User = User;
exports.Language = Language;
