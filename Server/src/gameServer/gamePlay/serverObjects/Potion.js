const Vector2 = require("../../../dto/Vector2");
const ServerObject = require("./ServerObject");
const GameMechanism = require("../GameMechanism");
module.exports = class Potion extends ServerObject {
    constructor(){
        super();
        this.reHealTime = 10;
        this.reHealTicket = 0;
        this.coolDownTime = 15;
        this.isActive = true;
        this.health = 50;
        this.isDead = false;
        this.reSpawnTime = 0;
        this.reSpawnTicket  = 0;
        this.healAmount = 50;
        this.team = 7;
        this.healing = {
            value: 50, // value mau moi lan hoi
            times: 15, // so lan hoi mau
            waiting: 1, // time giua moi lan hoi mau
          }
    }


    dealDamage(amount) {
        this.health -=  amount;
        if (this.health <= 0) {
            this.isDead = true;    
            this.isActive = false;
            // this.position = new Vector2(this.random2Numeric(-3,1),this.random2Numeric(-8,8));
            this.health = new Number(30);
            return this.isDead;
            
        }
        console.log("Health is: "+ this.health);
        return false;
    }
    reSpawn() {
        this.reSpawnTime += 1;
        if(this.reSpawnTime>= 10) {
            this.reSpawnTime = 0;
            this.reSpawnTicket += 1;
            if(this.reSpawnTicket >=4){
                this.reSpawnTime = new Number(0);
                this.reSpawnTicket = new Number(0);
                this.isDead = false;
                this.isActive = true;
                return this.isDead ;
            }
        }
        return true;
    }
    coolDown() {
        this.reHealTime += 1;
        if(this.reHealTime >= 10) {
            this.reHealTime = 0;
            this.reHealTicket += 1;
            if(this.reHealTicket >= this.coolDownTime){
                this.isActive = true;
                this.reHealTime = new Number(0);
                this.reHealTicket = new Number(0);
                return this.isActive ;
            }
        }
        return false;
    }
    random2Numeric(min, max) {
        return Math.round(Math.random() * (max - min)) + min;
    }
    
}