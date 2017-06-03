var TelegramBot = require('node-telegram-bot-api');
var addic7edApi = require('addic7ed-api');
var http = require('http');


var token = '398340624:AAH3rtCzaX9Y2fDU0ssRrK4vhRVh1PpZA0w';
// Setup polling way
var bot = new TelegramBot(token, {polling: true});

console.log("Starting..");

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  var resp = "asf;";

    addic7edApi.search('South Park', 19, 6).then(function (subtitlesList) {
        console.log(subtitlesList);
        var subInfo = subtitlesList[0];
        if (subInfo) {
            console.log(subInfo);
            addic7edApi.download(subInfo, './South.Park.S19E06.srt').then(function () {
                resp = subInfo;
            });
        }
    });
  bot.sendMessage(chatId, resp);
});
