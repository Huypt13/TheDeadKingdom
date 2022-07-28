const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const HistorySchema = new Schema({
  teamWin: { type: Number, require: true },
  team1Kill: { type: Number, require: true },
  team2Kill: { type: Number, require: true },
  members: [
    {
      userId: String,
      team: Number,
      isWin: Boolean,
      kill: Number,
      dead: Number,
    },
  ],
  time: Date,
});

module.exports = mongoose.model("History", HistorySchema);