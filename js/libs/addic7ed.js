var addic7edApi = require('addic7ed-api');
var fs = require('fs');
var Common = require('../common.js');
var Mongoose = require('mongoose');
var Mongo = require('../db/mongo.js');
var ScheduleManager = require('../schedule/scheduleManager.js');
var TvMaze = require('../libs/tvMaze.js');
var Logger = require('../log/logger.js');

exports.addic7edGetSubtitle = function (session, languages, bot, chat, sessionsList) {
    if (session.numberOfEp != undefined) {
        for (i = 0; i < session.numberOfEp; i++) {
            getSingleEpisodeSubs(session, languages, bot, chat, sessionsList, i, true);
        }
    } else if (session.choosenEpisode.indexOf('-') === -1 && session.choosenEpisode.indexOf(Common.allString) === -1) {
        getSingleEpisodeSubs(session, languages, bot, chat, sessionsList, session.choosenEpisode, true)
    } else if (session.choosenEpisode.indexOf(Common.allString) !== -1) {
        let promise = Common.getNumberOfEpisodes(session.choosenSeason, session.choosenSeries);
        //TODO to use here recursiveCAllFunction or similiar
        return promise.then(function (response) {
            if (response != null) {
                var start = 1;
                var end = +response;
                while (start <= end) {
                    getSingleEpisodeSubs(session, languages, bot, chat, sessionsList, start, start == end),
                    start++;
                }
            }
        });
    } else {
        var start = +session.choosenEpisode.substr(0, session.choosenEpisode.indexOf('-'));
        var end = +session.choosenEpisode.substr(session.choosenEpisode.indexOf('-') + 1, session.choosenEpisode.length);
        while (start <= end) {
            getSingleEpisodeSubs(session, languages, bot, chat, sessionsList, start, start == end),
                start++;
        }
    }
}

function getSingleEpisodeSubs(session, languages = [], bot, chat, sessionsList, episode, sendAmbiguousMessage) {
    //Logger.logEvent("get", languages, session);
    addic7edApi.search(session.choosenSeries.show.name, session.choosenSeason,
        episode, languages).then(function (subtitlesList) {
            var subInfo = subtitlesList[0];
            if (subInfo != undefined) {
                var filename = session.choosenSeries.show.name + '_S' + session.choosenSeason + '_E' + episode + '.srt';
                addic7edApi.download(subInfo, filename).then(function () {
                    fs.exists(filename, function (exists) {
                        if (exists) {
                            console.log('Subtitles file saved.');
                            Common.removeSession(sessionsList, session);
                            bot.sendMessage(chat, Common.buildLinkMessage(subInfo.link));
                            bot.sendDocument(chat, filename).then(function () {
                                fs.unlinkSync(filename);
                            });
                            if (sendAmbiguousMessage && session.choosenSeries.show.name.indexOf("(") > -1 && session.choosenSeries.show.name.indexOf(")") > -1) {
                                bot.sendMessage(chat, Common.ambigousSubtitleMessage);
                            }
                        }
                    }).catch(function (err) {
                        console.log("file not found");
                    });
                }).catch(function (err) {
                    console.log("error downloading subs - ", session);
                });
            }
            else
                bot.sendMessage(chat, Common.subtitleNotFoundInAddic7edMessage);
        }).catch(function (err) {
            console.log("error searching subs - ", session);
        });
}

exports.addic7edGetSubtitleAlert = function (alert, job, bot, doneJobInterval) {
    addic7edApi.search(alert.show_name, alert.nextepisode_season, alert.nextepisode_episode, alert.language).then(function (subtitlesList) {
        var subInfo = subtitlesList[0];
        if (subInfo != undefined) {
            var filename = alert.show_name + '_S' + alert.nextepisode_season + '_E' + alert.nextepisode_episode + '.srt';
            addic7edApi.download(subInfo, filename).then(function () {
                fs.exists(filename, function (exists) {
                    if (exists) {
                        console.log('Subtitles file saved.');
                        Mongo.User.find({ alerts: alert._id.toString() }, function (err, users) {
                            users.forEach(function (user) {
                                var userDoc = user._doc;
                                bot.sendMessage(userDoc.chatId, Common.newEpisodeAlertMessage(userDoc.first_name, alert.show_name));
                                bot.sendMessage(userDoc.chatId, Common.buildLinkMessage(subInfo.link));
                                bot.sendDocument(userDoc.chatId, filename).then(function () {
                                    console.log("File sent to user " + userDoc.first_name);
                                });
                                if (Common.isAmbiguousTitle(alert.show_name)) {
                                    bot.sendMessage(userDoc.chatId, Common.ambigousSubtitleMessage);
                                }
                            });
                            job.attrs.data.hasToBeRemoved = true;
                            fs.unlinkSync(filename);
                            doneJobInterval();
                        });
                    }
                }).catch(function (err) {
                    console.log("file not found");
                });
            }).catch(function (err) {
                console.log("error download subs - ", alert);
            });
        } else {
            job.attrs.data.hasToBeRemoved = false;
            doneJobInterval();
        }
    }).catch(function (err) {
        console.log("error searching subs - ", alert);
    });
}