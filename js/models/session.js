
function Session() {
    this.chatId = "",
    this.choosingSeries = false,
    this.choosingSeason = false,
    this.choosingEpisode = false,
    this.choosingLanguage = false,
    this.choosenSeries = {},
    this.choosenSeason,
    this.choosenEpisode,
    this.ambiguousSeries = {},
    this.counterLanguage = 0
}

module.exports = Session;
