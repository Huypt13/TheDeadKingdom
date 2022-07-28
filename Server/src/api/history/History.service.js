const History = require("./History.schema");

class HistoryService {
  async insertMatchHistory({ teamWin, team1Kill, team2Kill, members, time }) {
    try {
      return await new History({
        teamWin,
        team1Kill,
        team2Kill,
        members,
        time,
      }).save();
    } catch (error) {
      throw new Error("Can not insert match history");
    }
  }
  async getUserHistory() {}
}

module.exports = new HistoryService();
