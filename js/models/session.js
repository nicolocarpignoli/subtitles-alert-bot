
function Session() {
    this.firstName = "";
    this.chatId = "",
    this.choosingSeries = false,
    this.choosingSeason = false,
    this.choosingEpisode = false,
    this.choosingLanguage = false,
    this.choosenSeries = {},
    this.choosenSeason,
    this.choosenEpisode,
    this.ambiguousSeries = {}
}

module.exports = Session;
