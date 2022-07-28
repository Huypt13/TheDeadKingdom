const ServerObject = require("../ServerObject");
module.exports = class BaseItem extends ServerObject {
    constructor(){
        super();
        this.lifeTime = 0;
        this.username = "buffItem"
        this.lifeTicker = 0;
        this.existTime = 10;
        this.isActive = false;
    }
    existTimeCouter(){
        this.lifeTicker += 1;
        if(this.lifeTicker >= 10){
            this.lifeTicker = 0;
            this.lifeTime += 1;
            if(this.lifeTime >= this.existTime){
                this.lifeTime = 0;
                this.isActive = false;
                return false;
            }
        }
        return true;
    }

}