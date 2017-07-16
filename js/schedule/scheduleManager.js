Agenda = require('agenda');
var Mongo = require('../db/mongo.js');
var intervalSchedule = '*/10 * * * * * ';
var Addic7ed = require('../libs/addic7ed.js');


var connectionString;
var usable = false;


exports.activateStoredSchedules = function(alert){
    // setConnectionString('mongodb://localhost');
    // scheduleFunctionGivenTime(alert.show_name + '_' + alert.language + '_giventime', alert.nextepisode_airdate, function (jobDate, doneJobDate) {
    //     scheduleFunctionInterval(alert.show_name + '_' + alert.language + '_interval', intervalSchedule, function (jobInterval, doneJobInterval) {
    //         doneJobInterval.attrs.data.count = doneJobInterval.attrs.data.count - 1
    //         Addic7ed.addic7edGetSubtitleAlert(alert._id, alert.show_name, alert.language, alert.season, alert.number);
    //         doneJobInterval();
    //     });
    //     doneJobDate();
    // });
}

var setConnectionString = function (connectionStringP, maxConcurrency) {
    connectionString = connectionStringP;
}

var scheduleFunctionGivenTime = function (jobName, date, func, data) {
    var agenda = new Agenda({ db: { address: connectionString } });
    data = (typeof data !== 'undefined') ? data : {};
    agenda.define(jobName, function (job, done) {
        func(job, done)
    });
    agenda.on("ready", function () {
        agenda.schedule(date, jobName, data);
        agenda.start()
    })
    agenda.on('complete', function (job) {
        console.log('Job %s finished', job.attrs.name);
        agenda.cancel({ name: job.attrs.name }, function (err, numRemoved) { });
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
        agendaP.start()
    })
    agendaP.on('complete', function (job) {
        console.log('Job %s finished', job.attrs.name);
        if (job.attrs.data.count === 0) {
            agendaP.cancel({ name: job.attrs.name }, function (err, numRemoved) { });
        }
    });
}

var cancelJob = function (jobName) {
    var agenda = new Agenda({ db: { address: connectionString } });
    agenda.cancel({ name: jobName }, function (err, numRemoved) { });
}


exports.setConnectionString = setConnectionString;
exports.scheduleFunctionGivenTime = scheduleFunctionGivenTime;
exports.scheduleFunctionInterval = scheduleFunctionInterval;
exports.cancelJob = cancelJob;