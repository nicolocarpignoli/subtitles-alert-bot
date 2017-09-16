var Common = require('./../common.js');
var Translate = require('../translations.js');

exports.generateKeyboardOptions = function (language) {
    return  {
        "parse_mode": "Markdown",
        "reply_markup": {
            "keyboard": [
            [{ text: Translate.getCommand[language]}, {text: Translate.startAlertCommand[language]}],
            [{text: Translate.showCommand[language]},{ text:Translate.stopAlertCommand[language]}],
            [{text: Translate.languageCommand[language]},{text: Translate.helpCommand[language] },{text: Translate.donateCommand[language] }],
            ],
            "resize_keyboard": true
        }
    };
}

exports.generateSeriesInlineKeyboard = function (options){
    let inlineOptions = [];
    options.forEach(function(element) {
        inlineOptions.push([
                {
                    text: element.show.name, 
                    callback_data: element.show.name
                }
            ]);
    }, this);
    return {
        "parse_mode": "Markdown",
        "reply_markup": {
            "inline_keyboard": inlineOptions
        }
    };
};

exports.generateAlertsInlineKeyboard = function (alerts){
    let inlineOptions = [];
    alerts.forEach(function(element) {
        if(element != null){
            inlineOptions.push([
                    {
                        text: element.show_name + " [" + element.language + "] S" + element.nextepisode_season + "E" + element.nextepisode_episode + " (" + element.nextepisode_airdate + ")",
                        callback_data: element.show_name + "_" + element.language 
                    }
                ]);
        }
    }, this);
    return {
        "parse_mode": "Markdown",
        "reply_markup": {
            "inline_keyboard": inlineOptions
        }
    };
};

exports.generatesConfirmInlineKeyboard = function (){
    let inlineOptions = [
        [
        {
            text: "Yes", 
            callback_data: Translate.confirmCallback
        },
        {
            text: "No", 
            callback_data: Translate.revertCallback            
        }]
    ];
    return {
        "parse_mode": "Markdown",
        "reply_markup": {
            "inline_keyboard": inlineOptions
        }
    };
};