var Resources = require('../conf.js');
var Alert = require('../models/alert.js');
var Language = require('../models/alert.js');
var User = require('../models/user.js');
var Mongoose = require('mongoose');
var Tunnel = require('tunnel-ssh');
var Conf = require('../conf.js');
var TvMaze = require('./libs/tvMaze.js');
var Common = require('./common.js');

exports.connectToDatabase = function () {
    var server = Tunnel(Conf.mongoConfig, function (error, server) {
        if (error) {
            console.log("SSH connection error: " + error);
        }
        Mongoose.connect(Conf.mongoConfig.dstHost);
        var db = Mongoose.connection;
        db.on('error', console.error.bind(console, 'DB connection error:'));
        db.once('open', function () {
            console.log("DB connection successful");
        });
    });
    createModelsForMongoose();
}

exports.createModelsForMongoose = function () {
    var Schema = mongoose.Schema;
    var AlertModel = mongoose.model('Alert', new Schema({
        id: String,
        show_name: String,
        show_id: Number,
        language: Schema.Types.Mixed,
        nextepisode_airdate: String,
        nextepisode_season: Number,
        nextepisode_episode: Number
    }));
    var UserModel = mongoose.model('User', new Schema({
        id: String,
        chat_id: Number,
        first_name: String,
        alerts: Array
    }));
    var LanguageModel = mongoose.model('Language', new Schema({
        code: String,
        int: String,
        native: String
    }));
}

exports.subscribe = function (session, bot, from) {
    console.log("TODO subscribe");
    bot.sendMessage(from.id, "Hey have patience I can't do this ...at least for now \uD83E\uDD14 \uD83E\uDD14");
    var alertsToStore = [];
    if (session.choosenSeriesAlert.show._links.nextepisode) {
        var nextepisode = TvMaze.getNextEpisodeInformation(session.choosenSeriesAlert.show._links.nextepisode.href);
        session.chosenLanguagesAlert.forEach(function (languageElement) {
            alertsToStore.push(new Alert({
                show_name: session.choosenSeriesAlert.show.name,
                show_id: session.choosenSeriesAlert.show.id,
                language: languageElement,
                nextepisode_airdate: nextepisode.airdate,
                nextepisode_season: nextepisode.season,
                nextepisode_episode: nextepisode.number
            }))
        });

        //TODO foreach alertsToStore salva su mongodb e recupero l'id degli alert appena salvati
        var idAlertList = [];
        //if esiste già l'utente, lo recupero attraverso l'id e aggiungo gli id degli alert, altrimenti:
        var userToStore = new User({
            chat_id: from.id,
            first_name: from.first_name,
            alerts: idAlertList
        });
        // e lo salvo su db
    }
    else
        bot.sendMessage(from.id, nextEpisodeNotAvailableMessage);

    Common.resetValues(session);
}