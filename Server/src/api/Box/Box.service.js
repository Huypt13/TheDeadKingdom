const Box = require("./Box.schema");

const TankUser = require("../hero/TankUser.schema");
const mongoose = require("mongoose");

const ObjectId = mongoose.Types.ObjectId;

class BoxService {
  async getByBoxId(boxId) {
    return await Box.findById(boxId).lean();
  }

  async getAllBoxes() {
    return await Box.find({});
  }
  async getAllBoxeId() {
    return await Box.find({}).select({ _id: 1 });
  }

  async unbox(boxId) {
    try {
      const boxRate = await this.getByBoxId(boxId);
      if (!boxRate) return null;
      return await this.randomTank(boxRate.rate);
    } catch (err) {
      throw new Error("Unbox Fail");
    }
  }

  async randomBoxId() {
    const listBoxId = await this.getAllBoxeId();
    const index = Math.floor(Math.random() * listBoxId.length);
    return listBoxId[index]._id.toString();
  }

  async randomTank(boxRate) {
    if (!boxRate) return null;
    let random = Math.random();
    let boxArray = boxRate; //[{tankId:"a",ratio:0.6},{tankId:"b",ratio:0.3},{tankId:"c",ratio:0.1}]
    let pre = 0;
    let newArray = [];
    for (var k of boxArray) {
      k.ratio += pre;
      newArray.push(k);
      pre = k.ratio;
    }
    let first = 0;
    let result = {};
    for (var i of newArray) {
      if (first <= random && random < i.ratio) {
        result = i;
        break;
      }
      first = i.ratio;
    }
    return result.tankId;
  }

  async getAllBoxOwner(id) {
    try {
      return await TankUser.aggregate([
        { $match: { tankId: null, userId: id } },
        {
          $lookup: {
            from: "boxes",
            let: { boxId: { $toObjectId: "$boxId" } },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$boxId"] } } }],
            as: "box",
          },
        },
      ]);
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }
  async getAllBoxOwnerAndPaging({ pageNumbers, limit }, id) {
    try {
      const listBox = await this.getAllBoxOwner(id);
      const total = listBox.length;
      const displayedBoxNumber = (pageNumbers - 1) * limit;
      if (total <= displayedBoxNumber) {
        throw new Error("Don't have box");
      }
      const listBoxes = await TankUser.aggregate([
        { $match: { tankId: null, userId: id } },
        {
          $lookup: {
            from: "boxes",
            let: { boxId: { $toObjectId: "$boxId" } },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$boxId"] } } }],
            as: "box",
          },
        },
        { $skip: displayedBoxNumber },
        { $limit: +limit },
      ]);
      return { listBoxes, total };
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }
}

module.exports = new BoxService();
