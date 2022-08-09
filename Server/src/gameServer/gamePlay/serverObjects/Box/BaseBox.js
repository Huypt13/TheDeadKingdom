const ServerObject = require("../ServerObject");
const GameMechanism = require("../../GameMechanism");
module.exports = class BaseBox extends ServerObject {
  constructor() {
    super();
    this.username = "Box";
    this.type;
    this.health;
    this.isDead;
    this.maxHealth;
    this.armor;
  }

  dealDamage(amount) {
    this.health -= GameMechanism.getDame(this, amount);
    if (this.health <= 0) {
      this.isDead = true;
      this.health = this.maxHealth;
      return this.isDead;
    }
    return false;
  }
};

