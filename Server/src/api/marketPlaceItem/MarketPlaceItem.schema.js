const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
const marketPlaceItemShema = new mongoose.Schema({
    marketItemId: { type: String, require: true },
    tokenId: { type: String, require: true },
    price: { type: Number, min: 1 },
    seller: { type: String },
    buyer: { type: String },
    nftContract: { type: String },
    isSelling: { type: Boolean, require: true },
    createdAt: { type: Date, default: new Date() },
    finishedAt: { type: Date, default: new Date() },
})

module.exports = mongoose.model("MarketPlaceItem", marketPlaceItemShema);