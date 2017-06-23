exports.instructionsMessage = "Welcome, my tv-addicted friend! What you want me to do today?"
exports.whichSeriesMessage = "Ok great! Which series do you want?";
exports.whichSeasonMessage = "Ok! Which season?"
exports.whichEpisodeMessage = "Ok! Which episode?";

exports.getCommand = "Get \uD83D\uDCE5";
exports.startAlertCommand = "Start Alert \uD83D\uDCE2";
exports.stopAlertCommand = "Stop Alert \uD83D\uDEAB";
exports.showAlertsCommand = "Show Alerts \uD83D\uDCC5";

exports.GETregExp = new RegExp(this.getCommand);
exports.STARTregExp = new RegExp(this.startAlertCommand);
exports.STOPregExp = new RegExp(this.stopAlertCommand);
exports.SHOWregExp = new RegExp(this.showAlertsCommand);

exports.notACommand = function (userInput) {
    return userInput != this.getCommand &&
        userInput != this.startAlertCommand &&
        userInput != this.stopAlertCommand &&
        userInput != this.showAlertsCommand;
}