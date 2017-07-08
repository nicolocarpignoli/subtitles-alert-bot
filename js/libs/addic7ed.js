var addic7edApi = require('addic7ed-api');
var fs = require('fs');
var Common = require('../common.js');


exports.addic7edGetSubtitle = function(session, languages = [], bot, chat, sessionsList){
	addic7edApi.search(session.choosenSeries.show.name, session.choosenSeason, 
        session.choosenEpisode, languages).then(function (subtitlesList) {
        var subInfo = subtitlesList[0];
        if (subInfo != undefined) {
            var filename =  session.choosenSeries.show.name + '_S' + session.choosenSeason + '_E' + session.choosenEpisode + '.srt';
            addic7edApi.download(subInfo, filename)
                .then(function () {
                    fs.exists(filename, function(exists){
                        if(exists) {
                            console.log('Subtitles file saved.');
                            Common.removeSession(sessionsList, session); 
                            bot.sendMessage(chat, Common.buildLinkMessage(subInfo.link));
                            bot.sendDocument(chat, filename).then(function(){
                                fs.unlinkSync(filename);
                            });
                            if(session.choosenSeries.show.name.indexOf("(") > -1 && session.choosenSeries.show.name.indexOf(")") > -1){
                                bot.sendMessage(chat, Common.ambigousSubtitleMessage);
                            }
                        }
                    });
            });
        }else{
            bot.sendMessage(chat, Common.subtitleNofFoundInAddic7edMessage);
        }
    });
}
