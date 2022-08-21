const validator = require('validator')

const MarketPlaceItem = require('./MarketPlaceItem.schema')
const UserService = require('../user/User.service')
const TankUserService = require('../hero/TankUser.service')
const RabbitMq = require('../../helper/RabbitMq.helper')
const TankService = require('../hero/Tank.service')



 // event NFTListed(
  //     uint256 marketItemId,
  //     address nftContract,
  //     uint256 tokenId,
  //     address seller,
  //     address buyer,
  //     uint256 price
  // );
class MarketPlaceItemService {

    async createAfterListed(marketPlace) {
        try {
            const seller = await UserService.getByWalletAddress(marketPlace.seller);
            if (!seller) {
                throw new Error("Seller is not connect wallet!");
            }
            marketPlace.seller = seller._id.toString();
            marketPlace.buyer = null;
            marketPlace.price = Number(marketPlace.price);
            if(marketPlace.price <= 0){
                throw new Error("Price must greater than 0");
            }
            const listTank = await TankUserService.getTankByUserIdAndnftId(marketPlace.seller, marketPlace.tokenId);
            if(listTank.length <= 0){
                throw new Error("This tank is not exist")
            }
            const tank = listTank[0].tanks[0];
            marketPlace.price = Number(marketPlace.price);
            
            const market = await MarketPlaceItem.findOne({tokenId: marketPlace.tokenId, isSelling: true});
            if(market){
                throw new Error("This transaction is already exist")
            }

            const newMarketPlaceItem = { ...marketPlace, finishedAt: null, createdAt: new Date(), isSelling: true };
            const marketPlaceItem = await new MarketPlaceItem(newMarketPlaceItem).save();
            if (marketPlaceItem) {
                await RabbitMq.listedNotify({
                    message: "Listed successful",
                    email: seller.email,
                    price: marketPlace.price,
                    tankName: tank.name + " level" + tank.level,
                    url: `${process.env.WEB_URL}/user/login`,
                })
            } else {
                await RabbitMq.listedNotify({
                    message: "Listed fail",
                    email: seller.email,
                    price: marketPlace.price,
                    tankName: tank.name + " level" + tank.level,
                    url: `${process.env.WEB_URL}/user/login`,
                })
                throw new Error("Listed fail");
            }
            return marketPlaceItem;
        } catch (error) {
            console.log(error);

        }
    }

    async updateAfterSold(marketPlace) {
        try {
            if(marketPlace.buyer == marketPlace.seller){
                throw new Error("Buyer address must different seller")
            }
            const buyer = await UserService.getByWalletAddress(marketPlace.buyer);
            const seller = await UserService.getByWalletAddress(marketPlace.seller);
            if (!buyer || !seller) {
                throw new Error("Buyer Or seller is not connect wallet");
            }
            marketPlace.price = Number(marketPlace.price);
            if(marketPlace.price <= 0){
                throw new Error("Price must greater than 0");
            }

            const TankUser = await TankUserService.updateData({ nftId: marketPlace.tokenId, userId: seller._id.toString(),  },
                { userId: buyer._id.toString(), boughtDate: new Date() });
            if (!TankUser) {
                throw new Error("Sold fail");
            }
            const Tank = await TankService.getByTankId(TankUser._id.toString(), TankUser.userId);
            const marketItemId = marketPlace.marketItemId;
            const marketPlaceItem = await MarketPlaceItem.findOneAndUpdate({ seller: seller._id.toString(), tokenId: marketPlace.tokenId, isSelling: true},
                {
                    buyer: buyer._id.toString(), marketItemId: marketItemId, finishedAt: new Date(),
                    isSelling: false, price: marketPlace.price
                },
                { new: true }
            )
            
            if (marketPlaceItem) {
                await RabbitMq.soldNotify({
                    message: "Congratulations on your successful sale",
                    email: seller.email,
                    buyer: marketPlace.buyer,
                    price: marketPlace.price,
                    tankName: Tank.name + " level" + Tank.level,
                    url: `${process.env.WEB_URL}/user/login`,
                })
                await RabbitMq.boughtNotify({
                    message: "Congratulations on your successful bought",
                    email: buyer.email,
                    seller: marketPlace.seller,
                    price: marketPlace.price,
                    tankName: Tank.name + " level" + Tank.level,
                    url: `${process.env.WEB_URL}/user/login`,
                })
            } else {
                await RabbitMq.boughtNotify({
                    message: "Bought failed",
                    email: buyer.email,
                    seller: "",
                    price: marketPlace.price,
                    tankName: Tank.name + " level" + Tank.level,
                    url: `${process.env.WEB_URL}/user/login`,
                })
                console.log("MarketPlaceItem not found");
                throw new Error("Sold fail");
            }
            return marketPlaceItem;
        } catch (error) {
            console.log(error);
        }
    }

    async updateAfterSellCanceled(marketPlace) {
        try {
            const seller = await UserService.getByWalletAddress(marketPlace.seller);
            if (!seller) {
                throw new Error("Seller is not connect wallet");
            }
            const listTank = await TankUserService.getTankByUserIdAndnftId(seller._id.toString(), marketPlace.tokenId);
            const tank = listTank[0].tanks[0];
            if(listTank.length <= 0){
                throw new Error("This tank is not exist")
            }
            const marketItemId = marketPlace.marketItemId;
            const marketPlaceItem = await MarketPlaceItem.findOneAndUpdate({ seller: seller._id.toString(), tokenId: marketPlace.tokenId, isSelling: true },
                { finishedAt: new Date(), isSelling: false, marketItemId: marketItemId },
                { new: true }
            );
            if (marketPlaceItem) {
                await RabbitMq.cancelNotify({
                    message: "Cancel listed successful",
                    email: seller.email,
                    price: marketPlace.price,
                    tankName: tank.name + " level" + tank.level,
                    url: `${process.env.WEB_URL}/user/login`,
                })
            } else {
                await RabbitMq.cancelNotify({
                    message: "Cancel selling failed",
                    email: seller.email,
                    price: "",
                    tankName: tank.name + " level" + tank.level,
                    url: `${process.env.WEB_URL}/user/login`,
                })
                console.log("MarketPlaceItem not found");
                throw new Error("Cancel listed tank fail");
            }
            return marketPlaceItem;
        } catch (error) {
            console.log(error);

        }
    }
    async getTotalTransactionsByDay(day) {
        try {
            if(day >= 32){
                throw new Error("Day exceed the allowed amount")
            }
            day--;
            const transactionUnSold = await MarketPlaceItem.aggregate([
                { $project: { diffDate: { $dateDiff: { startDate: "$createdAt", endDate: new Date(), unit: "day" } }, isSelling: 1 } },
                { $match: { isSelling: true, diffDate: { $lte: day } } }
            ]);

            const transactionSold = await MarketPlaceItem.aggregate([
                { $match: { isSelling: false, buyer: { $ne: null } } },
                { $project: { diffDate: { $dateDiff: { startDate: "$finishedAt", endDate: new Date(), unit: "day" } }, price: 1 } },
                { $match: { diffDate: { $lte: day } } },
                { $group: { _id: null, totalPrice: { $sum: "$price" }, count: { $sum: 1 } } }
            ])
            const returnData = {
                totalListedTank: transactionUnSold?.length || 0,
                totalPriceSoldTank: transactionSold[0]?.totalPrice || 0,
                totalSoldTank: transactionSold[0]?.count || 0
            }
            return returnData;

        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }
    async getSucceedTransaction(id, day) {
        try {
            day--;
            return await MarketPlaceItem.aggregate([
                {
                    $match: {
                        $and: [
                            { $or: [{ seller: id }, { buyer: id }] },
                            { $and: [{ isSelling: false }, { buyer: { $ne: null } }] }
                        ]
                    }
                },
                { $set: { diffDate: { $dateDiff: { startDate: "$finishedAt", endDate: new Date(), unit: "day" } }, price: 1 } },
                { $match: { diffDate: { $lte: day } } },
                { $set: { RoleOfCurrentUser: { $cond: [{ $eq: ["$seller", id] }, "seller", "buyer"] } } },
                { $sort: { finishedAt: -1 } }


            ])

        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
    }
    async validateInput(marketPlace){
          // event NFTListed(
        //     uint256 marketItemId,
        //     address nftContract,
        //     uint256 tokenId,
        //     address seller,
        //     address buyer,
        //     uint256 price
        // );
        let marketItemId = marketPlace.marketItemId;
        let nftContract = marketPlace.nftContract;
        let tokenId = marketPlace.tokenId;
        let seller = marketPlace.seller;
        let buyer = marketPlace.buyer;
        let price = marketPlace.price;
         if(marketPlaceId || marketItemId){
             
         }
       
    }
}

module.exports = new MarketPlaceItemService();
