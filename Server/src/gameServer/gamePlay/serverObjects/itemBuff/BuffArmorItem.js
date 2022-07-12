const BaseItem = require("./BaseItem")
module.exports = class BuffArmorItem extends BaseItem {
    constructor(){
        super();
        this.type = "Armor";
        // this.buff = {
        //     value: 240, 
        //     times: 0,
        //   }
    }
}