var MongoClient = require('mongodb').MongoClient;
var Resources = require('../conf.js');
var Alert = require('../models/alert.js');
var Language = require('../models/alert.js');
var User = require('../models/user.js');



exports.connectToDatabase = function(){
    console.log("TRYING TO CONNECT TO ", Resources.mongoDbConnectionString);
    // MongoClient.connect(Resources.mongoDbConnectionString, function(err, database) {
    //     console.log(err);
    //     console.log("Connected correctly to server.");
    //     database.close();
    // });
}

exports.subscribe = function(session, bot, from){
    console.log("TODO subscribe");
    bot.sendMessage(from.id, "Hey have patience I can't do this ...at least for now \uD83E\uDD14 \uD83E\uDD14");
    var alertsToStore = [];
    console.log(session.choosenSeriesAlert.show._links.nextexpisode.href);
    session.chosenLanguagesAlert.forEach(function(language) {
        alertsToStore.push(new Alert({
            show_name : session.choosenSeriesAlert.show.name,
            show_id : session.choosenSeriesAlert.show.id,
            language : new Language(),
            // chiamare api @ session.choosenSeriesAlert.show._links.nextexpisode.href per compilare i 3 campi sotto:
            nextepisode_airdate : undefined,
            nextepisode_season : undefined,
            nextepisode_episode : undefined
        }))
    });
    //TODO foreach alertsToStore salva su mongodb e recupero l'id degli alert appena salvati
    var idAlertList = [];
    //if esiste già l'utente, lo recupero attraverso l'id e aggiungo gli id degli alert, altrimenti:
    var userToStore = new User({
        chat_id : from.id,
        first_name : from.first_name,
        alerts : idAlertList 
    });

    // e lo salvo su db

}