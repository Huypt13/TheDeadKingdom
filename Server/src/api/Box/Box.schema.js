const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BoxSchema = new Schema({
    price: { type: Number},
    image: { type: String, require: true },
    rate: [{
        tankId: { type:  String},
        ratio : {type: Number}
    }],
});

module.exports = mongoose.model("Box", BoxSchema);