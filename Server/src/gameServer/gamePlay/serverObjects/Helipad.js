const ServerObject = require("./ServerObject");
module.exports = class Helipad extends ServerObject {
    constructor(coolDownTime1 = 2){
        super();
        this.username = "Helipad";
        this.itemSpawnTicker = 0;
        this.itemSpawnTime = 0;
        this.coolDownTime = coolDownTime1;
        this.isActive = false;
    }
    coolDown() {    
        this.itemSpawnTicker += 1;
        if (this.itemSpawnTicker >= 10) {
          this.itemSpawnTicker = 0;
          this.itemSpawnTime += 1;
          if (this.itemSpawnTime >= this.coolDownTime) {
            this.isActive = true;
            this.itemSpawnTicker = 0;
            this.itemSpawnTime = 0;
            return true;
          }
        }
        return false;
      }
}