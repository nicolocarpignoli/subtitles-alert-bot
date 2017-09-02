var http = require('http');
var rp = require('request-promise');
var Promise = require('promise')
function buildSeriesRequestOptions(seriesName) {
    const options = {
        uri: "http://api.tvmaze.com/search/shows",
        qs: { q: seriesName },
        headers: { 'User-Agent': 'Request-Promise' },
        json: true
    }
    return options;
}

function buildShowRequestOptionsById(showId) {
    const options = {
        uri: "http://api.tvmaze.com/shows/" + showId,
        headers: { 'User-Agent': 'Request-Promise' },
        json: true
    }
    return options;
}

function buildSeasonsRequestOptions(seriesId) {
    const options = {
        uri: "http://api.tvmaze.com/shows/" + seriesId + "/seasons",
        headers: { 'User-Agent': 'Request-Promise' },
        json: true
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
        json: true
    }
    return options;
}

function buildGenericOptions(link) {
    const options = {
        uri: link,
        headers: { 'User-Agent': 'Request-Promise' },
        json: true
    }
    return options;
}


function checkPerfectMatch(foundSeries, name) {
    var foundSeriesName = foundSeries.show.name;
    return name.trim().toLowerCase() === foundSeriesName.trim().toLowerCase();
}

function checkOnePerfectMatch(foundSeries, name) {
    var list = [];
    foundSeries.map(function(element){
        if(name.trim().toLowerCase() === element.show.name.trim().toLowerCase()) list.push(element);
    });
    return list;
}

// checks if tvMaze's results contains the required season 
function checkCorrectResults(list, token) {
    let regExp = new RegExp('\\b' + token + '\\b', 'i');
    var filteredList = [];
    list.forEach(function (element) {
        if (regExp.test(element.show.name)) filteredList.push(element);
    }, this);
    //console.log(filteredList);
    return filteredList;
}

function checkDuplicates(list) {
    var foundSeries = list;
    var list = list.map(function (item) { return item.show.name });
    var duplicates = {};
    var hasDuplicates;
    for (var i = 0; i < list.length; i++) {
        if (duplicates.hasOwnProperty(list[i])) {
            duplicates[list[i]].push(i);
            hasDuplicates = true;
        } else if (list.lastIndexOf(list[i]) !== i) {
            duplicates[list[i]] = [i];
        }
    }
    Object.keys(duplicates).forEach(function (element) {
        for (var i = 0; i < duplicates[element].length; i++) {
            var index = duplicates[element][i];
            if (foundSeries[index].show.premiered != null) {
                foundSeries[index].show.name += " (" + foundSeries[index].show.premiered.slice(0, 4) + ")";
            }
        }
    });
    return {
        "foundSeries": foundSeries,
        "hasDuplicates": hasDuplicates
    }
}


// returns an array with one element, six elements or empty array
exports.checkSeriesValidity = function (seriesName) {
    var resultsMatchesQuery = false;

    let options = buildSeriesRequestOptions(seriesName);

    return rp(options)
        .then(function (foundSeries) {
            if (foundSeries && foundSeries.length == 0)
                return [];
            else if (checkPerfectMatch(foundSeries[0], seriesName)) {
                var uniquePerfectMatch = checkOnePerfectMatch(foundSeries, seriesName);
                if(uniquePerfectMatch.length == 1) return uniquePerfectMatch;
                var result = checkDuplicates(foundSeries);
                if (!result["hasDuplicates"]) return [foundSeries[0]];
                else return result["foundSeries"];
            }
            else {
                foundSeries = checkDuplicates(foundSeries);
                if (!foundSeries["hasDuplicates"]) return foundSeries = foundSeries["foundSeries"].slice(0, 6);
                return foundSeries["foundSeries"];
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
    if (episodeRequest.indexOf('-') === -1) {
        return rp(buildEpisodeRequestOptions(seriesId, seasonNumber, episodeRequest))
            .then(function (episode) {
                return episode.status !== "404";
            })
            .catch(function (err) {
                console.log("Oh noes! :( Got an error fetching episode... ");
                return err.error;
            });
    } else {
        var start = +episodeRequest.substr(0, episodeRequest.indexOf('-'));
        var end = +episodeRequest.substr(episodeRequest.indexOf('-') + 1, episodeRequest.length)
        if(start > end) return "wrongInterval";
        var responses = [];
        return recursiveCallFunction(start, end, seriesId, seasonNumber, responses);
    }
}

function recursiveCallFunction(start, end, seriesId, seasonNumber, responses) {
    if (start <= end) {
        return rp(buildEpisodeRequestOptions(seriesId, seasonNumber, start))
            .then(function (episode) {
                responses.push(episode.status !== "404");
                start++;
                return recursiveCallFunction(start, end, seriesId, seasonNumber, responses)
            })
            .catch(function (err) {
                console.log("Oh noes! :( Got an error fetching episode... ");
                return err.error;
            });
    } else {
        res = true;
        for (var i = 0; i < responses.length; i++) {
            res = res && responses[i];
        }
        return res;
    }
}

function getShowInfosById(showId) {
    return rp(buildShowRequestOptionsById(showId))
        .then(function (show) {
            return show;
        }).catch(function (err) {
            console.log("Oh noes! :( Got an error fetching show... ");
            return err.error;
        });
}

function getNextEpisodeInformation(link) {
    return rp(buildGenericOptions(link))
        .then(function (nextEpisode) {
            return nextEpisode;
        }).catch(function (err) {
            console.log("Oh noes! :( Got an error fetching next episode... ");
            return err.error;
        });
}

exports.getShowInfosById = getShowInfosById;
exports.getNextEpisodeInformation = getNextEpisodeInformation;