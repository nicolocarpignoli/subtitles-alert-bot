var addic7edApi = require('addic7ed-api');

exports.addic7edSearch = function(series, season, episode, languages = []){
    addic7edApi.search(series, season, episode, languages).then(function (subtitlesList) {
        var subInfo = subtitlesList[0];
        if (subInfo) {
            addic7edApi.download(subInfo, 
                './' + series + '_S' + season + '_E' + episode + '.srt'
                ).then(function () {
                    console.log('Subtitles file saved.');
            });
        }
    });

}