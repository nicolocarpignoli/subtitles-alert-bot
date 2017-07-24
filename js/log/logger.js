var fs = require('fs');
var Conf = require('../conf.js');


createLogLine = function(event,session){
    var message =  Date.now() + ": action: " + event + ", from: " + session.chatId + ", " + session.firstName + ", of: ";
    if(event == "get"){
        message = message + session.choosenSeries.show.name + " S" + session.choosenSeason + " E" + session.choosenEpisode + " lang: " +  choosingLanguage;
    }else{
        message = message + session.choosingSeriesAlert.show.name + " lang: ";
        session.chosenLanguagesAlert.forEach(function(element) {
            message += element + " ";
        });
    }
    message = message + "\n";
    return message;
}

exports.logEvent = function(event, session){
    fs.exists(Conf.logFile, function (exists) {
        if (exists) {
            fs.writeFile(Conf.logFile, this.createLogLine(event,session), function (err) {
                if (err) return console.log(err);
            });
        }
    });
}