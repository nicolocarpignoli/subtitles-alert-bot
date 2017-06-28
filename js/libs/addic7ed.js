var addic7edApi = require('addic7ed-api');
var fs = require('fs');

exports.addic7edGetSubtitle = function(series, season, episode, languages = [], bot, chat){
    addic7edApi.search(series, season, episode, languages).then(function (subtitlesList) {
        var subInfo = subtitlesList[0];
        if (subInfo) {
            var filename = './download/' + series + '_S' + season + '_E' + episode + '.srt';
            addic7edApi.download(subInfo, filename)
                .then(function () {
                    console.log('Subtitles file saved.');
                    fs.exists(filename, function(exists){
                        if(exists) {
                            bot.sendDocument(chat, filename).then(function(){
                                fs.unlinkSync(filename);
                            });
                        }
                    });
                    
            });
        }
    });

}