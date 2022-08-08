const mongoose = require("mongoose");
const schema = mongoose.Schema;
const marketPlaceItemShema = new schema({
    marketPlaceItemId: { type: String, require: true },
    tokenId: { type: String, require: true },
    tankUserId : { type: String, require: true},
    price: { type: Number, min: 1 },
    seller: { type: String },
    buyer: { type: String },
    nftContract: { type: String },
    isSelling: { type: Boolean, require: true },
    createAt: { type: Date, default: new Date() },
    buyAt: { type: Date, default: new Date() },
    finishAt: { type: Date, default: new Date() },
})

module.exports = mongoose.Model("marketplaceitems", marketPlaceItemShema);