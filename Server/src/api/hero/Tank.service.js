const Tank = require("./Tank.schema");
const TankUser = require("./TankUser.schema");

class TankService {
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
          tankList: { $push: { tank: "$tank", remaining: "$remaining" } },
        },
      },
      {
        $project: { userId: "$_id", _id: 0, tankList: 1 },
      },
    ]);
  }
  async getByTankId(id) {
    return await Tank.findOne({ _id: id });
  }
  async getByTankUserById(id, userId) {
    return await TankUser.findOne({ tankId: id, userId });
  }
}

module.exports = new TankService();
