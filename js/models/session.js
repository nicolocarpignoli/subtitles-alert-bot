
function Session() {
    //get
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
    //startalert
    this.choosingSeriesAlert = false,
    this.choosingLanguageAlert = false,
    this.choosenSeriesAlert = {},
    this.ambiguousSeriesAlert = {}
    this.chosenLanguagesAlert = []
}

module.exports = Session;
