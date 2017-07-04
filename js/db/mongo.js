var MongoClient = require('mongodb').MongoClient;

// fake, to test connection to mongo on rasp
exports.connectToDatabase = function(){
    var connectionString = 'mongodb://localhost:27017/subtitlesAlertBot';
    MongoClient.connect(connectionString, function(err, database) {
        console.log("Connected correctly to server.");
        database.close();
    });
}