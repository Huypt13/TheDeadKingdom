const User = require("../api/user/User.schema");

const MarketPlaceItem = require("../api/marketPlaceItem/MarketPlaceItem.schema");


const Box = require("../api/box/Box.schema");




const mongoose = require("mongoose");
const Tank = require("../api/hero/Tank.schema");
const TankUser = require("../api/hero/TankUser.schema");
const History = require("../api/history/History.schema");

module.exports.insertUserData = async () => {
  await User.insertMany([
    {
      _id: mongoose.Types.ObjectId("62fb177b81bd0dd14ece61d0"),
      email: "huy",
      password: "$2b$10$QpCbmCMgsHp59mwTmJkrNOwTxmM/ckUPBdfluuVeTHtc848XCoolK",
      username: "huydtr",
      numOfStars: 1,
      walletAddress: "0x0c3DFD77D632BebC1E27927FD39a6579CDa54f03",
      activeCode: "hahaha",
      resetCode:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaHV5ZHRyIiwiaWF0IjoxNjYwODM3MTY0LCJleHAiOjE2NjM0MjkxNjR9.gb4ZvdES2PTdh72KOAgBDSMZj9Evy1yifl96oy1CJ38",
      active: false,
    },
    {
      _id: mongoose.Types.ObjectId("6296d13fb263c0630e920031"),
      email: "huypt",
      username: "huy",
      password: "$2b$10$QpCbmCMgsHp59mwTmJkrNOwTxmM/ckUPBdfluuVeTHtc848XCoolK",
      resetCode:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaHV5ZHRyIiwiaWF0IjoxNjYwODM3MjQzLCJleHAiOjE2NjA4MzcyNDR9.pLIvPffNN9I16qVlOVtPl50Yf27om_DfKJ-NF4Ji-_g",
      numOfStars: 100,
      walletAddress: null,
    },
    {
      _id: mongoose.Types.ObjectId("6296d14fb263c0630e920036"),
      email: "duwvux",
      numOfStars: 1,
      username: "duwvux",
      password: "$2b$10$QpCbmCMgsHp59mwTmJkrNOwTxmM/ckUPBdfluuVeTHtc848XCoolK",
      walletAddress: "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714",
    },
  ]);
};

module.exports.insertTankData = async () => {
  await Tank.insertMany([
    {
      _id: mongoose.Types.ObjectId("62e11132105338549ed69870"),
      typeId: "001",
      name: "Hùng Vương",
      classType: 1,
      level: 1,
      armor: 40,
      speed: 4,
      rotationSpeed: 150,
      damage: 50,
      health: 800,
      attackSpeed: 0.6,
      bulletSpeed: 1,
      shootingRange: 6,
      skill1: {
        name: "Ice Fracgment",
        description:
          "Fires a ice fragment in a straight line, dealing {damage} damage and slowing {slowed.value} speed of the enemies in {slowed.time} second. ",
        timeCounter: 7,
        damage: 100,
        healing: 0,
        range: 8,
        speed: 0.9,
        slowled: {
          value: 0.3,
          time: 5,
        },
        image: "http://thedeathkingdom.tk/images/skills/tank001-skill1.png",
      },
      skill2: {
        name: "Water Bubble",
        description:
          "Releases a bubble of water in a straight line dealing {damage} damage , upon impact will keep enemies inside for {stunned} second.",
        timeCounter: 15,
        damage: 50,
        healing: 0,
        range: 6,
        speed: 0.8,
        stunned: 3,
        image: "http://thedeathkingdom.tk/images/skills/tank001-skill2.png",
      },
      skill3: {
        name: "Son Of TanXa Lake",
        description:
          "Absorbs power from Z core, increasing Movement Speed {speedUp.value} %, Attack Speed {attackSpeedUp.value} %, Armor {attackSpeedUp.value} %  for  {time} second.",
        timeCounter: 30,

        speedUp: {
          value: 0.5,
          time: 10,
        },
        virtualBlood: {
          value: 400,
          time: 10,
        },
        damagedUp: {
          value: 0.5,
          time: 10,
        },
        armorUp: {
          value: 3,
          time: 10,
        },
        attackSpeedUp: {
          value: 2,
          time: 10,
        },
        image: "http://thedeathkingdom.tk/images/skills/tank001-skill3.png",
      },
      image: "http://thedeathkingdom.tk/images/tanks/tank001-level1.png",
    },
    {
      _id: mongoose.Types.ObjectId("62e11132105338549ed69871"),
      typeId: "002",
      name: "THD",
      classType: 1,
      level: 1,
      armor: 40,
      speed: 4,
      rotationSpeed: 150,
      damage: 50,
      health: 800,
      attackSpeed: 0.6,
      bulletSpeed: 1,
      shootingRange: 6,
      skill1: {
        name: "Ice Fracgment",
        description:
          "Fires a ice fragment in a straight line, dealing {damage} damage and slowing {slowed.value} speed of the enemies in {slowed.time} second. ",
        timeCounter: 7,
        damage: 100,
        healing: 0,
        range: 8,
        speed: 0.9,
        slowled: {
          value: 0.3,
          time: 5,
        },
        image: "http://thedeathkingdom.tk/images/skills/tank001-skill1.png",
      },
      skill2: {
        name: "Water Bubble",
        description:
          "Releases a bubble of water in a straight line dealing {damage} damage , upon impact will keep enemies inside for {stunned} second.",
        timeCounter: 15,
        damage: 50,
        healing: 0,
        range: 6,
        speed: 0.8,
        stunned: 3,
        image: "http://thedeathkingdom.tk/images/skills/tank001-skill2.png",
      },
      skill3: {
        name: "Son Of TanXa Lake",
        description:
          "Absorbs power from Z core, increasing Movement Speed {speedUp.value} %, Attack Speed {attackSpeedUp.value} %, Armor {attackSpeedUp.value} %  for  {time} second.",
        timeCounter: 30,

        speedUp: {
          value: 0.5,
          time: 10,
        },
        virtualBlood: {
          value: 400,
          time: 10,
        },
        damagedUp: {
          value: 0.5,
          time: 10,
        },
        armorUp: {
          value: 3,
          time: 10,
        },
        attackSpeedUp: {
          value: 2,
          time: 10,
        },
        image: "http://thedeathkingdom.tk/images/skills/tank001-skill3.png",
      },
      image: "http://thedeathkingdom.tk/images/tanks/tank001-level1.png",
    },
  ]);
};

module.exports.insertTankUserData = async () => {
  await TankUser.insertMany([
    {
      _id: mongoose.Types.ObjectId("62ef8e9da0b3eafa898cabd4"),
      userId: "6296d14fb263c0630e920036",
      tankId: "62e11132105338549ed69871",
      remaining: 98,
      boxId: "62f20d4b70d1f15ecd11c37a",
      nftId: "1",
    },
    {
      _id: mongoose.Types.ObjectId("62ef8e9da0b3eafa898cabd5")
      ,
      userId: "6296d14fb263c0630e920036",
      tankId: "62e11132105338549ed69871",
      remaining: 98,
      boxId: "62f20d4b70d1f15ecd11c37a",
      nftId: "3",
    },
    {
      _id: mongoose.Types.ObjectId("62ef8e9da0b3eafa898cabd6")
      ,
      userId: "6296d14fb263c0630e920036",
      tankId: "62e11132105338549ed69871",
      remaining: 98,
      boxId: "62f20d4b70d1f15ecd11c37a",
      nftId: "2",
    },
    {
      _id: mongoose.Types.ObjectId("62ef8e9da0b3eafa898cabd3")
      ,
      userId: "6296d13fb263c0630e920031",
      tankId: "62e11132105338549ed69870",
      boxId: "62f20d4b70d1f15ecd11c37a",
      nftId: "2",
      remaining: 100,
    },
    {
      _id: mongoose.Types.ObjectId("62ef8e9da0b3eafa898cabd9")
      ,
      userId: "6296d13fb263c0630e920031",
      tankId: null,
      boxId: "62f20d4b70d1f15ecd11c37a",
      nftId: "1",
      remaining: 100,
    }
  ])
}

module.exports.insertBoxData = async () => {
  await Box.insertMany([
    {
      "_id": mongoose.Types.ObjectId("62f20d4b70d1f15ecd11c37a"),
      "price": 100,
      "image": null,
      "rate": [
        {
          "tankId": "62e11132105338549ed69870",
          "ratio": 0.2
        },
        {
          "tankId": "62e1115b105338549ed6a5c2",
          "ratio": 0.2
        },
        {
          "tankId": "62e11319105338549ed7398e",
          "ratio": 0.2
      },
        {
          "tankId": "62e11149105338549ed69fab",
          "ratio": 0.1
        },
        {
          "tankId": "62e4b62d105338549e07e2dd",
          "ratio": 0.1
        },
        {
          "tankId": "62e4b715105338549e083485",
          "ratio": 0.1
        },
        {
          "tankId": "62e4b4a2105338549e0758ec",
          "ratio": 0.03
        },
        {
          "tankId": "62e4b67b105338549e07fe3e",
          "ratio": 0.03
        },
        {
          "tankId": "62e4b758105338549e084bb1",
          "ratio": 0.04
        }
      ],
      "name": "Strange Box"
    }
  ])
}

module.exports.insertMarketPlaceItemData = async () => {
  await MarketPlaceItem.insertMany([{
    "_id": mongoose.Types.ObjectId("62f387a2f62fd1f6f4d367de"),
    "tokenId": "1",
    "marketItemId": "1231",
    "price": 103.4,
    "seller": "6296d14fb263c0630e920036",
    "buyer": "6296d13fb263c0630e920031",
    "nftContract": "ad123",
    "isSelling": false,
    "createdAt": "2022-08-11T16:58:22.331+00:00",
    "finishedAt": "2022-08-11T16:58:22.331+00:00"
    },{
    "_id": mongoose.Types.ObjectId("62f387a2f62fd1f6f4d367dc"),
    "tokenId": "2",
    "marketItemId": "1233",
    "price": 103.4,
    "seller": "6296d14fb263c0630e920036",
    "buyer": null,
    "nftContract": "ad123",
    "isSelling": true,
    "createdAt": "2022-08-11T16:58:22.331+00:00",
    "finishedAt": null
    }
    ,{
    "_id": mongoose.Types.ObjectId("62f387a2f62fd1f6f4d367da"),
    "tokenId": "3",
    "price": 103.4,
    "marketItemId": "131",
    "seller": "6296d14fb263c0630e920036",
    "buyer": null,
    "nftContract": "ad123",
    "isSelling": true,
    "createdAt": "2022-08-11T16:58:22.331+00:00",
    "finishedAt": null
    }
  // },{
  //   "_id": mongoose.Types.ObjectId("62f388e2daaf8c24bb428f98"),
  //   "marketPlaceItemId": "111",
  //   "tokenId": "1",
  //   "price": 103.4,
  //   "seller": "62ef89a859f656820c803044",
  //   "buyer": "62ef8a6859f656820c803045",
  //   "nftContract": "ad123",
  //   "isSelling": true,
  //   "createdAt": {
  //     "$date": {
  //       "$numberLong": "1660127458103"
  //     }
  //   }
  // },{
  //   "_id": mongoose.Types.ObjectId("62f5352f58497eb270526d01"),
  //   "marketPlaceItemId": "111",
  //   "tokenId": "3",
  //   "price": 103.4,
  //   "seller": "62ef89a859f656820c803044",
  //   "buyer": "62ef8a6859f656820c803045",
  //   "nftContract": "ad123",
  //   "isSelling": false,
  //   "createdAt": {
  //     "$date": {
  //       "$numberLong": "1660237102331"
  //     }
  //   },
  //   "finishedAt": {
  //     "$date": {
  //       "$numberLong": "1660237937150"
  //     }
  //   }
  ])
}

module.exports.insertHistory = async () => {
  await History.insertMany([
    {
      _id: mongoose.Types.ObjectId("62f4d7af6a1323d94ebc9aae"),
      teamWin: 1,
      gameMode: "Flag",
      team1Kill: 0,
      team2Kill: 0,
      members: [
        {
          userId: "6296d13fb263c0630e920031",
          tank: "62ef8e9da0b3eafa898cabd3",
          team: 1,
          isWin: true,
          kill: 0,
          dead: 0,
          _id: mongoose.Types.ObjectId("62f4d7af6a1323d94ebc9aaf"),
        },
      ],
      time: Date.now(),
    },
    {
      _id: mongoose.Types.ObjectId("62f1136fe0411dc86e2cccf1"),
      teamWin: 2,
      gameMode: "CountKill",
      team1Kill: 1,
      team2Kill: 2,
      members: [
        {
          userId: "6296d13fb263c0630e920031",
          tank: "62ef8e9da0b3eafa898cabd3",
          team: 1,
          isWin: false,
          kill: 0,
          dead: 0,
        },
        {
          userId: "6296d14fb263c0630e920036",
          tank: "62ef8e9da0b3eafa898cabd4",
          team: 2,
          isWin: true,
          kill: 0,
          dead: 0,
        },
      ],
      time: Date.now(),
    },
  ]);
};
