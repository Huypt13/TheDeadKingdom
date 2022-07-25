const ServerObject = require("../ServerObject");
const GameMechanism = require("../../GameMechanism")
module.exports = class BaseBox extends ServerObject {
  constructor(Team) {
    super();
    this.username = "Box";
  }

  dealDamage(amount) {
    this.health -= GameMechanism.getDame(this, amount);
    if (this.health <= 0) {
      this.isDead = true;
      this.isActive = false;
      this.health = this.maxHealth;
      return this.isDead;
    }
    console.log("Health is: " + this.health);
    return false;
  }
};
