const User = require("../api/user/User.schema");
const mongoose = require("mongoose");
const Tank = require("../api/hero/Tank.schema");

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
      active: false,
    },
    {
      _id: mongoose.Types.ObjectId("6296d13fb263c0630e920031"),
      email: "huypt",
      username: "huy",
      password: "$2b$10$QpCbmCMgsHp59mwTmJkrNOwTxmM/ckUPBdfluuVeTHtc848XCoolK",
      numOfStars: 100,
      walletAddress: "0xBa39437b944378c9bD385c1082828C9c2dE1383E",
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
