const ServerObject = require("./ServerObject");
module.exports = class WoodBox extends ServerObject {
  constructor(Team) {
    super();
    this.username = "WoodBox";
    this.health = 250;
    this.isDead = false;
    this.maxHealth = 250;
  }

  dealDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.isDead = true;
      this.isActive = false;
      // this.position = new Vector2(this.random2Numeric(-3,1),this.random2Numeric(-8,8));
      this.health = this.maxHealth;
      return this.isDead;
    }
    console.log("Health is: " + this.health);
    return false;
  }

  random2Numeric(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
  }
};
