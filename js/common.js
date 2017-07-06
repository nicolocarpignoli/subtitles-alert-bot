var Session = require('./models/session.js');

exports.instructionsMessage = "Welcome, my tv-addicted friend! What you want me to do today?"
exports.whichSeriesMessage = function(firstName) { return "Ok " + firstName + " ! Which series do you want?";}
exports.whichSeasonMessage = "Good! Which season?"
exports.whichEpisodeMessage = "Great! Which episode?";
exports.whichLanguageMessage = "Great! Which language do I have to search for?";

exports.failedSeriesMessage = "Sorry, no series found with that name \u2639\uFE0F";
exports.ambiguousSeriesMessage = "Mmh ambiguous! \uD83E\uDD14 Which of these? (if none of these is the series you are looking for, try GET again with a more precise name)"
exports.notANumberMessage = "This doesn't seem to be a valid number, dude... retry!";
exports.seasonNotFoundMessage = "Season not found or not out yet. Retry or restart GET!";
exports.episodeNotFoundMessage = "Episode doesn't exist or not found. Retry or restart GET!";
exports.languageNotFoundMessage = "Sorry, language not found! Try typing your language as three-letter code, international form or native form!"
exports.subtitleNofFoundInAddic7edMessage = "Oh noes! We can't find your subtitles in our magic system! I guess nobody has subbed this yet... try again with a different language or a new request!"
exports.LoadingSubtitleMessage = "Great! I'm fetching for your subtitle now mate \uD83D\uDCE5";

exports.getCommand = "Get \uD83D\uDCE5";
exports.startAlertCommand = "Start Alert \uD83D\uDCE2";
exports.stopAlertCommand = "Stop Alert \uD83D\uDEAB";
exports.showAlertsCommand = "Show Alerts \uD83D\uDCC5";

exports.GETregExp = new RegExp(this.getCommand);
exports.STARTregExp = new RegExp(this.startAlertCommand);
exports.STOPregExp = new RegExp(this.stopAlertCommand);
exports.SHOWregExp = new RegExp(this.showAlertsCommand);

exports.notACommand = function (userInput) {
    return userInput != this.getCommand &&
        userInput != this.startAlertCommand &&
        userInput != this.stopAlertCommand &&
        userInput != this.showAlertsCommand;
}

exports.isEmpty = function (obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

exports.buildLinkMessage = function (link) {
    return 'There it is! If you want more subtitles of this episode please visit: www.addic7ed.com' + link;
}

exports.checkSessions = function (sessions, id) {
    let userSession = sessions.find(function (session) {
        return session.chatId === id;
    }) || new Session();
    userSession.chatId = id;
    return userSession;
}

exports.pushInSessions = function (sessions, session) {
    if (sessions.length == 0) sessions.push(session);
    else {
        var sessionIdx = sessions.findIndex(function (element) {
            return session.chatId == element.chatId;
        });
        sessions[sessionIdx] = session;
    }
}

exports.removeSession = function (sessions, session) {
    if (sessions.length == 0) return;
    var sessionIdx = sessions.findIndex(function (element) {
        return session.chatId == element.chatId;
    });
    sessions.splice(sessionIdx, 1);
}

exports.resetValues = function(session) {
    session.choosingSeries = false;
    session.choosingSeason = false;
    session.choosingEpisode = false;
    session.ambiguousSeries = {};
    session.counterLanguage = 0;
}