var MongoClient = require('mongodb').MongoClient;
var Resources = require('../conf.js');

// fake, to test connection to mongo on rasp
exports.connectToDatabase = function(){
    // MongoClient.connect(Resources.mongoDbConnectionString, function(err, database) {
    //     console.log("Connected correctly to server.");
    //     database.close();
    // });
}

exports.subscribe = function(session, bot, chatId){
    console.log("TODO subscribe");
    bot.sendMessage(chatId, "Hey have patience I can't do this ...at least for now \uD83E\uDD14 \uD83E\uDD14");
}