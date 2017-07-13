
function Alert() {
    this.id = undefined;
    this.show_name = undefined;
    this.show_id = undefined;
    this.language = new Language();
    this.nextepisode_airdate = undefined;
    this.nextepisode_season = undefined;
    this.nextepisode_episode = undefined
}

function Language() {
    this.code = undefined;
    this.int = undefined;
    this.native = undefined
}

module.exports = Alert;
module.exports = Language