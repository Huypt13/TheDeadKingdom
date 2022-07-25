const BaseBox = require("./BaseBox");
module.exports = class IronBox extends BaseBox {
    constructor(){
        super();
        this.type = "Pile";
        this.health = 250;
        this.isDead = false;
        this.maxHealth = 250;
        this.armor = 7;
    }
}