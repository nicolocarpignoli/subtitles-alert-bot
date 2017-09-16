var Languages = require('./models/languages.js'); 
var Mongo = require('./db/mongo.js');

exports.instructionsMessage = { "English": "Welcome, my tv-addicted friend! What do you want me to do today?", "Italiano": "Benvenuto! Cosa posso fare oggi per te?"}
exports.whichSeriesMessage = { "English": function (firstName) { return "Ok " + firstName + "! Which show do you want me to search for?"}, "Italiano": function (firstName) { return "Ok " + firstName + "! Quale serie vuoi che cerchi?"; }}
exports.whichSeasonMessage = { "English": function (series) { return "Good, you choose " + series + "! Which season do you desire?"}, "Italiano": function (series) { return "Ottimo, hai scelto " + series + "! Quale stagione?"; }}
exports.whichAmbigousSeasonMessage = { "English": function (series) { return "Great choice! Which season of " + series + " do you desire?"}, "Italiano": function (series) { return "Ottima scelta! Quale stagione di " + series + " desideri?" }}
exports.whichEpisodeMessage = { "English": "Great! Which episode?", "Italiano": "Ottimo! Quale episodio?"}
exports.whichLanguageMessage = { "English": "Great! Which language do I have to search for?", "Italiano": "In quale lingua vorresti i tuoi sottotitoli?"}
exports.runningState = 'Running';
exports.successSubscribeMessage = { "English": function (series) { return  "You are now subscribed to " + series + "! When the subtitles for the next episode of your show will be out, I'll send them to you immediately!"}, 
    "Italiano": function (series) { return  "Ti sei sottoscritto a " + series + "! Quando i nuovi sottotitoli saranno pronti te li invierò immediatamente!"}}
exports.newEpisodeAlertMessage = { "English": function (firstName, showName) { return  "Hey " + firstName + ", subtitles for the last episode of " + showName + " are out! Check these out!"}, 
    "Italiano": function (firstName, showName) { return  "Hey " + firstName + ", i sottotitoli per il nuovo episodio di " + showName + " sono pronti! Eccoli qua!"}}
exports.showAlertsMessage = { "English": "This list shows your active subscriptions right now:", "Italiano": "Questa è la lista delle tue attuali sottoscrizioni:"}
exports.confirmCallback = { "English": "yes", "Italiano": "sì"}
exports.revertCallback = { "English": "no", "Italiano": "no"}
//TODO questo messaggio di noNextEpisodeYetMessage andrà tolto quando avremo fatto la feature #29 su trello
exports.noNextEpisodeYetMessage = { "English": "Hey, it seems that this season it's over or maybe not and I cannot see the future for this show yet!", 
    "Italiano": "Hey, sembra che la stagione sia conclusa...oppure no! In tal caso, purtroppo non posso indovinare che ne sarà di questa serie!"}
exports.noAlertMessage = { "English": "It seems you have no active subscriptions right now... Try to add some!", "Italiano": "Sembra che tu non abbia sottoscrizioni attive al momento... Prova ad aggiungerne una!"}
exports.jobAlreadyExistMessage =  { "English": "Hey, it seems you are already subscribed to one or more of these shows! Check your subscriptions with Show subscriptions \uD83D\uDDD3", 
    "Italiano": "Hey, sembra che tu sia già sottoscritto a questa serie! Controlla le tue attuali sottoscrizioni tramite Mostra sottoscrizioni \uD83D\uDDD3"}

exports.whichSeriesAlertMessage = { "English": function (firstName) { return "Ok " + firstName + "! Which show do you want to subscribe to?" }, 
    "Italiano": function (firstName) { return "Ok " + firstName + "! A quale serie vuoi sottoscriverti?"}}
exports.seriesNotRunningMessage = { "English": function (series) { return "Hey dude I really think " + series + " is ended! If you want to get subtitles of it please try the 'Get subtitles \uD83D\uDCE5' functionality or try another show!"}, 
    "Italiano": function (series){ return "Hey amico credo che " + series + " sia conclusa! Se vuoi questi sottotitoli prova la funzione 'Download subs \uD83D\uDCE5' oppure prova a sottoscriverti ad una serie in corso!" } }
exports.whichLanguagesAlertMessage = { "English": function (series){ return "Ok you choose " + series + "! Please send me a language for your subtitles or type 'ok' if you have done!"} , 
    "Italiano": function (series){ return "Ok hai scelto " + series + "! Scegli uno o più lingue per i sottotitoli e inviami 'ok' per concludere!" }}
exports.languageAlreadyPresentMessage = { "English": "It seems you have already inserted this language, dude! Try with another one!", "Italiano": "Sembra tu abbia già scelto questa lingua, prova con un'altra!"}

exports.buildLinkMessage = { "English": function (link) { return 'There it is! If you want more subtitles of this episode please visit: www.addic7ed.com' + link}, 
    "Italiano": function (link) { return 'Ecco qua! Se vuoi altri sottotitoli per questo episodio visita www.addic7ed.com' + link}}
exports.failedSeriesMessage = { "English": "Sorry, no shows found with that name \u2639\uFE0F Please try with another great tv-show title", "Italiano": "Mi spiace, non conosco serie con questo nome \u2639\uFE0F Per favore riprova!"}
exports.ambiguousSeriesMessage = { "English": "Mmh ambiguous! \uD83E\uDD14 Which of these? (If none of these is the show you are looking for, try again with a more precise name)", "Italiano": "Mmh ambiguo! \uD83E\uDD14 Quale di queste? (Se ciò che cerchi non è nell'elenco, prova con un nome più preciso)"}
exports.notANumberMessage = { "English": "This doesn't seem to be a valid number, dude... retry!", "Italiano": "Questo non mi sembra un numero valido...riprova amico!"}
exports.seasonNotFoundMessage = { "English": "Season not found or not out yet. Retry or restart 'Get subtitles \uD83D\uDCE5'!", "Italiano": "La stagione non è stata trovata o non è disponibile. Riprova o riparti con 'Download subs \uD83D\uDCE5'!" }
exports.episodeNotFoundMessage = { "English": "Episode doesn't exist or not found. Retry or restart 'Get subtitles \uD83D\uDCE5'!", "Italiano": "L'episodio non è stato trovato o non è disponibile. Riprova o riparti con 'Download subs \uD83D\uDCE5'!"}
exports.languageNotFoundMessage = { "English": "Sorry, language not found! Try typing your language as three-letter code, international form or native form!", "Italiano": "Mi spiace ma non ho trovato questa lingua! Prova a digitare la lingua come codice a tre lettere o in forma estesa!"}
exports.subtitleNotFoundInAddic7edMessage = { "English": "Oh noes! I can't find your subtitles in our magic system! I guess nobody has subbed this yet... try again with a different language or a new request!", "Italiano": "Mi spiace ma non ho trovato questa lingua! Prova a digitare la lingua come codice a tre lettere o in forma estesa!"}
exports.LoadingSubtitleMessage = { "English": "Great! I'm fetching for your subtitle now mate \uD83D\uDCE5", "Italiano": "Ottimo, sto cercando i tuoi sottotitoli, attendi un momento.. \uD83D\uDCE5"}
exports.ambigousSubtitleMessage = { "English": "Hey, watch out! Probably you chose a very ambiguous tv-show title and our system found the only match it had!", "Italiano": "Hey, attento! Potresti aver cercato una serie-tv con un titolo molto ambiguo e il nostro sistema ti ha inviato l'unico match che ha!"}
exports.chooseAtLeastALanguageMessage = { "English": "Hey, you have to choose at least one language for your subscription! Try again and send me a valid language!", "Italiano": "Hey, devi scegliere almeno una lingua! Riprova!"}
exports.subscribingToMessage = { "English": "Ok, I'm gonna subscribe you! Please wait a sec \u270F\uFE0F \uD83D\uDDD3", "Italiano": "Ok, ti sto sottoscrivendo! Un attimo di pazienza \u270F\uFE0F \uD83D\uDDD3" }
exports.addLanguageMessage = { "English": "Ok gotcha! Send me another language or type 'ok' to subscribe", "Italiano": "Ricevuto! Inserisci un'altra lingua o inviami 'ok' per sottoscriverti!"}
exports.nextEpisodeNotAvailableMessage = { "English": "Too early for a subscription for this show. I haven't got enough informations yet! Try again on the next weeks!", "Italiano": "Mi sembra troppo presto per sottoscriverti per questa serie! Non ho ancora abbastanza informazioni.. Riprova fra qualche settimana!"}
exports.seasonOverMessage = { "English": function(season, show) { return "Hey, season " + season + " of " + show + " is over! It's too early for a " +
    "subscription for the next season! Please use Get subtitles \uD83D\uDCE5 functionality for season " + season + " subtitles!"}, 
    "Italiano": function(season, show) { return "Hey, la stagione " + season + " di " + show + " è conclusa! E' troppo presto per " +
    "sottoscriverti alla nuova stagione! Usa Download sottotitoli \uD83D\uDCE5 per avere i sottotitoli della stagione " + season + "!"},}
exports.areYouSureRemoveAlert = { "English": function (series) {return "Are you sure you want to remove your alert for "+ series +"?"}, "Italiano": function (series) {return "Sei sicuro? Vuoi davvero rimuovere la sottoscrizione per "+ series +"?"}}
exports.notValidIntervalGetMessage = { "English": "Please retry with a valid interval in the form of 'first-last' without spaces or with the keyword 'all' for all subtitles of a specified season!", 
    "Italiano": "Per favore riprova con un intervallo valido nella forma 'primo-ultimo' episodio (senza spazi) oppure con la parola 'all' per avere tutte le puntate della stagione che hai scelto!"}
exports.deletedAlertMessage = { "English": "Subscription successfully deleted!", "Italiano": "Fatto, sottoscrizione eliminata!"}
exports.revertDeleteMessage = { "English": "Wise choice! I'll keep your subscription active", "Italiano": "Saggia scelta, manterrò le tue sottoscrizioni intatte!"}

exports.getCommand = { 
    "English" : "Get subtitles \uD83D\uDCE5", "Italiano":"Download subs \uD83D\uDCE5"}
exports.showCommand = { 
    "English" : "Show subscriptions \uD83D\uDDD3", "Italiano": "Mostra sottoscrizioni \uD83D\uDDD3"}
exports.startAlertCommand = { 
    "English" : "Subscribe \uD83D\uDCE2", "Italiano": "Sottoscrivi \uD83D\uDCE2"}
exports.stopAlertCommand = { 
    "English" : "Unsubscribe \uD83D\uDEAB", "Italiano": "Disiscrivi \uD83D\uDEAB"}
exports.languageCommand = { 
    "English" : "Language \uD83C\uDDEE\uD83C\uDDF9", "Italiano": "Lingua \uD83C\uDDEE\uD83C\uDDF9"}
exports.donateCommand = { 
    "English" : "Donate \uD83D\uDCB0", "Italiano": "Donazioni \uD83D\uDCB0"}
exports.helpCommand = { 
    "English" : "Help \uD83C\uDD98", "Italiano": "Help \uD83C\uDD98"}


exports.okDonelanguageCommand = 'ok';



exports.helpMessage = {
    "Italiano": "Subtitles Alert Bot è un bot per scaricare e sottoscriverti a sottotitoli per le tue serie-tv preferite.\n\nUsa Download subs \uD83D\uDCE5 per il download istantaneo di un singolo sottotitolo, oppure" +
        " scarica un insieme di sottotitoli definendo un intervallo nella forma 'numeroPrimoSottotitolo-numeroUltimoSottotitolo', senza spazi, oppure tutti i sottotitoli di una specifica stagione con la parola chiave 'all'" +
        "\n\nUsa Sottoscrivi \uD83D\uDCE2 per sottoscriverti ad una serie-tv. Rilassati e il bot ti invierà comodamente sul telefono i sottotitoli appena saranno pronti" +
        "\n\n Usa Mostra sottoscrizioni" +
        "\n\nUsa Disiscrivi \uD83D\uDEAB per l'elenco delle tue sottoscrizioni attive. Puoi anche eliminare quelle che non desideri più" +
        "\n\nDigita /help per rivedere questo messaggio ogni volta che vuoi." +
        "\n\nSeguici su: " +
        "\n\nInstagram https://www.instagram.com/subtitlesbottelegram/" +
        "\n\nFacebook https://www.facebook.com/subtitlesalertbot/",
    "English": "A bot for subscribe and download subtitles for your favourite tv shows.\n\nUse Get subtitles \uD83D\uDCE5 for instant download of a single subtitles file, or" +
        " download a set of subtitles choosing an interval with 'first-last' episode numbers without spaces or every subtitles of a specified season entering the keyword 'all'" +
        "\n\nUse Subscribe \uD83D\uDCE2 to start a subscription to subtitles for a tv show. Just relax and as soon as they're out you will receive your subtitles on your phone" +
        "\n\nUse Show subscriptions \uD83D\uDDD3 for the list of your active subscriptions" +
        "\n\nUse Unsubscribe \uD83D\uDEAB to delete the subscriptions." + 
        "\n\n You can also change bot Language \uD83C\uDDEE\uD83C\uDDF9 and  Donate \uD83D\uDCB0 us a beer." +
        "\n\nUse Help \uD83C\uDD98 for seeing this help message any time you want." +
        "\n\nFollow us on:" +
        "\n\nInstagram https://www.instagram.com/subtitlesbottelegram/" +
        "\n\nFacebook https://www.facebook.com/subtitlesalertbot/"
};

exports.SHOWregExp = new RegExp(this.showCommand)
exports.GETregExp = new RegExp(this.getCommand);
exports.STARTregExp = new RegExp(this.startAlertCommand);
exports.STOPregExp = new RegExp(this.stopAlertCommand);
exports.HELPRegExp = new RegExp(this.helpCommand);
exports.DONATERegExp = new RegExp(this.donateCommand);
exports.LANGUAGERegExp = new RegExp(this.languageCommand);