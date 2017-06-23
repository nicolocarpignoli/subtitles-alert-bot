var http = require('http');
var rp = require('request-promise');

function buildSeasonsUrl(seriesId) {
    return "http://api.tvmaze.com/shows/" + seriesId + "/seasons";
}

function buildSeriesRequestOptions(seriesName) {
    const options = {
        uri: "http://api.tvmaze.com/search/shows",
        qs: { q: seriesName },
        headers: { 'User-Agent': 'Request-Promise' },
        json: true // Automatically parses the JSON string in the response
    }
    return options;
}

function ResultMatchesQuery(firstSeries, query) {
    var foundSeriesName = firstSeries.show.name;
    return query.trim().toLowerCase() === foundSeriesName.trim().toLowerCase();
}

exports.checkSeasonValidity = function (seriesId, seasonRequest) {
    const options = {
        uri: buildSeasonsUrl(seriesId),
        headers: { 'User-Agent': 'Request-Promise' },
        json: true // Automatically parses the JSON string in the response
    }

    return rp(options)
        .then(function (seasons) {
            return seasons ? 
            seasonRequest <= seasons.length && new Date(seasons[seasonRequest-1].premiereDate) <= new Date() : 
            false;
        })
        .catch(function (err) {
            console.log("Oh noes! :( Got an error fetching seasons... ", err);
        });
}

// returns an array with one element, six elements or empty array
exports.checkSeriesValidity = function (seriesName) {
    var resultMatchesQuery = false;

    let options = buildSeriesRequestOptions(seriesName);

    return rp(options)
        .then(function (foundSeries) {
            // console.log("FOUND SERIES: ", foundSeries);
            if (foundSeries && foundSeries.length == 0)
                return [];
            else {
                resultMatchesQuery = ResultMatchesQuery(foundSeries[0], seriesName);
                if (resultMatchesQuery)
                    return [foundSeries[0]];
                else {
                    var firstSix = foundSeries.slice(0, 6);
                    return firstSix;
                }
            }
        })
        .catch(function (err) {
            console.log("Oh noes! :( Got an error fetching series... ", err);
        });
}