var TelegramBot = require('node-telegram-bot-api');
var addic7edApi = require('addic7ed-api');

var token = '398340624:AAH3rtCzaX9Y2fDU0ssRrK4vhRVh1PpZA0w';
// Setup polling way
var bot = new TelegramBot(token, {polling: true});

// Matches /echo [whatever]
bot.onText(/\/sticazzi (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  addic7edApi.search('South Park', 19, 6).then(function (subtitlesList) {
    var subInfo = subtitlesList[0];
    resp = subInfo;
});
  bot.sendMessage(fromId, "camafari");
  bot.sendMessage(fromId, resp);

});

// Any kind of message
bot.on('message', function (msg) {
  var chatId = msg.chat.id;
  // photo can be: a file path, a stream or a Telegram file_id
  var photo = 'cats.png';
  bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});
});