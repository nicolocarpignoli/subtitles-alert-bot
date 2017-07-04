var addic7edApi = require('addic7ed-api');
var fs = require('fs');
var Common = require('../common.js');


exports.addic7edGetSubtitle = function(series, season, episode, languages = [], bot, chat){
    var response = false;
    addic7edApi.search(series, season, episode, languages).then(function (subtitlesList) {
        var subInfo = subtitlesList[0];
        if (subInfo != undefined) {
            var filename = './download/' + series + '_S' + season + '_E' + episode + '.srt';
            addic7edApi.download(subInfo, filename)
                .then(function () {
                    fs.exists(filename, function(exists){
                        if(exists) {
                            console.log('Subtitles file saved.');
                            response = true;
                            bot.sendMessage(chat, Common.buildLinkMessage(subInfo.link));
                            bot.sendDocument(chat, filename).then(function(){
                                fs.unlinkSync(filename);
                            });
                        }
                    });
            });
        }else{
            bot.sendMessage(chat, Common.subtitleNofFoundInAddic7edMessage);
        }
    });
    return response;
}