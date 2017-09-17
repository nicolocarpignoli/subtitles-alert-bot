var addic7edApi = require('addic7ed-api');
var fs = require('fs');
var Common = require('../common.js');
var Mongoose = require('mongoose');
var Mongo = require('../db/mongo.js');
var ScheduleManager = require('../schedule/scheduleManager.js');
var TvMaze = require('../libs/tvMaze.js');
var Logger = require('../log/logger.js');

exports.addic7edGetSubtitle = function (session, languages, bot, chat, sessionsList) {
    if(session.choosenEpisode.indexOf('-')===-1){
        getSingleEpisodeSubs(session, languages, bot, chat, sessionsList, session.choosenEpisode, true)
    }else{
        var start = +session.choosenEpisode.substr(0, session.choosenEpisode.indexOf('-'));
        var end = +session.choosenEpisode.substr(session.choosenEpisode.indexOf('-') + 1, session.choosenEpisode.length);
        while (start <= end){
            getSingleEpisodeSubs(session, languages, bot, chat, sessionsList, start, start == end),
            start++;
        }
    }
}

function getSingleEpisodeSubs (session, languages = [], bot, chat, sessionsList, episode, sendAmbiguousMessage) {
    Logger.logEvent("get", languages, session);
    addic7edApi.search(session.choosenSeries.show.name, session.choosenSeason,
        episode, languages).then(function (subtitlesList) {
            var subInfo = subtitlesList[0];
            if (subInfo != undefined) {
                var filename = session.choosenSeries.show.name + '_S' + session.choosenSeason + '_E' + episode + '.srt';
                addic7edApi.download(subInfo, filename).then(function () {
                    fs.access(filename, function (err) {
                        if (!err) {
                            //console.log('Subtitles file saved.');
                            //Common.removeSession(sessionsList, session);
                            bot.sendMessage(chat, Translate.buildLinkMessage[session.userLanguage](subInfo.link));
                            bot.sendDocument(chat, filename).then(function () {
                                fs.unlinkSync(filename, function(err){
                                    if(err) console.log("error, file not deleted");
                                });
                            });
                            if (sendAmbiguousMessage && session.choosenSeries.show.name.indexOf("(") > -1 && session.choosenSeries.show.name.indexOf(")") > -1) {
                                bot.sendMessage(chat, Translate.ambigousSubtitleMessage[session.userLanguage]);
                            }
                        }
                    });
                 }).catch(function (err) {
                    console.log("error downloading subs", err);
                });
            }
            else
                bot.sendMessage(chat, Translate.subtitleNotFoundInAddic7edMessage[session.userLanguage]);
         }).catch(function (err) {
            console.log("error searching subs - ", err);
        });
}

exports.addic7edGetSubtitleAlert = function (alert, job, bot, doneJobInterval) {
    addic7edApi.search(alert.show_name, alert.nextepisode_season, alert.nextepisode_episode, alert.language).then(function (subtitlesList) {
        var subInfo = subtitlesList != undefined && subtitlesList.length > 0 ? subtitlesList[0] : undefined;
        if (subInfo != undefined) {
            var filename = alert.show_name + '_S' + alert.nextepisode_season + '_E' + alert.nextepisode_episode + "_" + alert.language + '.srt';
            addic7edApi.download(subInfo, filename).then(function () {
                fs.access(filename, function (err) {
                    if (!err) {
                        //console.log('Subtitles file saved.');
                        if(alert && alert._doc && alert._doc._id){
                            Mongo.User.find({ alerts: alert._doc._id.toString() }, function (err, users) {
                                users.forEach(function (user) {
                                    var userDoc = user._doc;
                                    bot.sendMessage(userDoc.chatId, Translate.newEpisodeAlertMessage[session.userLanguage](userDoc.first_name, alert._doc.show_name));
                                    bot.sendMessage(userDoc.chatId, Translate.buildLinkMessage[session.userLanguage](subInfo.link));
                                    bot.sendDocument(userDoc.chatId, filename).then(function () {
                                        console.log("File sent to user " + userDoc.first_name);
                                    });
                                    if (Common.isAmbiguousTitle(alert._doc.show_name)) {
                                        bot.sendMessage(userDoc.chatId, Translate.ambigousSubtitleMessage[session.userLanguage]);
                                    }
                                });
                                job.attrs.data.hasToBeRemoved = true;
                                fs.unlinkSync(filename, function(err){
                                    if(err) console.log("error, file not deleted");
                                });
                                doneJobInterval();
                            });
                        }
                    }
                });
             }).catch(function (err) {
                console.log("error download subs - ", err);
            });
        } else {
            job.attrs.data.hasToBeRemoved = false;
            doneJobInterval();
        }
     }).catch(function (err) {
        console.log("error searching subs - ", err);
    });
}