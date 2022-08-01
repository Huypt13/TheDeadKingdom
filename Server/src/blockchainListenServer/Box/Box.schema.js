const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BoxSchema = new Schema({
    boxId: { type: Number, require: true },
    mintedAddress: { type: String, require: true },
    boughtAt: { type: Date, require: true, default: Date.now },
    openedAt: { type: String, require: false },
});

module.exports = mongoose.model("Box", BoxSchema);
