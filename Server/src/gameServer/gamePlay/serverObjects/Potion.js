const Vector2 = require("../../../dto/Vector2");
const ServerObject = require("./ServerObject");
const GameMechanism = require("../GameMechanism");
module.exports = class Potion extends ServerObject {
  constructor(Team) {
    super();
    this.username;
    this.reHealTime;
    this.reHealTicket;
    this.coolDownTime;
    this.isActive;
    this.health;
    this.isDead;
    this.maxHealth;
    this.reSpawnTime;
    this.reSpawnTicket;
    this.healAmount;
    this.team;
    this.healing;
  }

  dealDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.isDead = true;
      this.isActive = false;
      return this.isDead;
    }
    console.log("Health is: " + this.health);
    return false;
  }
  coolDown() {
    this.reHealTime += 1;
    if (this.reHealTime >= 10) {
      this.reHealTime = 0;
      this.reHealTicket += 1;
      if (this.reHealTicket >= this.coolDownTime) {
        this.isActive = true;
        this.reHealTime = new Number(0);
        this.reHealTicket = new Number(0);
        return this.isActive;
      }
    }
    return false;
  }
  random2Numeric(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
  }
};
