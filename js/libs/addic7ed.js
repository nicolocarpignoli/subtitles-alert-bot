var addic7edApi = require('addic7ed-api');
var fs = require('fs');
var Common = require('../common.js');


exports.addic7edGetSubtitle = function(series, season, episode, languages = [], bot, chat){
    addic7edApi.search(series, season, episode, languages).then(function (subtitlesList) {
        var subInfo = subtitlesList[0];
        if (subInfo != undefined) {
            var filename = './download/' + series + '_S' + season + '_E' + episode + '.srt';
            addic7edApi.download(subInfo, filename)
                .then(function () {
                    console.log('Subtitles file saved.');
                    fs.exists(filename, function(exists){
                        if(exists) {
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

}