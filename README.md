[![Logo](http://nicolocarpignoli.com/wp-content/uploads/2017/10/21557944_123740551614347_8743418650599523919_n-e1507316918840.png
)](http://nicolocarpignoli.com)

A Telegram bot for download and subscribe to tv show subtitles.


Subtitles Alert Bot is a Telegram Bot that let you download and subscribe to subtitles of your favourite tv shows. You can download subtitles for a specific episode or a set of subtitles, and manage your subscriptions. A subscription is referred to a specific tv show for one or more languages: once you have subscribed you will get your subtitles on your phone (also a direct link for others subtitles for all episode versions) without doing anything.

For its purpose we recommend to use the bot with [Telegram Desktop Client](https://desktop.telegram.org) or [Telegram Web](https://web.telegram.org/).

More about Telegram Bots: https://core.telegram.org/bots


### Features

With Subtitles Alert Bot you can:

:inbox_tray: Download subtitles (for a specific episode or a set of episode). You will get the ".srt" file and a link to other subtitles for every episode release available.

:speaker: Subscribe to subtitles. You can subscribe to a specific tv show for one or more subtitles' languages. Just relax and as soon as your subtitles are out you will receive them.

:calendar: Show your active subscriptions.

:no_entry_sign: Unsubscribe from tv shows.

Other minor functionalities such as: :it: changing bot language (Italian and English available for now), :moneybag: Donate and :sos: show the Help message.



### Screenshots

![Logo](http://nicolocarpignoli.com/wp-content/uploads/2017/10/Schermata-2017-10-08-alle-23.12.42.png
)


### Technology

Based on `Node.js` our bot uses several open-source libraries listed here. Our source of subtitles is www.addic7ed.com and http://www.tvmaze.com/api is the endpoint for retrieve updated informations about tv shows.

Thanks to:
- https://github.com/yagop/node-telegram-bot-api
- https://github.com/agenda/agenda
- https://github.com/same31/addic7ed-api
- http://mongoosejs.com
- https://github.com/request/request-promise

If you want to run a version of this bot a nice and suggested cheap server is a RaspberryPi. We use it and it works like charm. Feel free to ask us for help on setting up.


### How can I contribute?

In the [Issue](https://github.com/nicolocarpignoli/subtitles-alert-bot/issues) section of this repository we constantly add bugs to fix or new features to develop. You can fork this repository and start develop as a contributor.

#### Setting up

- To run a local version of Subtitles Alert Bot you have first to [obtain a token](https://core.telegram.org/bots#3-how-do-i-create-a-bot) from Telegram
- Set the `telegramBotToken` variable in `js/main.js` to the new token
- We used `MongoDB`as database. You first have to [install it and run it](https://docs.mongodb.com/manual/installation/)
- Configure your MongoDB local connection in `js/conf.js` (on `dbName` set your database name - `subtitlesAlertBot` as default).
- Run the bot instance:  `sudo node main.js`
- You're free to use any Telegram client you like and search for your bot instance name. Start the conversation sending `/start` to the bot chat.

#### Database

As database we used MongoDB. In `js/db/mongo.js` you can find our model. For full compatibility with existing code, please use the same data model.


### Issue tracker and new features to develop

https://github.com/nicolocarpignoli/subtitles-alert-bot/issues


#### Public roadmap

Public roadmap for Subtitles Alert Bot can be found [here](https://trello.com/b/RUv5boOe). It's always up-to-date with last release.


### Feel free to donate  

Our project is totally free and open-source. If you want to donate we will be very grateful and it will contribute to our project to mantain an always running version of Subtitles Alert Bot (you can found the official/first version of the bot as @SubtitlesAlertBot on Telegram) 

[![Logo](https://www.paypal.com/en_US/i/btn/btn_donate_LG.gif)](http://nicolocarpignoli.com/?p=455)

### About the authors

- [![Logo](https://static.licdn.com/sc/h/9wcfzhuisnwhyauwp7t9xixy7)](https://www.linkedin.com/in/nicolò-carpignoli/) [![Logo](https://assets-cdn.github.com/favicon.ico)](https://github.com/nicolocarpignoli) [Nicolò Carpignoli](http://nicolocarpignoli.com) 

- [![Logo](https://static.licdn.com/sc/h/9wcfzhuisnwhyauwp7t9xixy7)](https://www.linkedin.com/in/dario-sacco-2530bbb0/) Dario Sacco 

- Alberto Modigliani 

Logo is courtesy of [Mariusz Nawrocki](http://facebook.com/mvnieq)


### License

This project is released under MIT license as you can check in LICENSE.md file.

