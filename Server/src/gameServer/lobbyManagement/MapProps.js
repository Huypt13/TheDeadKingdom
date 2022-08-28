const Vector2 = require("../../dto/Vector2");
// -4,-0.6
// 0.4609557

const tankAi = {
  speed: 0.2,
  rotationSpeed: 0.3,
  damage: 80,
  health: 1500,
  attackSpeed: 0.5,
  bulletSpeed: 1,
  shootingRange: 7,
};
const tankAi2 = {
  speed: 0.2,
  rotationSpeed: 0.3,
  damage: 80,
  health: 1000,
  attackSpeed: 1,
  bulletSpeed: 1,
  shootingRange: 7,
};
module.exports.map = {
  IcexLavaMap: {
    TankSpawnPosition: [
      {
        position: new Vector2(-13.30769, 3.201224),
      },
      {
        position: new Vector2(1.88, -7.43),
      },
      {
        position: new Vector2(-10.52818, 5.392758),
      },
      {
        position: new Vector2(4.86, -1.88),
      },
      {
        position: new Vector2(-10.52818, 3.201224),
      },
      {
        position: new Vector2(5.12, -4.63),
      },
    ],
    BaseRed: [
      {
        position: { x: 7.06, y: -9 },
      },
    ],
    RedTeamBigTurret: [
      {
        position: { x: 4.06, y: -6.19 },
      },
    ],
    RedTeamSmallTurret: [
      {
        position: { x: 1.03, y: -8.98 },
      },
      {
        position: { x: 6.95, y: -3.8 },
      },
      {
        position: { x: 6.01, y: 1.29 },
      },
      {
        position: { x: -5.99, y: -8.04 },
      },
    ],
    RedTeamPotion: [
      {
        position: { x: 7.17, y: -5.33 },
      },
      {
        position: { x: 2.59, y: -9.1 },
      },
    ],
    BaseBlue: [
      {
        position: { x: -15.00529, y: 6.833105 },
      },
    ],
    BlueTeamSmallTurret: [
      {
        position: { x: -15.16664, y: 2.07 },
      },
      {
        position: { x: -10.09, y: 7.06 },
      },
      {
        position: { x: -13.92297, y: -2.911003 },
      },
      {
        position: { x: -1.99, y: 6.01 },
      },
    ],
    BlueTeamBigTurret: [
      {
        position: { x: -12.12, y: 4.46 },
      },
    ],
    BlueTeamPotion: [
      {
        position: { x: -15.16, y: 3.5 },
      },
      {
        position: { x: -11.5, y: 7.02 },
      },
    ],
    PileBox: [
      {
        position: { x: -14.88859, y: -9.175905 },
      },
      {
        position: { x: 6.94, y: 7.03 },
      },
    ],
    Helipad1: [
      {
        position: { x: -5.8, y: 6.08 },
      },
    ],

    Helipad2: [
      {
        position: { x: -4.04, y: -1.01 },
      },
    ],

    Helipad3: [
      {
        position: { x: -2.22, y: -8.038598 },
      },
    ],
    WoodBox: [
      {
        position: { x: -14.96, y: -7.726815 },
      },
      { position: { x: -13.38, y: -7.726815 } },
      {
        position: { x: -13.38, y: -9.33 },
      },
      {
        position: { x: 5.49, y: 7.01 },
      },
      {
        position: { x: 5.49, y: 5.51 },
      },
      {
        position: { x: 6.89, y: 5.51 },
      },
    ],
    IronBox: [
      {
        position: { x: -13.46, y: 7.43 },
      },
      {
        position: { x: -13.46, y: 6.41 },
      },
      {
        position: { x: -13.46, y: 5.4 },
      },
      {
        position: { x: -14.48, y: 5.4 },
      },
      {
        position: { x: -15.49, y: 5.4 },
      },
      {
        position: { x: 7.57, y: -7.37 },
      },
      {
        position: { x: 6.56, y: -7.37 },
      },
      {
        position: { x: 5.52, y: -7.37 },
      },
      {
        position: { x: 5.52, y: -8.36 },
      },
      {
        position: { x: 5.52, y: -9.26 },
      },
    ],
  },
  IceMap: {
    BaseTankAI: [
      {
        position: new Vector2(6.03, 5.9),
      },
      {
        position: new Vector2(5.12, -7.62),
      },
    ],
    TankSpawnPosition: [
      {
        position: new Vector2(-14, -6),
      },
      {
        position: new Vector2(-14, -8),
      },
      {
        position: new Vector2(-13, -6),
      },
      {
        position: new Vector2(-13, -8),
      },
      {
        position: new Vector2(-12, -6),
      },
      {
        position: new Vector2(-12, -8),
      },
    ],
    WoodBox: [
      {
        position: { x: 6.51, y: -7.52 },
      },
      {
        position: { x: -11.52, y: 3.59 },
      },
      {
        position: { x: -13.42, y: 7.47 },
      },
      {
        position: { x: -14.41, y: 6.45 },
      },
      {
        position: { x: -10.52, y: -1.48 },
      },
      {
        position: { x: -10.52, y: 0.97 },
      },
      {
        position: { x: -1.56, y: -0.47 },
      },
    ],
    IronBox: [
      {
        position: { x: 6.49, y: -8.46 },
      },
      {
        position: { x: -14.48, y: 7.5 },
      },
      {
        position: { x: -0.4705051, y: 1.120175 },
      },
      {
        position: { x: -0.4705051, y: -0.5 },
      },
      {
        position: { x: -0.4186823, y: -1.98 },
      },
    ],
    PileBox: [
      {
        position: { x: 5.99, y: 7.09 },
      },
      {
        position: { x: -8.99, y: -0.38 },
      },
    ],
    Helipad1: [
      {
        position: { x: -3.93, y: -7.02125 },
      },
    ],

    Helipad2: [
      {
        position: { x: 5.02, y: 0 },
      },
    ],

    Helipad3: [
      {
        position: { x: -3.93, y: 5.93 },
      },
    ],
    Helipad4: [
      {
        position: { x: -12.71063, y: 0 },
      },
    ],
    BlueTeamSmallTurret: [
      {
        position: { x: -1.9, y: -1.911464 },
      },
    ],
    Flag: [
      {
        position: { x: -4, y: -0.6 },
      },
    ],
    RedTeamSmallTurret: [
      {
        position: { x: -1.95, y: 1.120174 },
      },
    ],
  },
  FarmMap: {
    TankSpawnPosition: [
      {
        position: new Vector2(-10, -8),
      },
      {
        position: new Vector2(8, 2),
      },
      {
        position: new Vector2(-8.5, -9),
      },
      {
        position: new Vector2(6.5, 3),
      },
      {
        position: new Vector2(-10, -10),
      },
      {
        position: new Vector2(8, 4),
      },
    ],
    WoodBox: [
      {
        position: { x: -9.43, y: 4.56 },
      },
      { position: { x: -10.48, y: 4.58 } },
      {
        position: { x: -11.52, y: 3.59 },
      },
      {
        position: { x: 9.5, y: -10.45 },
      },
      {
        position: { x: 8.57, y: -10.45 },
      },
      {
        position: { x: 9.5, y: -9.44 },
      },
    ],

    Helipad1: [
      {
        position: { x: -5.999, y: 0.276 },
      },
    ],

    Helipad2: [
      {
        position: { x: -0.99, y: -2.99 },
      },
    ],

    Helipad3: [
      {
        position: { x: 4, y: -6.004 },
      },
    ],

    PileBox: [
      {
        position: { x: -4.2, y: 0.2 },
      },
      {
        position: { x: 2.28, y: -5.92 },
      },
    ],

    IronBox: [
      {
        position: { x: 3.22, y: 0.54 },
      },
      {
        position: { x: -5.24, y: -6.73 },
      },
    ],

    BlueTeamPotion: [
      {
        position: { x: -6.47, y: -6.73 },
      },
      {
        position: { x: -11.46, y: -0.48 },
      },
    ],

    RedTeamPotion: [
      {
        position: { x: 4.4, y: 0.55 },
      },
      {
        position: { x: 9.43, y: -5.52 },
      },
    ],

    BlueTeamSmallTurret: [
      {
        position: { x: -11.37, y: 1.05 },
        position: { x: -6, y: -10 },
      },
    ],

    RedTeamSmallTurret: [
      {
        position: { x: 9.46, y: -7.3 },
        position: { x: 4, y: 4 },
      },
    ],

    BlueTeamBigTurret: [
      {
        position: { x: -11.16, y: -3.91 },
      },
    ],

    RedTeamBigTurret: [
      {
        position: { x: 9.1, y: -1.96 },
      },
    ],
    RedTeamTankAI: [
      {
        position: { x: -3, y: 4 },
      },
    ],
    BlueTeamTankAI: [
      {
        position: { x: 0.07, y: -10.08 },
      },
    ],
  },
};

module.exports.props = {
  BaseRed: {
    username: "MainHouse",
    team: 2,
    isDead: false,
    health: 2000,
    maxHealth: 2000,
  },
  BaseBlue: {
    username: "MainHouse",
    team: 1,
    isDead: false,
    health: 2000,
    maxHealth: 2000,
  },
  Flag: {
    maxPoint: 50,
  },
  WoodBox: {
    type: "Wood",
    health: 250,
    isDead: false,
    maxHealth: 250,
    armor: 5,
  },
  PileBox: {
    type: "Pile",
    health: 300,
    isDead: false,
    maxHealth: 270,
    armor: 15,
  },
  IronBox: {
    type: "Iron",
    health: 350,
    isDead: false,
    maxHealth: 280,
    armor: 20,
  },
  Helipad1: {
    username: "Helipad",
    itemSpawnTicker: 0,
    itemSpawnTime: 0,
    coolDownTime: 9,
    isActive: false,
  },
  Helipad2: {
    username: "Helipad",
    itemSpawnTicker: 0,
    itemSpawnTime: 0,
    coolDownTime: 13,
    isActive: false,
  },
  Helipad3: {
    username: "Helipad",
    itemSpawnTicker: 0,
    itemSpawnTime: 0,
    coolDownTime: 17,
    isActive: false,
  },
  BlueTeamPotion: {
    username: "Hp_Potion",
    reHealTime: 10,
    reHealTicket: 0,
    coolDownTime: 15,
    isActive: true,
    health: 500,
    isDead: false,
    maxHealth: 500,
    reSpawnTime: 0,
    reSpawnTicket: 0,
    healAmount: 50,
    team: 1,
    healing: {
      value: -20,
      times: 15,
      waiting: 0.3,
    },
  },
  RedTeamPotion: {
    username: "Hp_Potion",
    reHealTime: 10,
    reHealTicket: 0,
    coolDownTime: 15,
    isActive: true,
    health: 500,
    isDead: false,
    maxHealth: 500,
    reSpawnTime: 0,
    reSpawnTicket: 0,
    healAmount: 50,
    team: 2,
    healing: {
      value: -20,
      times: 15,
      waiting: 0.3,
    },
  },
  RedTeamTankAI: {
    AIBase: [2, { ...tankAi2 }, 2],
    aiId: "01",
    username: "AI_Tank",
    hasTarget: false,
    iscommback: false,
    rotation: 0,
    canShoot: false,
    currentTime: 0,
  },
  BaseTankAI: {
    AIBase: [2, { ...tankAi2 }, 0],
    aiId: "01",
    username: "AI_Tank",
    hasTarget: false,
    iscommback: false,
    rotation: 0,
    canShoot: false,
    currentTime: 0,
  },
  BlueTeamTankAI: {
    AIBase: [2, { ...tankAi2 }, 1],
    aiId: "01",
    username: "AI_Tank",
    hasTarget: false,
    iscommback: false,
    rotation: 0,
    canShoot: false,
    currentTime: 0,
  },
  TankAI: {
    AIBase: [2, { ...tankAi }, 0],
    aiId: "01",
    username: "AI_Tank",
    hasTarget: false,
    iscommback: false,
    rotation: 0,
    canShoot: false,
    currentTime: 0,
  },
  BlueTeamBigTurret: {
    AIBase: [{ ...tankAi }, 1],
    aiId: "01",
    username: "AI_TOWER",
    hasTarget: false,
    rotation: 0,
    canShoot: false,
    currentTime: 0,
  },
  RedTeamBigTurret: {
    AIBase: [{ ...tankAi }, 2],
    aiId: "02",
    username: "AI_TOWER",
    hasTarget: false,
    rotation: 180,
    canShoot: false,
    currentTime: 0,
  },
  BlueTeamSmallTurret: {
    AIBase: [{ ...tankAi }, 1],
    aiId: "03",
    username: "AI_TOWER",
    hasTarget: false,
    rotation: 0,
    canShoot: false,
    currentTime: 0,
  },
  RedTeamSmallTurret: {
    AIBase: [{ ...tankAi }, 2],
    aiId: "04",
    username: "AI_TOWER",
    hasTarget: false,
    rotation: 180,
    canShoot: false,
    currentTime: 0,
  },
};

module.exports.buffItem = {
  BuffArmorItem: {
    type: "Armor",
    armorUp: {
      value: 1,
      time: 8,
    },
  },
  BuffDamageItem: {
    type: "Damage",
    damageUp: {
      value: 1,
      time: 7,
    },
  },
  FastSpeedItem: {
    type: "Speed",
    speedUp: {
      value: -0.5,
      time: 8,
    },
  },
  HealHpItem: {
    type: "Hp",
    healing: {
      value: -240,
      waiting: 0.3,
      times: 2,
    },
  },
};
