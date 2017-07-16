var addic7edApi = require('addic7ed-api');
var fs = require('fs');
var Common = require('../common.js');
var Mongoose = require('mongoose');
var Mongo = require('../db/mongo.js');

exports.addic7edGetSubtitle = function(session, languages = [], bot, chat, sessionsList){
	addic7edApi.search(session.choosenSeries.show.name, session.choosenSeason, 
        session.choosenEpisode, languages).then(function (subtitlesList) {
        var subInfo = subtitlesList[0];
        if (subInfo != undefined) {
            var filename =  session.choosenSeries.show.name + '_S' + session.choosenSeason + '_E' + session.choosenEpisode + '.srt';
            addic7edApi.download(subInfo, filename)
                .then(function () {
                    fs.exists(filename, function(exists){
                        if(exists) {
                            console.log('Subtitles file saved.');
                            Common.removeSession(sessionsList, session); 
                            bot.sendMessage(chat, Common.buildLinkMessage(subInfo.link));
                            bot.sendDocument(chat, filename).then(function(){
                                fs.unlinkSync(filename);
                            });
                            if(session.choosenSeries.show.name.indexOf("(") > -1 && session.choosenSeries.show.name.indexOf(")") > -1){
                                bot.sendMessage(chat, Common.ambigousSubtitleMessage);
                            }
                        }
                    });
            });
        }else{
            bot.sendMessage(chat, Common.subtitleNofFoundInAddic7edMessage);
        }
    });
}

exports.addic7edGetSubtitleAlert = function(show_name, language, season, episode){
	addic7edApi.search(show_name, season, number, language).then(function (subtitlesList) {
        var subInfo = subtitlesList[0];
        if (subInfo != undefined) {
            var filename =  show_name + '_S' + season + '_E' + number + '.srt';
            addic7edApi.download(subInfo, filename)
                .then(function () {
                    fs.exists(filename, function(exists){
                        if(exists) {
                            console.log('Subtitles file saved.');
                            Mongo.User.find({alerts: alert_id}, function (err, users) {
                                users.forEach(function(user) {
                                   // TODO rimuoevere job e aggiungere nuovo job da nuovo episodio
                                    bot.sendMessage(user.chatId, Common.buildLinkMessage(subInfo.link));
                                    bot.sendDocument(user.chatId, filename).then(function(){
                                        console.log("File sent to user " + user.first_name);  
                                    });
                                    if(show_name.indexOf("(") > -1 && show_name.indexOf(")") > -1){
                                        bot.sendMessage(user.chatId, Common.ambigousSubtitleMessage);
                                    } 
                                });
                            });
                            fs.unlinkSync(filename);       
                        }
                    });
            });
        }
    });
}