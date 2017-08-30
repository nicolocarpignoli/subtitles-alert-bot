var Common = require('./../common.js');

exports.generateKeyboardOptions = function () {
    return  {
        "parse_mode": "Markdown",
        "reply_markup": {
            "keyboard": [
            [{ text: Common.getCommand}, {text: Common.startAlertCommand},{ text:Common.stopAlertCommand}],
            [{text: Common.languageCommand},{text: Common.helpCommand },{text: Common.donateCommand }],
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

exports.generatesLanguageInlineKeyboard = function (options){
    let inlineOptions = [
        [
        {
            text: "Done", 
            callback_data: Common.doneLanguageCallback
        }]
    ];
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
            callback_data: Common.confirmCallback
        },
        {
            text: "No", 
            callback_data: Common.revertCallback            
        }]
    ];
    return {
        "parse_mode": "Markdown",
        "reply_markup": {
            "inline_keyboard": inlineOptions
        }
    };
};