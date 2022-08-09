const MarketPlaceItem = require('./MarketPlaceItem.shema')
const UserService = require('../user/User.service')
const TankUserService = require('../hero/TankUser.service')


class MarketPlaceItemService {

    async createAfterListed(marketPlace) {
        try {
            const seller = await UserService.getByWalletAddress(marketPlace.seller);
            if(!seller){
                throw new Error("Seller is not connectWallet!");
            }
            marketPlace.seller = seller._id.toString();
            marketPlace.buyer = null;
            marketPlace.price = Number(marketPlace.price);
            const newMarketPlaceItem = { ...marketPlace, finishedAt: null, isSelling: true };
            return new MarketPlaceItem(newMarketPlaceItem).save();
        } catch (error) {
            console.log("Error: " + error.message);
            throw new Error(error.message);
        }
    }

    async updateAfterSold(marketPlace) {
        try {
            const buyer = await UserService.getByWalletAddress(marketPlace.buyer);
            const TankUser = await TankUserService.updateData({ nftId: marketPlace.tokenId }, { userId: buyer._id.toString(), boughtDate: new Date() });
            const seller = await UserService.getByWalletAddress(marketPlace.seller);
            if(!TankUser|| !buyer|| !seller){
                throw new Error("TankUser or Buyer Or seller null");
            }
            const marketPlaceId = marketPlace.marketPlaceId;
            return await MarketPlaceItem.findOneAndUpdate({ seller: seller._id.toString(), tokenId: marketPlace.tokenId },
                { buyer: buyer._id.toString(), marketPlaceItemId: marketPlaceId },
                { new: true }
            )
        } catch (error) {
            console.log("Error: " + error.message);
            throw new Error(error.message);
        }
    }

    async updateAfterSellCanceled(marketPlace) {
        try {
            const seller = await UserService.getByWalletAddress(marketPlace.seller);
            if(!seller){
                throw new Error("Seller is not connectWallet!");
            }
            return await MarketPlaceItem.findOneAndUpdate({ seller: seller._id.toString(), tokenId: marketPlace.tokenId },
                { finishedAt: new Date(), isSelling: false },
                { new: true }
            );
        } catch (error) {
            console.log("Error: " + error.message);
            throw new Error(error.message);
        }
    }
}

module.exports = new MarketPlaceItemService();
