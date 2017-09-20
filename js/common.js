var Session = require('./models/session.js');
var Languages = require('./models/languages.js'); 
var Language = require('./models/language.js'); 
var Translate = require('./translations.js');
var Mongo = require('./db/mongo.js');

exports.notACommand = function (userInput) {
    return !checkDifferentFromAllLanguages(Translate.getCommand, userInput) &&
        !checkDifferentFromAllLanguages(Translate.startAlertCommand, userInput) &&
        !checkDifferentFromAllLanguages(Translate.stopAlertCommand, userInput) &&
        !checkDifferentFromAllLanguages(Translate.helpCommand, userInput) &&
        !checkDifferentFromAllLanguages(Translate.donateCommand, userInput) &&
        !checkDifferentFromAllLanguages(Translate.languageCommand, userInput)
}

checkDifferentFromAllLanguages = function(command, userInput) {
    let hasOccurence = false;
    Object.keys(command).forEach(function(key,index) {
        if(command[key] == userInput) hasOccurence = true;
    });
    return hasOccurence;
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

exports.checkSessionEmpty = function(session){
    return !session.choosingUserLanguage 
        && !session.choosingSeries 
        && !session.choosingSeason 
        && !session.choosingEpisode
        && !session.choosingLanguage 
        && !session.choosingSeriesAlert 
        && !session.choosingLanguageAlert 
        && !session.deletingAlert
        && !session.confirmDelete;
}


exports.getUserSession = function (sessions, msg, translations) {
    var chat = msg.chat ? msg.chat : msg.from;
    let userSession = sessions.find(function (session) {
        return session.chatId === chat.id;
    }) || new Session();
    userSession.chatId = chat.id;
    userSession.firstName = chat.first_name;
    Object.keys(translations).forEach(function(key,index) {
        translations[key].forEach(function(userId) {
            if(userId === chat.id) userSession.userLanguage = key;
        });
    });
    if(!userSession.userLanguage) {
        userSession.userLanguage = this.parseLanguage(msg.from.language_code);
        translations[userSession.userLanguage].push(chat.id);
    }
    return userSession;
}

exports.parseLanguage = function(languageCode){
    return Languages.languages[languageCode.split("-")[0]]["native"][0];
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