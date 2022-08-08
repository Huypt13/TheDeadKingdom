const ServerObject = require("./ServerObject");
const GameMechanism = require("../GameMechanism");

module.exports = class MainHouse extends ServerObject {
  constructor() {
    super();
    this.username = "MainHouse";
    this.team;
    this.isDead = false;
    this.health;
    this.maxHealth;
  }

  dealDamage(amount) {
    console.log("amount1 is", amount);
    this.health -= GameMechanism.getDame(this, amount);
    console.log("Health is: " + this.health);
    if (this.health <= 0) {
      this.isDead = true;
      return this.isDead;
    }
    return false;
  }
};
