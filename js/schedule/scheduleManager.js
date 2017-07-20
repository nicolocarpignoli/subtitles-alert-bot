Agenda = require('agenda');
var Mongo = require('../db/mongo.js');
var Addic7ed = require('../libs/addic7ed.js');
var Conf = require('../conf.js');

// var intervalSchedule = '*/10 * * * *'; //every 10 minutes
var intervalSchedule = '1 minutes'; //every 10 seconds
var connectionString;
var usable = false;

//TODO rifattorizzare per bene sto passaggio di bot: main->mongo->scheduleManager->addic7ed

exports.activateStoredSchedules = function (alert, bot) {
    if(Conf.mongoHost == "raspi") setConnectionString('mongodb://127.0.0.1:');
    else setConnectionString('mongodb://127.0.0.1:' + Conf.mongoConfig.localPort + '/' + Conf.dbName);
    scheduleFunctionGivenTime(alert.show_name + '_' + alert.language + '_giventime', alert.nextepisode_airdate, function (jobDate, doneJobDate) {
        scheduleFunctionInterval(alert.show_name + '_' + alert.language + '_interval', intervalSchedule, function (jobInterval, doneJobInterval) {
            jobInterval.attrs.data.count--;
            Addic7ed.addic7edGetSubtitleAlert(alert, jobInterval.attrs.name, bot);
            doneJobInterval();
        });
        doneJobDate();
    });
}

var setConnectionString = function (connectionStringP, maxConcurrency) {
    connectionString = connectionStringP;
}

var scheduleFunctionGivenTime = function (jobName, date, func, data) {
    var agenda = new Agenda({ db: { address: connectionString } });
    data = (typeof data !== 'undefined') ? data : {};
    agenda.define(jobName, function (job, done) {
        func(job, done);
    });
    agenda.on("ready", function () {
        // agenda.schedule(new Date(date), jobName, data);
        agenda.schedule(new Date(Date.now() + 5000), jobName, data);
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
    var agendaP = new Agenda({ db: { address: connectionString } });
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
        if (job.attrs.data.count === 0) {
            agendaP.cancel({ name: job.attrs.name }, function (err, numRemoved) { });
        }
    });
}

var cancelJob = function (jobName) {
    var agenda = new Agenda({ db: { address: connectionString } });
    agenda.cancel({ name: jobName }, function (err, numRemoved) {
        console.log("%s jobs removed named %s", numRemoved, jobName);
    });
}


exports.setConnectionString = setConnectionString;
exports.scheduleFunctionGivenTime = scheduleFunctionGivenTime;
exports.scheduleFunctionInterval = scheduleFunctionInterval;
exports.cancelJob = cancelJob;