const Vector2 = require("../../../dto/Vector2");
const ServerObject = require("./ServerObject");
const GameMechanism = require("../GameMechanism");
module.exports = class Potion extends ServerObject {
    constructor(Team){
        super();
        this.username = "WoodBox";
        this.health = 50;
        this.isDead = false;
        this.maxHealth = 50;    
    }


    dealDamage(amount) {
        this.health -=  amount;
        if (this.health <= 0) {
            this.isDead = true;    
            this.isActive = false;
            // this.position = new Vector2(this.random2Numeric(-3,1),this.random2Numeric(-8,8));
            this.health = this.maxHealth;
            return this.isDead;
            
        }
        console.log("Health is: "+ this.health);
        return false;
    }
   
    random2Numeric(min, max) {
        return Math.round(Math.random() * (max - min)) + min;
    }
    
}