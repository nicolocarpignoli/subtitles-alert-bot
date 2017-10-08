var Env = require('./env.js');

exports.mongoConfig = {
        username: '',
        host: '',
        agent: process.env.SSH_AUTH_SOCK,
        port: '',
        dstPort: '',
        password: '',
        localPort: ''
};

exports.dbName = 'subtitlesAlertBot';

exports.mongoHost = Env.envType;

exports.logFile = './log.json';
