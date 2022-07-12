const BaseItem = require("./BaseItem")
module.exports = class TripleBulletItem extends BaseItem {
    constructor(){
        super();
        this.type = "tripleBullet";
        // this.buff = {
        //     value: 0, 
        //     times: 0,
        //   }
    }
}