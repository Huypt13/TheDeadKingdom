const Vector2 = require('../../dto/Vector2')


const tankAi = {
  speed: 0.15,
  rotationSpeed: 0.3,
  damage: 80,
  health: 1000,
  attackSpeed: 1,
  bulletSpeed: 1,
  shootingRange: 4,
};
module.exports.map = {
  FarmMap: {
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
      }
    ],

    Helipad2: [{
      position: { x: -0.99, y: -2.99 },
    }
    ],

    Helipad3: [{
      position: { x: 4, y: -6.004 },
    }
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
      },
    ],

    RedTeamSmallTurret: [
      {
        position: { x: 9.46, y: -7.3 },
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
        position: { x: -3, y: 4 }
      }
    ],
  }
}

module.exports.props = {
  WoodBox: { type: "Wood", health: 250, isDead: false, maxHealth: 250, armor: 5 },
  PileBox: { type: "Pile", health: 300, isDead: false, maxHealth: 270, armor: 15 },
  IronBox: { type: "Iron", health: 350, isDead: false, maxHealth: 280, armor: 20 },
  Helipad1: { username: "Helipad", itemSpawnTicker: 0, itemSpawnTime: 0, coolDownTime: 9, isActive: false },
  Helipad2: { username: "Helipad", itemSpawnTicker: 0, itemSpawnTime: 0, coolDownTime: 13, isActive: false },
  Helipad3: { username: "Helipad", itemSpawnTicker: 0, itemSpawnTime: 0, coolDownTime: 17, isActive: false },
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
    }
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
    }
  },
  RedTeamTankAI: {
    AIBase: [2, { ...tankAi }, 2],
    aiId: "01",
    username: "AI_Tank",
    hasTarget: false,
    iscommback: false,
    rotation: 0,
    canShoot: false,
    currentTime: 0,
  },
  BlueTeamTankAI: {
    AIBase: [2, { ...tankAi }, 1],
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
}

module.exports.buffItem = {
  BuffArmorItem: {
    type: "Armor",
    armorUp: {
      value: 1,
      time: 8,
    }
  },
  BuffDamageItem: {
    type: "Damage",
    damageUp: {
      value: 1,
      time: 7,
    }
  },
  FastSpeedItem: {
    type: "Speed",
    speedUp: {
      value: -0.5,
      time: 8,
    }
  },
  HealHpItem: {
    type: "Hp",
    healing: {
      value: -240,
      waiting: 0.3,
      times: 2
    }
  }
}


