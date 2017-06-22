var http = require('http');

function buildSeriesUrl(seriesName) {
    return "http://api.tvmaze.com/search/shows?q=" + seriesName;
}

function buildSeasonsUrl(seriesId) {
    return "http://api.tvmaze.com/shows/" + seriesId + "/seasons";
}

function ResultMatchesQuery(firstSeries, query) {
    var foundSeriesName = firstSeries.show.name;
    return query.trim().toLowerCase() === firstSeries.trim().toLowerCase();
}

function TVMazeSearch(url) {
    http.get(url, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n Status Code: ${statusCode}');
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n Expected application/json but received ${contentType}');
        }

        if (error) {
            console.error(error.message);
            // consume response data to free up memory
            res.resume();
            return;
        }

        res.setEncoding('utf8');

        let rawData = '';

        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                return parsedData;
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error('Got error: ${e.message}');
    });
}

//prende l'input dell'utente e cerca una serie con quel nome.
//se non trova niente ritorna array vuoto
//se il primo risultato coincide ritorna l'oggetto di quella serie
//se il primo risultato non coincide ritorna i primi 6 (o meno) risultati per far scegliere all'utente

exports.checkSeriesValidity = function(seriesName) {
    var foundSeries = [];
    var resultMatchesQuery = false;
    foundSeries= TVMazeSearch(buildSeriesUrl(seriesName));
    console.log(foundSeries);
    if (foundSeries.length == 0)
        return foundSeries;
    else {
        resultMatchesQuery = ResultMatchesQuery(foundSeries[0], seriesName);
        if (resultMatchesQuery)
            return foundSeries[0];
        else
        {
            var firstSix = foundSeries.slice(0, 7);
            return firstSix;
        }
    }
}

function checkSeasonValidity(seriesId, seasonRequest) {
    var seasons = TVMazeSearch(buildSeasonsUrl(seriesId));
    return seasons ? seasonRequest <= seasons.length : false;
}