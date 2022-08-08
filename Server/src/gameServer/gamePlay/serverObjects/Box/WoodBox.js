const BaseBox = require("./BaseBox");
module.exports = class WoodBox extends BaseBox {
  constructor() {
    super();
    this.type = "Wood";
    this.health = 250;
    this.isDead = false;
    this.maxHealth = 250;
    this.armor = 5;
  }
};
