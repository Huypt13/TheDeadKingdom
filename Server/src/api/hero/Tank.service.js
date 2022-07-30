const mongoose = require("mongoose");
const _ = require("lodash");

const Tank = require("./Tank.schema");
const TankUser = require("./TankUser.schema");

const ObjectId = mongoose.Types.ObjectId;
class TankService {
  // list all tank cua id
  async getTankByUserId(userId) {
    return await TankUser.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "tanks",
          let: { tankIdSearch: { $toObjectId: "$tankId" } },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ["$_id", "$$tankIdSearch"] }] },
              },
            },
          ],
          as: "tank",
        },
      },
      {
        $unwind: "$tank",
      },
      {
        $group: {
          _id: "$userId",
          tankList: {
            $push: {
              tank: "$tank",
              remaining: "$remaining",
              _id: { $toString: "$_id" },
            },
          },
        },
      },
      {
        $project: { userId: "$_id", _id: 0, tankList: 1 },
      },
    ]);
  }
  async getByTankId(_id, userId) {
    const tankUser = await TankUser.aggregate([
      { $match: { _id: ObjectId(_id), userId } },
      {
        $lookup: {
          from: "tanks",
          let: { tankIdSearch: { $toObjectId: "$tankId" } },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ["$_id", "$$tankIdSearch"] }] },
              },
            },
          ],
          as: "tank",
        },
      },
      {
        $unwind: "$tank",
      },
    ]);
    if (!_.isEmpty(tankUser)) {
      return tankUser[0].tank;
    }
    return null;
  }
  async getByTankUserById(_id, userId) {
    return await TankUser.findOne({ _id, userId }).lean();
  }
  async updateRemaining(id) {
    return await TankUser.findByIdAndUpdate(id, { $inc: { remaining: -1 } });
  }
  async insertAll(userId) {
    const listTank = await Tank.find({}).lean();
    listTank.forEach(async (l) => {
      const tankUser = await new TankUser({
        userId,
        tankId: l._id,
        remaining: 100,
      }).save();
    });
  }
}

module.exports = new TankService();
