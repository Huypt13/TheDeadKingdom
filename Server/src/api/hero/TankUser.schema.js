const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TankUserSchema = new Schema({
  userId: { type: String, require: true },
  tankId: { type: String, require: true },
  remaining: { type: Number, require: true },
});

module.exports = mongoose.model("TankUser", TankUserSchema);
