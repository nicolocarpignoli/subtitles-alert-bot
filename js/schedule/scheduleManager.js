Agenda = require('agenda');
var Mongo = require('../db/mongo.js');
var Addic7ed = require('../libs/addic7ed.js');
var Conf = require('../conf.js');
var Main = require('../main.js');
var TvMaze = require('../libs/tvMaze.js');

var pendingShowInterval = '1 month';
var intervalSchedule = '*/15 * * * *'; //every 15 minutes
//var intervalSchedule = '30 seconds'; //test
var connectionString;
var usable = false;
var agenda = null;

exports.startAgenda = function(){
    Mongo.getMongoConnection().db.collection('agendaJobs', function (err, collection) {
        collection.find(function (error, cursor) {
            if (error){
                console.log("Error: " + error);
            }else{
                cursor.forEach(function(job) {
                    var tokens = job.name.split("_");
                    resetJob(tokens, job);
                });
            }
        });
    });    
}

var scheduleFunctionGivenTime = function (jobName, date, alert, func, data) {
    var agenda = new Agenda({ mongo: Mongo.getMongoConnection() });
    agenda.defaultLockLifetime(1000*60*1000);
    data = (typeof data !== 'undefined') ? data : {};
    agenda.define(jobName, function (job, done) {
        job.alert = alert;
        func(job, done);
    });
    agenda.on("ready", function () {
        agenda.schedule(formatDate(date), jobName, data);
        //agenda.schedule(new Date(Date.now() + 5000), jobName, data); //test
        agenda.start();
        //console.log("Job %s scheduled with nextRunAt %s", jobName, date);
    })
    agenda.on('complete', function (job) {
        //console.log('Job %s finished', job.attrs.name);
        agenda.cancel({ name: job.attrs.name }, function (err, numRemoved) {
            //console.log("%s jobs removed named %s", numRemoved, job.attrs.name);
        });
    });
}

var scheduleFunctionInterval = function (jobName, interval, alert, func, data) {
    var agenda = new Agenda({ mongo: Mongo.getMongoConnection() });
    agenda.defaultLockLifetime(1000*60*1000);
    data = data || {};
    agenda.define(jobName, function (job1, done2) {
        job1.alert = alert;
        func(job1, done2);
    });
    agenda.on("ready", function () {
        agenda.every(interval, jobName, data);
        agenda.start();
    });
    agenda.on('complete', function (job) {
        //console.log('Job %s finished', job.attrs.name);
        if (job.attrs.data.hasToBeRemoved) {
            var getShowPromise = TvMaze.getShowInfosById(job.alert.showId);
            getShowPromise.then(function (show) {
                if(show && show._links && show._links.nextepisode){
                    const nextEpisodeLink = show._links.nextepisode.href;
                    if (show.status != 'Running') {
                        Mongo.deleteAlert(job.alert._id.toString());
                        Mongo.deleteAlertFromAllUsers(job.alert);
                        agenda.cancel({ name: job.attrs.name }, function (err, numRemoved) {
                            //console.log("Removed %s jobs with name %s", numRemoved, job.attrs.name);
                        });
                    } else {
                        if (nextEpisodeLink) {
                            var nextEpisodePromise = TvMaze.getNextEpisodeInformation(nextEpisodeLink);
                            nextEpisodePromise.then(function (nextEp) {
                                var tokens = job.attrs.name.split("_");
                                resetJob(tokens, job, nextEp);
                            });
                        } else {
                            bot.sendMessage(userDoc.chatId, Common.noNextEpisodeYetMessage);
                            // TODO Job Pending task su trello (#29)
                        }
                    }
                }
            });
        }
    });
}

var formatDate = function (date) {
    // starts at 00.00 of airDate
    if(!date) return new Date();
    return new Date(date + " 00:00:00");
}

var activateStoredSchedules = function (alert, bot, outdated) {
    if(alert == null) return;
    var date = outdated ? formatDate() : alert.nextepisode_airdate;
    scheduleFunctionGivenTime(alert.show_name + '_' + alert.language + '_giventime', date, alert, function (jobDate, doneJobDate) {
        scheduleFunctionInterval(alert.show_name + '_' + alert.language + '_interval', intervalSchedule, alert, function (jobInterval, doneJobInterval) {
            Addic7ed.addic7edGetSubtitleAlert(alert, jobInterval, bot, doneJobInterval);
        }, { hasToBeRemoved: false });
        doneJobDate();
    });
}

var updateNextRunDate = function (job, newDate) {
    job.nextRunAt = formatDate(newDate);
    job.save(function (err) {
        if (!err)
            console.log("Job %s nextRunAt successfully edited to %s", job.attrs.name, formatDate(newDate));
    });
}

var cancelJob = function (jobName) {
    var agenda = new Agenda({ mongo: Mongo.getMongoConnection() });    
    agenda.cancel({ name: jobName }, function (err, numRemoved) {
        //console.log("Removed %s jobs with name %s", numRemoved, jobName);
    });
}

var resetJob = function ( tokens, job, nextEp) {
    // if nextEp != undefined --> updating after sending subs to user
    var jobName = nextEp != undefined ? job.attrs.name : job.name;
    var agenda = new Agenda({ mongo: Mongo.getMongoConnection() });    
    agenda.cancel({ name: jobName }, function (err, numRemoved) {
        //console.log("RESRET JOB: Removed %s jobs with name %s", numRemoved, jobName);
        Mongo.Alert.findOne({ show_name: tokens[0], language: tokens[1] }, function (err, jobAlert) {
            if(nextEp != undefined){
                var newAlert = { 
                    show_name: tokens[0],
                    showId: jobAlert._doc.showId,
                    language: tokens[1],
                    nextepisode_airdate: nextEp.airdate,
                    nextepisode_season: nextEp.season,
                    nextepisode_episode: nextEp.number
                };
                Mongo.Alert.findOneAndUpdate({ showId: jobAlert.showId, language: jobAlert.language },
                    newAlert, { new: true, upsert: true }, function (err, storedAlert) {
                        if(err) console.log("err", err);
                        else activateStoredSchedules(storedAlert._doc, Main.getBotInstance(), new Date(nextEp.airdate) <= new Date());
                    });
            }else{
                activateStoredSchedules(jobAlert, Main.getBotInstance(), new Date(job.nextRunAt) <= new Date());
            }
        });
    });
}

exports.formatDate = formatDate;
exports.activateStoredSchedules = activateStoredSchedules;
exports.scheduleFunctionGivenTime = scheduleFunctionGivenTime;
exports.scheduleFunctionInterval = scheduleFunctionInterval;
exports.updateNextRunDate = updateNextRunDate;
exports.cancelJob = cancelJob;