Agenda = require('agenda');
var Mongo = require('../db/mongo.js');
var Addic7ed = require('../libs/addic7ed.js');
var Conf = require('../conf.js');

var intervalSchedule = '*/15 * * * *'; //every 15 minutes
// var intervalSchedule = '1 minutes'; //test
var connectionString;
var usable = false;
var agenda = null;

//TODO rifattorizzare per bene sto passaggio di bot: main->mongo->scheduleManager->addic7ed

exports.activateStoredSchedules = function (alert, bot) {
    if (Conf.mongoHost == "raspi") setConnectionString('mongodb://127.0.0.1:');
    else setConnectionString('mongodb://127.0.0.1:' + Conf.mongoConfig.localPort + '/' + Conf.dbName);
    scheduleFunctionGivenTime(alert.show_name + '_' + alert.language + '_giventime', alert.nextepisode_airdate, function (jobDate, doneJobDate) {
        scheduleFunctionInterval(alert.show_name + '_' + alert.language + '_interval', intervalSchedule, function (jobInterval, doneJobInterval) {
            Addic7ed.addic7edGetSubtitleAlert(alert, jobInterval, bot);   
            doneJobInterval();
        });
        doneJobDate();
    });
}

var setConnectionString = function (connectionStringP, maxConcurrency) {
    connectionString = connectionStringP;
}

var scheduleFunctionGivenTime = function (jobName, date, func, data) {
    if(agenda == null) agenda = new Agenda({ db: { address: connectionString } });
    data = (typeof data !== 'undefined') ? data : {};
    agenda.define(jobName, function (job, done) {
        func(job, done);
    });
    agenda.on("ready", function () {
        agenda.schedule(formatDate(date), jobName, data);
        // agenda.schedule(new Date(Date.now() + 5000), jobName, data); //test
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

var scheduleFunctionInterval = function (jobName, interval, func, data) {
    if(agenda == null) agendaP = new Agenda({ db: { address: connectionString } });
    data = (typeof data !== 'undefined') ? data : {};
    agendaP.define(jobName, function (job1, done2) {
        func(job1, done2);
    });
    agendaP.on("ready", function () {
        agendaP.every(interval, jobName, data);
        agendaP.start();
    });
    agendaP.on('complete', function (job) {
        console.log('Job %s finished', job.attrs.name);
        //if (job.attrs.data.count === 0) { //TODO a che serve? Se ha un senso rimettilo pure
        // agendaP.cancel({ name: job.attrs.name }, function (err, numRemoved) {
        //     console.log("Removed %s jobs with name %s", numRemoved, job.attrs.name);
        // });
        // }
    });
}

var formatDate = function(date){
    var tokens = date.split("-");
    // starts at 00.00 of airDate 
    return new Date(tokens[0], tokens[1], tokens[2], "00", "00", "00");
}

var updateNextRunDate = function (job, newDate) {
    job.nextRunAt = newDate;
    job.save(function (err) {
        if (!err)
            console.log("Job %s nextRunAt successfully edited to %s", job.attrs.name, formatDate(newDate));
    });
}

var cancelJob = function (jobName) {
    agenda.cancel({ name: jobName }, function (err, numRemoved) {
        console.log("%s jobs removed named %s", numRemoved, jobName);
    });
}


exports.setConnectionString = setConnectionString;
exports.scheduleFunctionGivenTime = scheduleFunctionGivenTime;
exports.scheduleFunctionInterval = scheduleFunctionInterval;
exports.updateNextRunDate = updateNextRunDate;
exports.cancelJob = cancelJob;