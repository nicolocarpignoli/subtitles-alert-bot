var Common = require('./../common.js');

exports.generateKeyboardOptions = function () {
    return  {
        "parse_mode": "Markdown",
        "reply_markup": {
            "keyboard": [
            [{ text: Common.getCommand}],
            [{text: Common.startAlertCommand},{ text:Common.stopAlertCommand}, 
            {text: Common.showAlertsCommand}],
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
        [{
            text: "Add Language", 
            callback_data: "addLanguageCallback"
        },
        {
            text: "Done", 
            callback_data: "doneLanguageCallback"
        }]
    ];
    return {
        "parse_mode": "Markdown",
        "reply_markup": {
            "inline_keyboard": inlineOptions
        }
    };
};

