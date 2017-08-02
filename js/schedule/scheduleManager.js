Agenda = require('agenda');
var Mongo = require('../db/mongo.js');
var Addic7ed = require('../libs/addic7ed.js');
var Conf = require('../conf.js');
var Main = require('../main.js');
var TvMaze = require('../libs/tvMaze.js');

//var intervalSchedule = '*/15 * * * *'; //every 15 minutes
var intervalSchedule = '10 seconds'; //test
var connectionString;
var usable = false;
var agenda = null;


exports.activateStoredSchedules = function (alert, bot) {
    scheduleFunctionGivenTime(alert.show_name + '_' + alert.language + '_giventime', alert.nextepisode_airdate, function (jobDate, doneJobDate, alert) {
        scheduleFunctionInterval(alert.show_name + '_' + alert.language + '_interval', intervalSchedule, function (jobInterval, doneJobInterval, alert) {
            Addic7ed.addic7edGetSubtitleAlert(alert, jobInterval, bot, doneJobInterval);
        }, {hasToBeRemoved:false});
        doneJobDate();
    });
}

var setConnectionString = function (connectionStringP, maxConcurrency) {
    connectionString = connectionStringP;
}

var scheduleFunctionGivenTime = function (jobName, date, func, alert, data) {
    var agenda = new Agenda({ mongo: Mongo.getMongoConnection() });
    data = (typeof data !== 'undefined') ? data : {};
    agenda.define(jobName, function (job, done) {
        job.alert = alert;
        func(job, done);
    });
    agenda.on("ready", function () {
        //agenda.schedule(this.formatDate(date), jobName, data);
        agenda.schedule(new Date(Date.now() + 5000), jobName, data); //test
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

var scheduleFunctionInterval = function (jobName, interval, func, alert, data) {
    var agenda = new Agenda({ mongo: Mongo.getMongoConnection() });
    data = (typeof data !== 'undefined') ? data : {};
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
            agenda.cancel({ name: job.attrs.name }, function (err, numRemoved) {
                console.log("Removed %s jobs with name %s", numRemoved, job.attrs.name);
                var getShowPromise = TvMaze.getShowInfosById(job.alert.showId);
                getShowPromise.then(function (show) {
                    const nextEpisodeLink = show._links.nextepisode.href;
                    if(show.status != 'Running'){
                        Mongo.deleteAlert(job.alert);   //TODO verify if works
                        Mongo.deleteAlertFromAllUsers(job.alert);   //TODO verify if works
                    }else{
                        if (nextEpisodeLink) {
                            var nextEpisodePromise = TvMaze.getNextEpisodeInformation(nextEpisodeLink);
                            nextEpisodePromise.then(function (nextEp) {
                                console.log("RE_ASSIGNING NEXTRUNB AL JOB: ", nextEp.airdate);
                                job.alert.nextepisode_airdate = nextEp.airdate;
                                this.activateStoredSchedules(job.alert, Main.getBotInstance());
                            });
                        }else{
                            bot.sendMessage(userDoc.chatId, Common.noNextEpisodeYetMessage);
                            // TODO Job Pending task su trello (#29)
                        }
                    }
                });
            });
        }
    });
}

exports.formatDate = function (date) {
    // starts at 00.00 of airDate
    return new Date(date + " 00:00:00");
}

var updateNextRunDate = function (job, newDate) {
    job.nextRunAt = newDate;
    job.save(function (err) {
        if (!err)
            console.log("Job %s nextRunAt successfully edited to %s", job.attrs.name, this.formatDate(newDate));
    });
}



exports.setConnectionString = setConnectionString;
exports.scheduleFunctionGivenTime = scheduleFunctionGivenTime;
exports.scheduleFunctionInterval = scheduleFunctionInterval;
exports.updateNextRunDate = updateNextRunDate;
