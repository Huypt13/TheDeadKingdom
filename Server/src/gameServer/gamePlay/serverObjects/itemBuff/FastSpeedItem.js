const BaseItem = require("./BaseItem")
module.exports = class FastSpeedItem extends BaseItem {
    constructor(){
        super();
        this.type = "Speed";
        // this.buff = {
        //     value: 240, 
        //     times: 0,
        //   }
    }
}