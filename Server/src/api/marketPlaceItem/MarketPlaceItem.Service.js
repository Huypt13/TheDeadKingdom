const MarketPlaceItem = require('./MarketPlaceItem.schema')
const UserService = require('../user/User.service')
const TankUserService = require('../hero/TankUser.service')
const RabbitMq = require('../../helper/RabbitMq.helper')
const TankService = require('../hero/Tank.service')




class MarketPlaceItemService {

    async createAfterListed(marketPlace) {
        try {
            const seller = await UserService.getByWalletAddress(marketPlace.seller);
            if (!seller) {
                throw new Error("Seller is not connectWallet!");
            }

            marketPlace.seller = seller._id.toString();
            marketPlace.buyer = null;
            const listTank = await TankUserService.getTankBuyUserIdAndnftId(marketPlace.seller, marketPlace.tokenId);
            const tank = listTank[0].tanks[0];
            marketPlace.price = Number(marketPlace.price);
            const newMarketPlaceItem = { ...marketPlace, finishedAt: null, isSelling: true };
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
        } catch (error) {
            await RabbitMq.listedNotify({
                message: "Listed fail",
                email: seller.email,
                price: marketPlace.price,
                tankName: "",
                url: `${process.env.WEB_URL}/user/login`,
            })
            console.log(err);
            throw new Error(error.message);
        }
    }

    async updateAfterSold(marketPlace) {
        try {
            const buyer = await UserService.getByWalletAddress(marketPlace.buyer);
            const TankUser = await TankUserService.updateData({ nftId: marketPlace.tokenId }, { userId: buyer._id.toString(), boughtDate: new Date() });
            const seller = await UserService.getByWalletAddress(marketPlace.seller);
            if (!TankUser || !buyer || !seller) {
                throw new Error("TankUser or Buyer Or seller null");
            }
            const Tank = await TankService.getByTankId(TankUser._id.toString(), TankUser.userId);
            const marketPlaceId = marketPlace.marketPlaceId;
            const marketPlaceItem = await MarketPlaceItem.findOneAndUpdate({ seller: seller._id.toString(), tokenId: marketPlace.tokenId },
                { buyer: buyer._id.toString(), marketPlaceItemId: marketPlaceId, finishedAt: new Date(), isSelling: false },
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
        } catch (error) {
            console.log(err);
            await RabbitMq.boughtNotify({
                message: "Bought failed",
                email: buyer.email,
                seller: "",
                price: marketPlace.price,
                tankName: "",
                url: `${process.env.WEB_URL}/user/login`,
            })
            throw new Error(error.message);
        }
    }

    async updateAfterSellCanceled(marketPlace) {
        try {
            const seller = await UserService.getByWalletAddress(marketPlace.seller);
            if (!seller) {
                throw new Error("Seller is not connectWallet!");
            }
            const listTank = await TankUserService.getTankBuyUserIdAndnftId(seller._id.toString(), marketPlace.tokenId);
            const tank = listTank[0].tanks[0];
            const marketPlaceId = marketPlace.marketPlaceId;
            const marketPlaceItem = await MarketPlaceItem.findOneAndUpdate({ seller: seller._id.toString(), tokenId: marketPlace.tokenId, isSelling: true },
                { finishedAt: new Date(), isSelling: false, marketPlaceItemId: marketPlaceId },
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
                throw new Error("Sold fail");
            }
        } catch (error) {
            console.log(err);
            await RabbitMq.cancelNotify({
                message: "Cancel selling failed",
                email: seller.email,
                price: "",
                tankName: "",
                url: `${process.env.WEB_URL}/user/login`,
            })
            throw new Error(error.message);
        }
    }
    async getTotalTransitionsByDay(day) {
        try {
            day--;
            const transactionUnSold = await MarketPlaceItem.aggregate([
                { $project: { diffDate: { $dateDiff: { startDate: "$createdAt", endDate: new Date(), unit: "day" } }, isSelling: 1 } },
                { $match: { isSelling: true, diffDate: { $lte: day } } }
            ]);
            const totalListedTank = transactionUnSold.length;

            const transactionSold = await MarketPlaceItem.aggregate([
                { $match: { isSelling: false, buyer: { $ne: null } } },
                { $project: { diffDate: { $dateDiff: { startDate: "$finishedAt", endDate: new Date(), unit: "day" } }, price: 1 } },
                { $match: { diffDate: { $lte: day } } },
                { $group: { _id: null, totalPrice: { $sum: "$price" }, count: { $sum: 1 } } }
            ])
            const returnData = {
                totalListedTank: transactionUnSold.length,
                totalPriceSoldTank: transactionSold[0].totalPrice,
                totalSoldTank: transactionSold[0].count
            }
            return returnData;

        } catch (error) {
            console.log(err);
            throw new Error(error.message);
        }
    }
    async getSucceedTransaction(id) {
        try {
            return await MarketPlaceItem.aggregate([
                {
                    $match: {
                        $and: [
                            { $or: [{ seller: id }, { buyer: id }] },
                            { $and: [{ isSelling: false }, { buyer: { $ne: null } }] }
                        ]
                    }
                },
                { $set: {RoleOfCurrentUser:{$cond:[{$eq:["$seller",id]},"seller","buyer"]}}},
                { $sort: {finishedAt:-1}}
 
                
            ])

        } catch (error) {
            console.log(err);
            throw new Error(error.message);
        }
    }
}

module.exports = new MarketPlaceItemService();
