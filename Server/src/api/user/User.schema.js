const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: { type: String, require: true },
  password: { type: String, require: true },
  numOfStars: { type: Number, require: true },
  walletAdress: { type: String },
  balances: Number,
});

module.exports = mongoose.model("User", UserSchema);
