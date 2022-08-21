const mongoose = require("mongoose");

const MarketPlaceItem = require("../marketPlaceItem/MarketPlaceItem.schema");


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

  //
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

  // get tankuser
  async getByTankUserById(_id, userId) {
    return await TankUser.findOne({ _id, userId }).lean();
  }
  async updateRemaining(id) {
    return await TankUser.findByIdAndUpdate(id, { $inc: { remaining: -1 } });
  }
  async getTankInfo(id) {
    return await Tank.findById(id);
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

  async getTopTankListedLasted(number) {
    try {
      const listTank = await MarketPlaceItem.aggregate([
        { $match: { isSelling: true } },
        {
          $lookup: {
            from: "tankusers",
            localField: "tokenId",
            foreignField: "nftId",
            as: "tankUser",
          }
        },
        { "$unwind": "$tankUser" },
        {
          $lookup: {
            from: "tanks",
            let: { tankId: { $toObjectId: "$tankUser.tankId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$$tankId", "$_id"] } } },
              { $project: { skill: 0 } }
            ],
            as: "tank"
          }
        },
        { "$unwind": "$tank" },
        { $sort: { createdAt: -1 } },
        { $limit: +3 },
        {
          $project: {
            tank: "$tank", createdAt: "$createAt", price: "$price", tankUser: "$tankUser"
          }
        },
        {$count: "total"}
      ])
      return listTank;
    } catch (err) {
      console.log(err);
      throw new Error(err.message)
    }

  }
  async getTopTankListedLastedAndPaging(pageNumbers, limit,number) {
    try {
      const list = await this.getTopTankListedLasted(number);
      const total = list[0]?.total ||0;
      
      const displayedTankNumber = (pageNumbers - 1) * limit;
      if(displayedTankNumber >= total){
        throw new Error("Don't have tank")
      }
      const listTank = await MarketPlaceItem.aggregate([
        { $match: { isSelling: true } },
        {
          $lookup: {
            from: "tankusers",
            localField: "tokenId",
            foreignField: "nftId",
            as: "tankUser",
          }
        },
        { "$unwind": "$tankUser" },
        {
          $lookup: {
            from: "tanks",
            let: { tankId: { $toObjectId: "$tankUser.tankId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$$tankId", "$_id"] } } },
              { $project: { skill: 0 } }
            ],
            as: "tank"
          }
        },
        { "$unwind": "$tank" },
        { $sort: { createdAt: -1 } },
        { $skip: displayedTankNumber},
        { $limit: +limit },
        {
          $project: {
            _id: "$tankUser._id",tank: "$tank", createdAt: "$createAt", price: "$price", tankUser: "$tankUser"
          }
        }
      ])
      return {listTank,total};
    } catch (err) {
      console.log(err);
      throw new Error(err.message)
    }

  }

  async getTotalTankSoldLasted() {
    try {
      const listTank = await MarketPlaceItem.aggregate([
        { $match: { isSelling: false, buyer: { $ne: null } } },
        {
          $lookup: {
            from: "tankusers",
            localField: "tokenId",
            foreignField: "nftId",
            as: "tankUser",
          }
        },
        { "$unwind": "$tankUser" },
        {
          $lookup: {
            from: "tanks",
            let: { tankId: { $toObjectId: "$tankUser.tankId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$$tankId", "$_id"] } } },
              { $project: { skill: 0 } }
            ],
            as: "tank"
          }
        },
        { "$unwind": "$tank" },
        { $sort: { finishedAt: -1 } },
        {
          $project: {
            tank: "$tank", createdAt: "$createAt", price: "$price", tankUser: "$tankUser"
          }
        }
      ])
      return listTank;
    } catch (err) {
      console.log(err);
      throw new Error(err.message)
    }
  }
  async getTankSoldLastedAndPaging(pageNumber, limit) {
    try {
      const totalRecord = await this.getTotalTankSoldLasted()
      const displayedTankNumber = (pageNumber - 1) * Number(limit);
      if (displayedTankNumber >= totalRecord.length) {
        throw new Error("Don't have tank");
      }
      const listTankAfterPaging = await MarketPlaceItem.aggregate([
        { $match: { isSelling: false, buyer: { $ne: null } } },
        {
          $lookup: {
            from: "tankusers",
            localField: "tokenId",
            foreignField: "nftId",
            as: "tankUser",
          }
        },
        { "$unwind": "$tankUser" },
        {
          $lookup: {
            from: "tanks",
            let: { tankId: { $toObjectId: "$tankUser.tankId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$$tankId", "$_id"] } } },
              { $project: { skill: 0 } }
            ],
            as: "tank"
          }
        },
        { "$unwind": "$tank" },
        { $sort: { finishedAt: -1 } },
        { $skip: displayedTankNumber },
        { $limit: +limit },
        {
          $project: {
            _id: "$tankUser._id",tank: "$tank", createdAt: "$createAt", price: "$price", tankUser: "$tankUser"
          }
        }
      ])
      return { listTankAfterPaging, totalRecord: totalRecord.length };
    } catch (err) {
      console.log(err);
      throw new Error(err.message)
    }

  }
  //*
  async getTankUnsoldDetailsById(id) {
    const tankDetails = await TankUser.aggregate([
      { $match: { _id: ObjectId(id) } },
      {
        $lookup: {
          from: "marketplaceitems",
          let: { nftId: "$nftId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$tokenId", "$$nftId"] } } },
            { $match: { $expr: { $eq: ["$isSelling", true] } } }
          ],
          as: "marketplaceItem"
        }
      },
      { $unwind: "$marketplaceItem" },
      {
        $lookup: {
          from: "users",
          let: { userId: { $toObjectId: "$userId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }
          ],
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "tanks",
          let: { id: { $toObjectId: "$tankId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } }
          ],
          as: "tank"
        }
      },
      { $unwind: "$tank" },
    ])
    return tankDetails;
  }
  //*
  async getTankSoldDetailsById(id) {
    const tankDetails = await TankUser.aggregate([
      { $match: { _id: ObjectId(id) } },
      {
        $lookup: {
          from: "marketplaceitems",
          let: { nftId: "$nftId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$tokenId", "$$nftId"] } } },
            { $match: { $expr: { $eq: ["$isSelling", false] } } },
            { $sort: { finishedAt: -1 } },
            { $limit: 1 }
          ],
          as: "marketplaceItem"
        }
      },
      { $unwind: "$marketplaceItem" },
      {
        $lookup: {
          from: "users",
          let: { userId: { $toObjectId: "$userId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }
          ],
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "tanks",
          let: { id: { $toObjectId: "$tankId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } }
          ],
          as: "tank"
        }
      },
      { $unwind: "$tank" },
    ])
    return tankDetails;
  }
  async getTopListedLastedWithFilter(filter) {
    try {
      const { levels, classTypes, typeIds, limit, pageNumbers, sortBy } = filter;
      const listTank = await MarketPlaceItem.aggregate([
        {
          $match: {
            isSelling: true,
          }
        },
        {
          $lookup: {
            from: "tankusers",
            localField: "tokenId",
            foreignField: "nftId",
            as: "tankUser",
          }
        },
        { "$unwind": "$tankUser" },
        {
          $lookup: {
            from: "tanks",
            let: { tankId: { $toObjectId: "$tankUser.tankId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$$tankId", "$_id"] } } },
              {
                $match: {
                  $and: [
                    { level: { $in: levels } },
                    { classType: { $in: classTypes } },
                    { typeId: { $in: typeIds } }
                  ]
                }
              }
            ],
            as: "tank"
          },
        },
        { "$unwind": "$tank" },
        {
          $project: {
            name: "$tank.name", price: 1, createdAt: "$createdAt",
            remaining: "$tank.remaining", tank: "$tank", tankUser: "$tankUser",
          }
        },
        { $sort: { createdAt: -1 } },
        { $sort: sortBy },
        { $count: "total" },
      ])

      return listTank;
    } catch (err) {
      console.log(err);
      throw new Error(err.message)
    }
  }
  async getTopListedLastedWithFilterAndPaging(filter) {

    try {
      const { levels, classTypes, typeIds, limit, pageNumbers, sortBy } = filter;
      const tanks = await this.getTopListedLastedWithFilter(filter);
      const total = tanks[0]?.total || 0;
      const displayedTankNumber = (pageNumbers - 1) * limit;
      if (displayedTankNumber >= total) {
        throw new Error("Don't have tank")
      }
      const listTank = await MarketPlaceItem.aggregate([
        {
          $match: {
            isSelling: true,
          }
        },
        {
          $lookup: {
            from: "tankusers",
            localField: "tokenId",
            foreignField: "nftId",
            as: "tankUser",
          }
        },
        { "$unwind": "$tankUser" },
        {
          $lookup: {
            from: "tanks",
            let: { tankId: { $toObjectId: "$tankUser.tankId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$$tankId", "$_id"] } } },
              {
                $match: {
                  $and: [
                    { level: { $in: levels } },
                    { classType: { $in: classTypes } },
                    { typeId: { $in: typeIds } }
                  ]
                }
              }
            ],
            as: "tank"
          },
        },
        { "$unwind": "$tank" },
        {
          $project: {
            _id:"$tankUser._id",
            name: "$tank.name", price: 1, createdAt: "$createdAt",
            remaining: "$tank.remaining", tank: "$tank", tankUser: "$tankUser",
          }
        },
        { $sort: { createdAt: -1 } },
        { $sort: sortBy },
        { $skip: displayedTankNumber },
        { $limit: limit }
      ])
      return { listTank, total: total };
    } catch (err) {
      console.log(err);
      throw new Error(err.message)
    }
  }

  async getTotalTankOwnerWithStatus(filter, _id) {
    try {
      let { limit, pageNumbers, sortBy, status } = filter
      let listTankOwner;
      if (status == "Owned") {
        listTankOwner = await TankUser.aggregate([
          { $match: { userId: _id, tankId: { $ne: null }, nftId: { $ne: null } } },
          {
            $lookup: {
              from: "marketplaceitems",
              let: { nftId: "$nftId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$tokenId", "$$nftId"] } } },
                { $match: { $expr: { $eq: ["$isSelling", false] } } },
                { $sort: { finishedAt: -1 } },
                { $limit: 1 }
              ],
              as: "marketplaceItem"
            }
          },
          { $unwind: "$marketplaceItem" },
          {
            $lookup: {
              from: "tanks",
              let: { id: { $toObjectId: "$tankId" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$id"] } } }
              ],
              as: "tank"
            }
          },
          { $unwind: "$tank" },
          {
            $project: {
              name: "$tank.name", price: "$marketplaceItem.price", boughtDate: "$boughtDate",
              remaining: "$tank.remaining", tank: "$tank", tankUser: "$tankUser", marketplaceItem: "$marketplaceItem"
            }
          },
          { $sort: sortBy },
        ])
      } else {
        listTankOwner = await TankUser.aggregate([
          { $match: { userId: _id, tankId: { $ne: null }, nftId: { $ne: null } } },
          {
            $lookup: {
              from: "marketplaceitems",
              let: { nftId: "$nftId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$tokenId", "$$nftId"] } } },
                { $match: { $expr: { $eq: ["$isSelling", true] } } }
              ],
              as: "marketplaceItem"
            }
          },
          { $unwind: "$marketplaceItem" },
          {
            $lookup: {
              from: "tanks",
              let: { id: { $toObjectId: "$tankId" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$id"] } } }
              ],
              as: "tank"
            }
          },
          { $unwind: "$tank" },
          {
            $project: {
              name: "$tank.name", price: "$marketplaceItem.price", boughtDate: "$boughtDate",
              remaining: "$tank.remaining", tank: "$tank", tankUser: "$tankUser", marketplaceItem: "$marketplaceItem"
            }
          },
          { $sort: sortBy },

        ])
      }

      return listTankOwner;
    } catch (err) {
      console.log(err);
      throw new Error(err.message)
    }
  }
  async getTotalTankOwnerWithStatusAndPaging(filter, _id) {
    try {
      const total = await this.getTotalTankOwnerWithStatus(filter, _id);
      let totalTank = total.length;
      let { limit, pageNumbers, sortBy, status } = filter
      const displayedTankNumber = (pageNumbers - 1) * limit;
      if (displayedTankNumber >= totalTank) {
        throw new Error("Don't have tank");
      }
      let listTankOwner = null;
      if (status == "Owned") {
        listTankOwner = await TankUser.aggregate([
          { $match: { userId: _id, tankId: { $ne: null }, nftId: { $ne: null } } },
          {
            $lookup: {
              from: "marketplaceitems",
              let: { nftId: "$nftId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$tokenId", "$$nftId"] } } },
                { $match: { $expr: { $eq: ["$isSelling", false] } } },
                { $sort: { finishedAt: -1 } },
                { $limit: 1 }
              ],
              as: "marketplaceItem"
            }
          },
          { $unwind: "$marketplaceItem" },
          {
            $lookup: {
              from: "tanks",
              let: { id: { $toObjectId: "$tankId" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$id"] } } }
              ],
              as: "tank"
            }
          },
          { $unwind: "$tank" },
          {
            $project: {
              name: "$tank.name", price: "$marketplaceItem.price", boughtDate: "$boughtDate",
              remaining: "$tank.remaining", tank: "$tank", tankUser: "$tankUser", marketplaceItem: "$marketplaceItem"
            }
          },
          { $sort: sortBy },
          { $skip: displayedTankNumber },
          { $limit: limit },

        ])
      } else {
        listTankOwner = await TankUser.aggregate([
          { $match: { userId: _id, tankId: { $ne: null }, nftId: { $ne: null } } },
          {
            $lookup: {
              from: "marketplaceitems",
              let: { nftId: "$nftId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$tokenId", "$$nftId"] } } },
                { $match: { $expr: { $eq: ["$isSelling", true] } } }
              ],
              as: "marketplaceItem"
            }
          },
          { $unwind: "$marketplaceItem" },
          {
            $lookup: {
              from: "tanks",
              let: { id: { $toObjectId: "$tankId" } },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$id"] } } }
              ],
              as: "tank"
            }
          },
          { $unwind: "$tank" },
          {
            $project: {
              name: "$tank.name", price: "$marketplaceItem.price", boughtDate: "$boughtDate",
              remaining: "$tank.remaining", tank: "$tank", tankUser: "$tankUser", marketplaceItem: "$marketplaceItem"
            }
          },
          { $sort: sortBy },
          { $skip: displayedTankNumber },
          { $limit: limit },
        ])
      }

      return { listTankOwner, totalTank };
    } catch (err) {
      console.log(err);
      throw new Error(err.message)
    }
  }
  async getTotalTankOwnerPaging(_id, paging) {
    try {
      const total = await this.getTotalTankOwner(_id);
      const totalTank = total.length;
      const { pageNumbers, limit } = paging;
      const displayedTankNumber = (pageNumbers - 1) * limit;
      if (displayedTankNumber >= totalTank) {
        throw new Error("Don't have tank'")
      }
      const listTankOwner = await TankUser.aggregate([
        { $match: { userId: _id, tankId: { $ne: null }, nftId: { $ne: null } } },
        {
          $lookup: {
            from: "marketplaceitems",
            let: { nftId: "$nftId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$tokenId", "$$nftId"] } } },
              { $sort: { finishedAt: -1 } },
              { $limit: 1 }
            ],
            as: "marketplaceItem"
          }
        },
        { $unwind: "$marketplaceItem" },
        {
          $lookup: {
            from: "tanks",
            let: { id: { $toObjectId: "$tankId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$id"] } } }
            ],
            as: "tank"
          }
        },
        { $unwind: "$tank" },
        {
          $project: {
            tank: "$tank", tankUser: "$tankUser", marketplaceItem: "$marketplaceItem"
          }
        },
        { $skip: displayedTankNumber },
        { $limit: +limit }
      ])

      return { listTankOwner, totalTank: totalTank }
    } catch (err) {
      console.log(err);
      throw new Error(err.message)
    }
  }
  async getTotalTankOwner(_id) {
    try {
      const listTankOwner = await TankUser.aggregate([
        { $match: { userId: _id, tankId: { $ne: null }, nftId: { $ne: null } } },
        {
          $lookup: {
            from: "marketplaceitems",
            let: { nftId: "$nftId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$tokenId", "$$nftId"] } } },
              { $sort: { finishedAt: -1 } },
              { $limit: 1 }
            ],
            as: "marketplaceItem"
          }
        },
        { $unwind: "$marketplaceItem" },
        {
          $lookup: {
            from: "tanks",
            let: { id: { $toObjectId: "$tankId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$id"] } } }
            ],
            as: "tank"
          }
        },
        { $unwind: "$tank" },
        {
          $project: {
            tank: "$tank", tankUser: "$tankUser", marketplaceItem: "$marketplaceItem"
          }
        }
      ])

      return listTankOwner;
    } catch (err) {
      console.log(err);
      throw new Error(err.message)
    }
  }

}

module.exports = new TankService();
