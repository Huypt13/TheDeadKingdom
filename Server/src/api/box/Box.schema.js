const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BoxSchema = new Schema({
  price: { type: Number },
  image: { type: String },
  name: { type: String },
  rate: [
    {
      tankId: { type: String },
      ratio: { type: Number },
    },
  ],
});

module.exports = mongoose.models.Box || mongoose.model("Box", BoxSchema);
