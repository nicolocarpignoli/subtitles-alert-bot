var http = require('http');
var tvMazeSearchUrl = "http://api.tvmaze.com/search/shows?q="

function ResultMatchesQuery(firstSeries, query) {
    var foundSeriesName = firstSeries.show.name;
    return query.toLowerCase() === firstSeries.toLowerCase();
}

exports.searchSeries = function (query) {
    http.get(tvMazeSearchUrl + query, (res) => {
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
                console.log(parsedData);
                return parsedData;
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error('Got error: ${e.message}');
    });
}