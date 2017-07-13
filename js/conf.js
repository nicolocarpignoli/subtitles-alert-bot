exports.mongoConfig = {
        username: 'pi',
        host: '2.234.125.63',
        agent: process.env.SSH_AUTH_SOCK,
        port: 22,
        dstHost: 'mongodb://localhost/subtitlesAlertBot',
        dstPort: 27017,
        localHost: '127.0.0.1',
        password: 'mango932cortisone',
        localPort: 6666
};
