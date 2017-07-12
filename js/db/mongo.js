var MongoClient = require('mongodb').MongoClient;
var Resources = require('../conf.js');

exports.connectToDatabase = function(){
    // console.log("TRYING TO CONNECT TO ", Resources.mongoDbConnectionString);
    // MongoClient.connect(Resources.mongoDbConnectionString, function(err, database) {
    //     console.log(err);
    //     console.log("Connected correctly to server.");
    //     database.close();
    // });
}

exports.subscribe = function(session, bot, chatId){
    console.log("TODO subscribe");
    bot.sendMessage(chatId, "Hey have patience I can't do this ...at least for now \uD83E\uDD14 \uD83E\uDD14");
}