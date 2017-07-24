var fs = require('fs');
var Conf = require('../conf.js');


createLogLine = function(event,languages,session){
    var message =  {
        time: new Date().toString(),
        action: event,
        chatId : session.chatId,
        firstName : session.firstName
    };
    if(event == "get" && languages.length > 0){
        message.show = session.choosenSeries.show.name;
        message.season =  session.choosenSeason;
        message.episode =  session.choosenEpisode;
        message.lang = languages;
    }else{
        message.show =  session.choosenSeriesAlert.show.name;
        message.lang = [];
        session.chosenLanguagesAlert.forEach(function(element) {
            message.lang.push(element);
        });
    }
    return JSON.stringify(message);
}

exports.logEvent = function(event, languages, session){
    fs.exists(Conf.logFile, function (exists) {
        if (exists) {
            fs.appendFile(Conf.logFile, this.createLogLine(event,languages,session), function (err) {
                if (err) return console.log(err);
            });
        }
    });
}