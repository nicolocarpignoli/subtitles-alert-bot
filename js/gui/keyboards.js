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


