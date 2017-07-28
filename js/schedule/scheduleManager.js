Agenda = require('agenda');
var Mongo = require('../db/mongo.js');
var Addic7ed = require('../libs/addic7ed.js');
var Conf = require('../conf.js');

var intervalSchedule = '*/15 * * * *'; //every 15 minutes
//var intervalSchedule = '10 seconds'; //test
var connectionString;
var usable = false;
var agenda = null;


exports.activateStoredSchedules = function (alert, bot) {
    scheduleFunctionGivenTime(alert.show_name + '_' + alert.language + '_giventime', alert.nextepisode_airdate,function (jobDate, doneJobDate) {
        scheduleFunctionInterval(alert.show_name + '_' + alert.language + '_interval', intervalSchedule, 
            function (jobInterval, doneJobInterval) {Addic7ed.addic7edGetSubtitleAlert(alert, jobInterval, bot,doneJobInterval);
        }, {hasToBeRemoved:false});
        doneJobDate();
    });
}

var setConnectionString = function (connectionStringP, maxConcurrency) {
    connectionString = connectionStringP;
}

var scheduleFunctionGivenTime = function (jobName, date, func, data) {
    var agenda = new Agenda({ mongo: Mongo.getMongoConnection() });
    agenda.jobs({name: jobName}, function(err, jobs) {
        if(jobs == undefined  || jobs.length == 0){
            data = (typeof data !== 'undefined') ? data : {};
            agenda.define(jobName, function (job, done) {
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
    });

}

var scheduleFunctionInterval = function (jobName, interval, func, data) {
    var agenda = new Agenda({ mongo: Mongo.getMongoConnection() });
    data = (typeof data !== 'undefined') ? data : {};
    agenda.define(jobName, function (job1, done2) {
        func(job1, done2);
    });
    agenda.on("ready", function () {
        agenda.every(interval, jobName, data);
        agenda.start();
    });
    agenda.on('complete', function (job) {
        console.log('Job %s finished', job.attrs.name);
        console.log(job.attrs.data.hasToBeRemoved);
        if (job.attrs.data.hasToBeRemoved) {   
            agenda.cancel({ name: job.attrs.name }, function (err, numRemoved) {
                console.log("Removed %s jobs with name %s", numRemoved, job.attrs.name);
            });
        }
    });
}

var formatDate = function (date) {
    // starts at 00.00 of airDate
    return new Date(date + " 00:00:00");
}

var updateNextRunDate = function (job, newDate) {
    job.nextRunAt = newDate;
    job.save(function (err) {
        if (!err)
            console.log("Job %s nextRunAt successfully edited to %s", job.attrs.name, formatDate(newDate));
    });
}



exports.setConnectionString = setConnectionString;
exports.scheduleFunctionGivenTime = scheduleFunctionGivenTime;
exports.scheduleFunctionInterval = scheduleFunctionInterval;
exports.updateNextRunDate = updateNextRunDate;
