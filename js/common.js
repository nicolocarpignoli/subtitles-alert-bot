var Session = require('./models/session.js');
var Languages = require('./models/languages.js'); 


exports.instructionsMessage = "Welcome, my tv-addicted friend! What you want me to do today?"
exports.whichSeriesMessage = function (firstName) { return "Ok " + firstName + "! Which series do you want?"; }
exports.whichSeasonMessage = function (series) { return "Good you choose " + series + "! Which season?"; }
exports.whichAmbigousSeasonMessage = function (series) { return "Great choice! Which season of " + series + " do you want?" }
exports.whichEpisodeMessage = "Great! Which episode?";
exports.whichLanguageMessage = "Great! Which language do I have to search for?";
exports.runningState = 'Running';
exports.successSubscribeMessage = function (series) { return  "You are now subscribed to " + series + "! When next episode's subtitles for languages you chose will be out, I'll send them to you ;)"}
exports.newEpisodeAlertMessage = function (firstName, showName) { return  "Hey " + firstName + ", subtitles for the last episode of " + showName + " are out! Here it is!"}
exports.showAlertsMessage = "These are your active alerts right now:";
exports.confirmCallback = "yes";
exports.revertCallback = "no";

exports.whichSeriesAlertMessage = function (firstName) { return "Ok " + firstName + "! Which series do you want to subscribe to?"; }
exports.seriesNotRunningMessage = function (series)
{ return "Hey man I really think " + series + " is ended! If you want to get subtitles of it please try the GET functionality or try another series for SUBSCRIBE!" }
exports.whichLanguagesAlertMessage = function (series)
{ return "Ok you choose " + series + "! Please send me a language for your subtitles. You can send more than one language and click 'Done' at the end!"; }
exports.languageAlreadyPresentMessage = "It seems you have already inserted this language, dude! Try with another one!";

exports.failedSeriesMessage = "Sorry, no series found with that name \u2639\uFE0F Please try with another great tv-series title";
exports.ambiguousSeriesMessage = "Mmh ambiguous! \uD83E\uDD14 Which of these? (if none of these is the series you are looking for, try GET again with a more precise name)"
exports.notANumberMessage = "This doesn't seem to be a valid number, dude... retry!";
exports.seasonNotFoundMessage = "Season not found or not out yet. Retry or restart GET!";
exports.episodeNotFoundMessage = "Episode doesn't exist or not found. Retry or restart GET!";
exports.languageNotFoundMessage = "Sorry, language not found! Try typing your language as three-letter code, international form or native form!"
exports.subtitleNofFoundInAddic7edMessage = "Oh noes! We can't find your subtitles in our magic system! I guess nobody has subbed this yet... try again with a different language or a new request!"
exports.LoadingSubtitleMessage = "Great! I'm fetching for your subtitle now mate \uD83D\uDCE5";
exports.ambigousSubtitleMessage = "Hey, watch out! It's possible that you choose a very ambiguous series and our system find the only match it has!";
exports.chooseAtLeastALanguageMessage = "Hey, you have to choose at least one language for your subscription! Try again sending me a valid language!";
exports.subscribingToMessage = "Ok, I'm gonna subscribe you! Please wait a sec \u270F\uFE0F \uD83D\uDDD3";
exports.addLanguageMessage = "Ok gotcha! Send me another language or click on 'Done' to subscribe";
exports.nextEpisodeNotAvailableMessage = "Too early for a subscription for this series. We haven't got enough informations yet! Try again on the next weeks!";

exports.getCommand = "Get subtitles \uD83D\uDCE5";
exports.startAlertCommand = "Subscribe \uD83D\uDCE2";
exports.stopAlertCommand = "Unsubscribe \uD83D\uDEAB";

exports.doneLanguageCallback = "doneLanguageCallback";

exports.GETregExp = new RegExp(this.getCommand);
exports.STARTregExp = new RegExp(this.startAlertCommand);
exports.STOPregExp = new RegExp(this.stopAlertCommand);

exports.notACommand = function (userInput) {
    return userInput != this.getCommand &&
        userInput != this.startAlertCommand &&
        userInput != this.stopAlertCommand;
    }

exports.isValidNumber = function (str) {
    var number = Math.floor(Number(str));
    return String(number) === str && number > 0;
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

exports.checkSessions = function (sessions, msg) {
    let userSession = sessions.find(function (session) {
        return session.chatId === msg.id;
    }) || new Session();
    userSession.chatId = msg.id;
    userSession.firstName = msg.first_name;
    return userSession;
}

exports.pushInSessions = function (sessions, session) {
    if (sessions.length == 0) sessions.push(session);
    else {
        var sessionIdx = sessions.findIndex(function (element) {
            return session.chatId == element.chatId;
        });
        if (sessionIdx == -1) sessions.push(session);
        else sessions[sessionIdx] = session;
    }
}

exports.removeSession = function (sessions, session) {
    if (sessions.length == 0) return;
    var sessionIdx = sessions.findIndex(function (element) {
        return session.chatId == element.chatId;
    });
    if (sessionIdx != -1) sessions.splice(sessionIdx, 1);
}

exports.resetValues = function (session) {
    session.choosingSeries = false;
    session.choosingSeason = false;
    session.choosingEpisode = false;
    session.choosingLanguage = false;
    session.chosenSeries = {};
    session.chosenSeason = undefined;
    session.chosenEpisode = undefined;
    session.ambiguousSeries = {};

    session.choosingSeriesAlert = false,
        session.choosingLanguageAlert = false,
        session.choosenSeriesAlert = {},
        session.ambiguousSeriesAlert = {}
    session.chosenLanguagesAlert = []
    session.deletingAlert = false
}

exports.handleChosenSeries = function (chosenSeries, session, sessions) {
    session.choosenSeries = chosenSeries;
    this.resetValues(session);
    session.choosingSeason = true;
    this.pushInSessions(sessions, session);
}

exports.handleChosenSeriesAlert = function (chosenSeries, session, sessions) {
    session.choosenSeriesAlert = chosenSeries;
    this.resetValues(session);
    session.choosingLanguageAlert = true;
    this.pushInSessions(sessions, session);
}

exports.languageAlreadyPresent = function (list, language) {
    return list.indexOf(language) > -1;
}

exports.getLanguageFromKey = function (key) {
    var lan = Languages.languages;
    var language = Languages.languages[key];
    return new Language({
        code: key,
        int: language.int[0],
        native: language.native[0]
    });
}