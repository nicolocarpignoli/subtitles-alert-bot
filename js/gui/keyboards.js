
exports.generateKeyboardOptions = function () {
    return  {
        "parse_mode": "Markdown",
        "reply_markup": {
            "keyboard": [
            [{ text: "Get \uD83D\uDCE5"}],
            [{text: "Start Alert \uD83D\uDCE2"},{ text: "Stop Alert \uD83D\uDEAB" }, {text: "Show Alerts \uD83D\uDCC5"}],
        
            ],
            "resize_keyboard": true
        }
    };
}


