
exports.generateKeyboardOptions = function () {
    return  {
        "parse_mode": "Markdown",
        "reply_markup": {
            "keyboard": [
            [{ text: "Get" }],
            [{text: "Start Alert"},{ text: "Stop Alert" }, {text: "Show Alerts"}]
            ]
        }
    };
}


