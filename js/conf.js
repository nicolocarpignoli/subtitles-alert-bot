var Env = require('./env.js');

exports.mongoConfig = {
        username: '',
        host: '',
        agent: process.env.SSH_AUTH_SOCK,
        port: 22,
        dstPort: 6666,
        password: '',
        localPort: 27017
};

exports.dbName = 'subtitlesAlertBot';

exports.mongoHost = Env.envType;

exports.logFile = './log.json';
