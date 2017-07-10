var MongoClient = require('mongodb').MongoClient;

// fake, to test connection to mongo on rasp
exports.connectToDatabase = function(){
    // var connectionString = 'mongodb://localhost:27017/subtitlesAlertBot';
    // MongoClient.connect(connectionString, function(err, database) {
    //     console.log("Connected correctly to server.");
    //     database.close();
    // });
}

exports.subscribe = function(session, bot, chatId){
    console.log("TODO subscribe");
    bot.sendMessage(chatId, "Hey have patience I can't do this ...at least for now \uD83E\uDD14 \uD83E\uDD14");
}