const TankUser = require("./TankUser.schema");
const BoxService = require("../box/Box.service");
const UserService = require("../user/User.service");
const Box = require("../box/Box.service");
const RabbitMq = require("../../helper/RabbitMq.helper");

class TankUserService {
  async updateData(filter, data) {
    try {
      return await TankUser.findOneAndUpdate(filter, data, { new: true });
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }
  async createTankUser(listToken, tokenOwner, boxId) {
    const owner = await UserService.getByWalletAddress(tokenOwner);
    try {
      if (!owner) {
        throw new Error("buyer is not connect wallet");
      }
      const listTankUser = [];
      if (listToken.length <= 0) {
        throw new Error("Buy box failed");
      }
      const tankUser = await TankUser.find({ nftId: { $in: listToken } });
      if (tankUser.length >= 1) {
        throw new Error("boxId is already existed!");
      }
      const box = await BoxService.getByBoxId(boxId);
      if (!box) {
        throw new Error("Box type not found");
      }
      for (let token of listToken) {
        const tankUser = {
          userId: owner._id.toString(),
          tankId: null,
          remaining: null,
          nftId: token,
          openedDate: null,
          boughtDate: new Date(),
          boxId: boxId,
        };
        listTankUser.push(tankUser);
      }
      const result = await TankUser.insertMany(listTankUser);
      if (result.length > 0) {
        await RabbitMq.boughtBoxNotify({
          message: `You bought ${listToken.length} box success`,
          email: owner.email,
          price: `${box.price * listToken.length}`,
          url: `${process.env.WEB_URL}/user/login`,
        });
      } else {
        await RabbitMq.boughtBoxNotify({
          message: `You bought box failed`,
          email: owner.email,
          price: "",
          url: `${process.env.WEB_URL}/user/login`,
        });
      }
      return result;
    } catch (err) {
      await RabbitMq.boughtBoxNotify({
        message: `You bought box failed`,
        email: owner.email,
        price: "",
        url: `${process.env.WEB_URL}/user/login`,
      });
      console.log(err);
    }
  }

  async getBoxId(tankUserId) {
    try {
      const tankUser = await TankUser.findById(tankUserId);
      if (!tankUser) throw new Error("TankUser not found");
      return tankUser?.boxId;
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }
  async getNftId(tankUserId) {
    try {
      console.log(tankUserId);
      const tankUser = await TankUser.findById(tankUserId);
      if (!tankUser) throw new Error("TankUser not found");
      return tankUser?.nftId;
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async getTankByUserIdAndnftId(userId, nftId) {
    try {
      const tank = await TankUser.aggregate([
        { $match: { userId: userId, nftId: nftId } },
        {
          $lookup: {
            from: "tanks",
            let: { tankId: { $toObjectId: "$tankId" } },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$tankId"] } } }],
            as: "tanks",
          },
        },
      ]);
      if (tank.length == 0) {
        throw new Error("This tank is not exist");
      }
      return tank;
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }
}

module.exports = new TankUserService();
