var TelegramBot = require('node-telegram-bot-api');
var addic7edApi = require('addic7ed-api');
var BotGui = require('./gui/keyboards.js');
var http = require('http');
var telegramBotToken = '398340624:AAH3rtCzaX9Y2fDU0ssRrK4vhRVh1PpZA0w';

var instructionsMessage = " Welcome, my tv-addicted friend! What you want me to do today?"

// Setup polling way
var bot = new TelegramBot(telegramBotToken, {polling: true});

console.log("Starting bot..");

bot.onText(/\/start/, (msg, match) => {
    bot.sendMessage(msg.chat.id, instructionsMessage, BotGui.generalMenuOptions)
});

bot.onText(/\/get\s(.*)/ , (msg, match) => {
    console.log(match[1]);
});
