const TankUser = require('./TankUser.schema')
const BoxService = require('../Box/Box.service')
const UserService = require('../user/User.service')



class TankUserService {
    async updateData(filter, data) {
        try {
            return await TankUser.findOneAndUpdate(filter, data, { new: true })
        } catch (err) {
            console.log(err.message);
            throw new Error(err.message);
        }
    }
    async createTankUser(listToken, tokenOwner, boxId) {
        try {
            const listTankUser = [];
            const tankUser = await TankUser.find({ nftId: { $in: listToken } })
            if (tankUser){
                console.log("boxId is already existed!");
                 throw new Error("boxId is already existed!");
            }
                const owerId = await UserService.getByWalletAddress(tokenOwner);
            for (let token of listToken) {
                const tankUser = {
                    userId: owerId._id.toString(),
                    tankId: null,
                    remaining: null,
                    nftId: token,
                    openDate: null,
                    boughtDate: new Date(),
                    boxId: boxId,
                    
                }
                listTankUser.push(tankUser);
            }
            return await TankUser.insertMany(listTankUser);

        } catch (err) {
            console.log(err.message);
            throw new Error(err.message);
        }
    }
    async getBoxId(tankUserId){
        try {
           const  tankUser = await TankUser.findById(tankUserId);
           if(!tankUser) throw new Error("TankUser not found");
           return tankUser.boxId;
        } catch (err) {
            console.log(err.message);
            throw new Error(err.message);
        }
    }
}



module.exports = new TankUserService();