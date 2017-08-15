Agenda = require('agenda');
var Mongo = require('../db/mongo.js');
var Addic7ed = require('../libs/addic7ed.js');
var Conf = require('../conf.js');
var Main = require('../main.js');
var TvMaze = require('../libs/tvMaze.js');

var pendingShowInterval = '1 month';
var intervalSchedule = '*/15 * * * *'; //every 15 minutes
//var intervalSchedule = '1 minute'; //test
var connectionString;
var usable = false;
var agenda = null;

exports.startAgenda = function(){
    Mongo.getMongoConnection().db.collection('agendaJobs', function (err, collection) {
        collection.update({}, {
            $set: {nextRunAt: new Date()}
        }, {multi: true}, function (error, numUnlocked) {
            if (error) console.log("Error: " + error);
        });
    });

    Mongo.getMongoConnection().db.collection('agendaJobs', function (err, collection) {
        collection.find(function (error, cursor) {
            if (error){
                console.log("Error: " + error);
            }else{
                cursor.forEach(function(job) {
                    cancelJob(job.name);
                    var tokens = job.name.split("_");
                    Mongo.Alert.findOne({ show_name: tokens[0], language: tokens[1] }, function (err, jobAlert) {
                        activateStoredSchedules(jobAlert, Main.getBotInstance(), new Date(job.nextRunAt) <= new Date());
                        // scheduleFunctionInterval(job.name, intervalSchedule, jobAlert, function (jobInterval, doneJobInterval) {
                        //     Addic7ed.addic7edGetSubtitleAlert(jobAlert, jobInterval, Main.getBotInstance(), doneJobInterval);}, 
                        //         { hasToBeRemoved: false });
                    });
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
        console.log("Job %s scheduled with nextRunAt %s", jobName, date);
    })
    agenda.on('complete', function (job) {
        console.log('Job %s finished', job.attrs.name);
        agenda.cancel({ name: job.attrs.name }, function (err, numRemoved) {
            console.log("%s jobs removed named %s", numRemoved, job.attrs.name);
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
        console.log('Job %s finished', job.attrs.name);
        if (job.attrs.data.hasToBeRemoved) {
            var getShowPromise = TvMaze.getShowInfosById(job.alert.showId);
            getShowPromise.then(function (show) {
                const nextEpisodeLink = show._links.nextepisode.href;
                if (show.status != 'Running') {
                    Mongo.deleteAlert(job.alert._id.toString());
                    Mongo.deleteAlertFromAllUsers(job.alert);
                    agenda.cancel({ name: job.attrs.name }, function (err, numRemoved) {
                        console.log("Removed %s jobs with name %s", numRemoved, job.attrs.name);
                    });
                } else {
                    if (nextEpisodeLink) {
                        var nextEpisodePromise = TvMaze.getNextEpisodeInformation(nextEpisodeLink);
                        nextEpisodePromise.then(function (nextEp) {
                            console.log("RE_ASSIGNING NEXTRUNB AL JOB: ", nextEp.airdate);
                            // job.alert.nextepisode_airdate = nextEp.airdate;
                            // activateStoredSchedules(job.alert, Main.getBotInstance(), false);
                            updateNextRunDate(job, nextEp.airdate);
                        });
                    } else {
                        bot.sendMessage(userDoc.chatId, Common.noNextEpisodeYetMessage);
                        // TODO Job Pending task su trello (#29)
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
        console.log("Removed %s jobs with name %s", numRemoved, jobName);
    });
}

exports.formatDate = formatDate;
exports.activateStoredSchedules = activateStoredSchedules;
exports.scheduleFunctionGivenTime = scheduleFunctionGivenTime;
exports.scheduleFunctionInterval = scheduleFunctionInterval;
exports.updateNextRunDate = updateNextRunDate;
exports.cancelJob = cancelJob;