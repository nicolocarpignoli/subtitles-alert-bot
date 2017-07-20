var Env = require('./env.js');

exports.mongoConfig = {
        username: 'pi',
        host: '2.234.125.63',
        agent: process.env.SSH_AUTH_SOCK,
        port: 22,
        dstPort: 6666,
        password: 'mango932cortisone',
        localPort: 27017
};

exports.dbName = 'subtitlesAlertBot';

exports.mongoHost = Env.envType;