Agenda = require('agenda');

var connectionString;
var usable = false;
exports.setConnectionString = function (connectionStringP, maxConcurrency) {
    connectionString = connectionStringP;
}

exports.scheduleFunctionGivenTime = function (jobName, date, func, data) {
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

exports.scheduleFunctionInterval = function (jobName, interval, func, data) {
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

exports.cancellJob = function (jobName) {
    var agenda = new Agenda({ db: { address: connectionString } });
    agenda.cancel({ name: jobName }, function (err, numRemoved) { });
}