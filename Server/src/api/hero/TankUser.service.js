const mongoose = require("mongoose");

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
    if (!owner) {
      console.log("Can't boy box. Owner is not connect wallet");
      return;
    }
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
          url: `https://www.thedeathkingdom.tk`,
        });
      } else {
        await RabbitMq.boughtBoxNotify({
          message: `You bought box failed`,
          email: owner?.email,
          price: "",
          url: `https://www.thedeathkingdom.tk`,
        });
      }
      return result;
    } catch (err) {
      await RabbitMq.boughtBoxNotify({
        message: `You bought box failed`,
        email: owner?.email,
        price: "",
        url: `https://www.thedeathkingdom.tk`,
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

  async getBoxOwnerDetail(tankUserId) {
    try {
      const tankUser = await TankUser.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(tankUserId), tankId: null } },
        {
          $lookup: {
            from: "boxes",
            let: { boxId: { $toObjectId: "$boxId" }, id: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$boxId"] } } },
              { $project: { _id: 0 } },
              { $set: { _id: "$$id" } },
            ],
            as: "box",
          },
        },
        { $unwind: "$box" },
        { $project: { box: 1 } },
      ]);
      if (tankUser.length == 0) throw new Error("TankUser not found");
      tankUser[0].box.rate = [
        { level: 1, ratio: 60 },
        { level: 2, ratio: 30 },
        { level: 3, ratio: 10 },
      ];
      return tankUser[0].box;
    } catch (err) {
      console.log(err);
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
}

module.exports = new TankUserService();
