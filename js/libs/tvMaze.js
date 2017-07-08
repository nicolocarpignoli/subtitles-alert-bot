var http = require('http');
var rp = require('request-promise');

function buildSeriesRequestOptions(seriesName) {
    const options = {
        uri: "http://api.tvmaze.com/search/shows",
        qs: { q: seriesName },
        headers: { 'User-Agent': 'Request-Promise' },
        json: true // Automatically parses the JSON string in the response
    }
    return options;
}

function buildSeasonsRequestOptions(seriesId) {    
    const options = {
        uri: "http://api.tvmaze.com/shows/" + seriesId + "/seasons",
        headers: { 'User-Agent': 'Request-Promise' },
        json: true // Automatically parses the JSON string in the response
    }
    return options;
}

function buildEpisodeRequestOptions(seriesId, seasonNumber, episodeNumber) {
    const options = {
        uri: "http://api.tvmaze.com/shows/" + seriesId + "/episodebynumber",
        qs: {
            season: seasonNumber,
            number: episodeNumber
        },
        headers: { 'User-Agent': 'Request-Promise' },
        json: true // Automatically parses the JSON string in the response
    }
    return options;
}

function resultMatchesQuery(firstSeries, query) {
    var foundSeriesName = firstSeries.show.name;
    return query.trim().toLowerCase() === foundSeriesName.trim().toLowerCase();
}

// checks if tvMaze's results contains the required season 
function checkCorrectResults(list, token){
    let regExp = new RegExp('\\b' + token + '\\b', 'i');
    var filteredList = [];
    list.forEach(function(element) {
        if(regExp.test(element.show.name)) filteredList.push(element);
    }, this);
    //console.log(filteredList);
    return filteredList;
}


// returns an array with one element, six elements or empty array
exports.checkSeriesValidity = function (seriesName) {
    var resultsMatchesQuery = false;

    let options = buildSeriesRequestOptions(seriesName);

    return rp(options)
        .then(function (foundSeries) {
            // console.log("FOUND SERIES: ", foundSeries);
            if (foundSeries && foundSeries.length == 0)
                return [];
            else {
                resultsMatchesQuery = resultMatchesQuery(foundSeries[0], seriesName);
                if (resultsMatchesQuery)
                    return [foundSeries[0]];
                else {
                    var firstSix = foundSeries.slice(0, 6);
                    var valueArr = firstSix.map(function(item){ return item.show.name });
                    var isDuplicateIndex = valueArr.some(function(item, idx){ 
                        if(valueArr.indexOf(item) == idx) return valueArr.indexOf(item); 
                    });
                    valueArr[isDuplicateIndex].show.name += " (" + valueArr[isDuplicateIndex].show.premiered.slice(0,4) + ")";
                    firstSix = checkCorrectResults(firstSix, seriesName);
                    return firstSix;
                }
            }
        })
        .catch(function (err) {
            console.log("Oh noes! :( Got an error fetching series... ");
        });
}

// returns true if requested season is in seasons range and is already out
exports.checkSeasonValidity = function (seriesId, seasonRequest) {
    return rp(buildSeasonsRequestOptions(seriesId))
        .then(function (seasons) {
            return seasons ?
                seasonRequest <= seasons.length && new Date(seasons[seasonRequest - 1].premiereDate) <= new Date() :
                false;
        })
        .catch(function (err) {
            console.log("Oh noes! :( Got an error fetching seasons... ");
        });
}

exports.checkEpisodeValidity = function (seriesId, seasonNumber, episodeRequest) {
    return rp(buildEpisodeRequestOptions(seriesId, seasonNumber, episodeRequest))
        .then(function (episode) {
            return episode.status !== "404";
        })
        .catch(function (err) {
            console.log("Oh noes! :( Got an error fetching episode... ");
            return err.error;
        });
}
