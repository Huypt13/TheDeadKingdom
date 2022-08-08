const ServerObject = require("./ServerObject");
module.exports = class Helipad extends ServerObject {
    constructor(){
        super();
        this.username;
        this.itemSpawnTicker;
        this.itemSpawnTime;
        this.coolDownTime;
        this.isActive;
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