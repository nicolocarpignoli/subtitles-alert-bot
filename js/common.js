var Session = require('./models/session.js');
var Languages = require('./models/languages.js'); 
var Language = require('./models/language.js'); 


exports.instructionsMessage = "Welcome, my tv-addicted friend! What do you want me to do today?"
exports.whichSeriesMessage = function (firstName) { return "Ok " + firstName + "! Which show do you want me to search for?"; }
exports.whichSeasonMessage = function (series) { return "Good, you choose " + series + "! Which season do you desire?"; }
exports.whichAmbigousSeasonMessage = function (series) { return "Great choice! Which season of " + series + " do you desire?" }
exports.whichEpisodeMessage = "Great! Which episode?";
exports.whichLanguageMessage = "Great! Which language do I have to search for?";
exports.runningState = 'Running';
exports.successSubscribeMessage = function (series) { return  "You are now subscribed to " + series + "! When the subtitles for the next episode of your show will be out, I'll send them to you immediately!"}
exports.newEpisodeAlertMessage = function (firstName, showName) { return  "Hey " + firstName + ", subtitles for the last episode of " + showName + " are out! Check these out!"}
exports.showAlertsMessage = "This list shows your active subscriptions right now:";
exports.confirmCallback = "yes";
exports.revertCallback = "no";
//TODO questo messaggio di noNextEpisodeYetMessage andrà tolto quando avremo fatto la feature #29 su trello
exports.noNextEpisodeYetMessage = "Hey, it seems that this season it's over or maybe our magic system cannot see the future for this show yet!"
exports.noAlertMessage = "It seems you have no active subscriptions right now... Try to add some!"

exports.whichSeriesAlertMessage = function (firstName) { return "Ok " + firstName + "! Which show do you want to subscribe to?"; }
exports.seriesNotRunningMessage = function (series)
{ return "Hey dude I really think " + series + " is ended! If you want to get subtitles of it please try the 'Get subtitles \uD83D\uDCE5' functionality or try another show!" }
exports.whichLanguagesAlertMessage = function (series)
{ return "Ok you choose " + series + "! Please send me a language for your subtitles. You can send more than one language and click 'Done' at the end!"; }
exports.languageAlreadyPresentMessage = "It seems you have already inserted this language, dude! Try with another one!";

exports.buildLinkMessage = function (link) { return 'There it is! If you want more subtitles of this episode please visit: www.addic7ed.com' + link;}
exports.failedSeriesMessage = "Sorry, no shows found with that name \u2639\uFE0F Please try with another great tv-show title";
exports.ambiguousSeriesMessage = "Mmh ambiguous! \uD83E\uDD14 Which of these? (If none of these is the show you are looking for, try again with a more precise name)"
exports.notANumberMessage = "This doesn't seem to be a valid number, dude... retry!";
exports.seasonNotFoundMessage = "Season not found or not out yet. Retry or restart 'Get subtitles \uD83D\uDCE5'!";
exports.episodeNotFoundMessage = "Episode doesn't exist or not found. Retry or restart 'Get subtitles \uD83D\uDCE5'!";
exports.languageNotFoundMessage = "Sorry, language not found! Try typing your language as three-letter code, international form or native form!"
exports.subtitleNotFoundInAddic7edMessage = "Oh noes! I can't find your subtitles in our magic system! I guess nobody has subbed this yet... try again with a different language or a new request!"
exports.LoadingSubtitleMessage = "Great! I'm fetching for your subtitle now mate \uD83D\uDCE5";
exports.ambigousSubtitleMessage = "Hey, watch out! Probably you chose a very ambiguous tv-show title and our system found the only match it had!";
exports.chooseAtLeastALanguageMessage = "Hey, you have to choose at least one language for your subscription! Try again and send me a valid language!";
exports.subscribingToMessage = "Ok, I'm gonna subscribe you! Please wait a sec \u270F\uFE0F \uD83D\uDDD3";
exports.addLanguageMessage = "Ok gotcha! Send me another language or click on 'Done' to subscribe";
exports.nextEpisodeNotAvailableMessage = "Too early for a subscription for this show. I haven't got enough informations yet! Try again on the next weeks!";
exports.seasonOverMessage = function(season, show) { return "Hey, season " + season + " of " + show + " is over! It's too early for a " +
"subscription for the next season! Please use Get subtitles \uD83D\uDCE5 functionality for season " + season + " subtitles!"};
exports.areYouSureRemoveAlert = function (series) {return "Are you sure you want to remove your alert for "+ series +"?"}
exports.notValidIntervalGetMessage = "Please retry with a valid interval in the form of 'first-last' without spaces!"
exports.deletedAlertMessage = "Subscription successfully deleted!";
exports.revertDeleteMessage = "Wise choice! I'll keep your subscription active";

exports.getCommand = "Get subtitles \uD83D\uDCE5";
exports.showCommand = "Show subscriptions \uD83D\uDDD3";
exports.startAlertCommand = "Subscribe \uD83D\uDCE2";
exports.stopAlertCommand = "Unsubscribe \uD83D\uDEAB";
exports.languageCommand = "Language \uD83C\uDDEE\uD83C\uDDF9";
exports.donateCommand = "Donate \uD83D\uDCB0";
exports.helpCommand = "Help \uD83C\uDD98";

exports.doneLanguageCallback = "doneLanguageCallback";

exports.SHOWregExp = new RegExp(this.showCommand)
exports.GETregExp = new RegExp(this.getCommand);
exports.STARTregExp = new RegExp(this.startAlertCommand);
exports.STOPregExp = new RegExp(this.stopAlertCommand);
exports.HELPRegExp = new RegExp(this.helpCommand);

exports.helpMessage = "A bot for subscribe and download subtitles for your favourite tv shows.\n\nUse Get subtitles \uD83D\uDCE5 for instant download of a single subtitles file, or" +
    " download a set of subtitles choosing an interval with 'first-last' episode numbers without spaces" +
    "\n\nUse Subscribe \uD83D\uDCE2 to start a subscription to subtitles for a tv show. Just relax and as soon as they're out you will receive your subtitles on your phone" +
    "\n\nUse Unsubscribe \uD83D\uDEAB for a list of your active subscriptions. You can also delete the subscriptions." +
    "\n\n You can also change bot Language \uD83C\uDDEE\uD83C\uDDF9 and  Donate \uD83D\uDCB0 us a beer." +
    "\n\nUse Help \uD83C\uDD98 for seeing this help message any time you want." +
    "\n\nFollow us on:" +
    "\n\nInstagram @subtitlesbottelegram" +
    "\n\nFacebook @subtitlesalertbot";

exports.notACommand = function (userInput) {
    return userInput != this.getCommand &&
        userInput != this.startAlertCommand &&
        userInput != this.stopAlertCommand &&
        userInput != "/help";
    }

exports.isValidNumber = function (str) {
    return isValidNumber(str);
}

function isValidNumber(str){
    var number = Math.floor(Number(str));
    return String(number) === str && number > 0;
}

exports.isValidInterval = function (str) {
    if(str.indexOf('-') === -1){
        return false;
    } 
    var start = str.substr(0, str.indexOf('-'));
    var end = str.substr(str.indexOf('-') + 1, str.length)
    return isValidNumber(start) && isValidNumber(end);
}

exports.isEmpty = function (obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


exports.getUserSession = function (sessions, msg) {
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

exports.isAmbiguousTitle = function(name){
    // returns true if the name contains 4 number between brackets (e.g.: (2344))
    var firstBracket = name.indexOf("(");
    var secondBracket = name.indexOf(")");
    if(secondBracket > -1 && firstBracket > -1 ){
        var number = name.substring(firstBracket, secondBracket);
        return this.isValidNumber(number)
    }else{
        return false;
    }
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