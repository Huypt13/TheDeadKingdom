const BaseBox = require("./BaseBox");
module.exports = class IronBox extends BaseBox {
  constructor() {
    super();
    this.type = "Iron";
    this.health = 280;
    this.isDead = false;
    this.maxHealth = 280;
    this.armor = 10;
  }
};
