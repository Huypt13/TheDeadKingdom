const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: { type: String, required: true },
  username: { type: String, require: true },
  password: { type: String, require: true },
  numOfStars: { type: Number, require: true, default: 1 },
  walletAdress: { type: String },
  balances: Number,
  active: { type: Boolean, default: false },
  activeCode: String,
});

module.exports = mongoose.model("User", UserSchema);
