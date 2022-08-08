const mongoose = require("mongoose");
const schema = mongoose.Schema;
const tankUserSchema = new schema({
    userId: { type: String, require: true},
    tankId: { type: String, require: true},
    remaining: { type: Number},
    nftId: { type: Number, require: true},
    openDate: { type: Date, Default: new Date()},
    buyDate: { type: Date, Default: new Date()}
})

module.exports = mongoose.Model("tankusers", tankUserSchema);