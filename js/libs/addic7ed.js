var addic7edApi = require('addic7ed-api');

exports.addic7edGetSubtitle = function(series, season, episode, languages = [], bot, chat){
    addic7edApi.search(series, season, episode, languages).then(function (subtitlesList) {
        var subInfo = subtitlesList[0];
        if (subInfo) {
            var filename = './download/' + series + '_S' + season + '_E' + episode + '.srt';
            addic7edApi.download(subInfo, filename)
                .then(function () {
                    console.log('Subtitles file saved.');
                    bot.sendDocument(chat, filename);
            });
        }
    });

}