var TelegramBot = require('node-telegram-bot-api');
var addic7edApi = require('addic7ed-api');
var BotGui = require('./gui/keyboards.js');
var http = require('http');
var telegramBotToken = '398340624:AAH3rtCzaX9Y2fDU0ssRrK4vhRVh1PpZA0w';

var instructionsMessage = "Welcome, my tv-addicted friend! What you want me to do today?"
var whichSeriesMessage = "Ok great! Which series do you want?";
var whichSeasonMessage = "Ok! Which season?"
var whichEpisodeMessage = "Ok! Which episode?";

// Setup polling way
var bot = new TelegramBot(telegramBotToken, {polling: true});

console.log("Starting bot..");

bot.onText(/\/start/, (msg, match) => {
    bot.sendMessage(msg.chat.id, instructionsMessage, BotGui.generalMenuOptions)
    //TODO Handle callback message
});

// bot.onText(/\get\s(.*)/, (msg, match) => {
//     bot.sendMessage(msg.chat.id, whichSeriesMessage)
//     //TODO 
// })
