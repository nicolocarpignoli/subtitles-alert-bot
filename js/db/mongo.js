var Resources = require('../conf.js');
var Mongoose = require('mongoose');
var Tunnel = require('tunnel-ssh');
var Conf = require('../conf.js');
var TvMaze = require('../libs/tvMaze.js');
var Common = require('../common.js');
var ScheduleManager = require('../schedule/scheduleManager.js');

var db = undefined;
var Schema = Mongoose.Schema;

var Alert = Mongoose.model('Alert', new Schema({
    id: String,
    show_name: String,
    show_id: Number,
    language: Schema.Types.Mixed,
    nextepisode_airdate: String,
    nextepisode_season: Number,
    nextepisode_episode: Number
}));
var User = Mongoose.model('User', new Schema({
    id: String,
    chat_id: Number,
    first_name: String,
    alerts: Array
}));
var Language = Mongoose.model('Language', new Schema({
    code: String,
    int: String,
    native: String
}));

exports.Alert = Alert;
exports.User = User;
exports.Language = Language;


exports.connectToDatabase = function () {
    var server = Tunnel(Conf.mongoConfig, function (error, server) {
        if (error) {
            console.log("SSH connection error: " + error);
        }
        Mongoose.connect('mongodb://127.0.0.1:' + Conf.mongoConfig.localPort + '/' + Conf.dbName);
        db = Mongoose.connection;
        db.on('error', () => { console.log('DB connection error:') });
        db.once('open', function () {
            console.log("DB connection successful");
        });
    });
}


exports.subscribe = function (session, bot, from) {
    bot.sendMessage(from.id, "Hey have patience I can't do this ...at least for now \uD83E\uDD14 \uD83E\uDD14");
    var alertsToStore = [];
    var alertsIdList = [];
    if (session.choosenSeriesAlert.show._links.nextepisode) {
        var nextepisodePromise = TvMaze.getNextEpisodeInformation(session.choosenSeriesAlert.show._links.nextepisode.href);

        nextepisodePromise.then(function (nextepisode) {
            session.chosenLanguagesAlert.forEach(function (languageElement) {
                var alertToStore = new Alert({
                    show_name: session.choosenSeriesAlert.show.name,
                    show_id: session.choosenSeriesAlert.show.id,
                    language: languageElement,
                    nextepisode_airdate: nextepisode.airdate,
                    nextepisode_season: nextepisode.season,
                    nextepisode_episode: nextepisode.number
                });

                //TODO controllo che non si inserisca due volte lo stesso alert, ora lo fa e non lo deve fare

                alertToStore.save(function (err, storedAlert) {
                    if (err) console.log("ERROR IN SAVE MONGO", err);

                    console.log('storedAlert:\t', storedAlert)
                    alertsIdList.push(storedAlert._id);
                    ScheduleManager.activateStoredSchedules(storedAlert);
                });
            });
            subscribeUser(alertsIdList, session, bot, from);
            Common.resetValues(session);
        });
    }
    else {
        bot.sendMessage(from.id, nextEpisodeNotAvailableMessage);
        Common.resetValues(session);
    }
}

function subscribeUser(alertsIdList, session, bot, from) {
    console.log('alertsIdList ', alertsIdList);
    User.find({ 'chat_id': from.id }, function (err, user) {
        if (user) {
            var alertsToAdd = user.alerts;
            alertsIdList.forEach(function (alertId) {
                if (user.alerts.indexOf(alertId) == -1) alertsToAdd.push(alertId);
            });
            User.update({ _id: user.id }, { $set: { alerts: alertsToAdd } }, function (err, user) {
                if (err) console.log("ERROR UPDATING USER IN MONGO");
            });
        } else {
            var userToStore = new User({
                chat_id: from.id,
                first_name: from.first_name,
                alerts: alertsIdList
            });
            userToStore.save(function (err, storedUser) {
                if (err) return console.log("ERROR SAVING USER IN MONGO", err);
            });
        }
    });
}