const ServerObject = require("../ServerObject");
module.exports = class BaseItem extends ServerObject {
    constructor(){
        super();
        this.username = "BuffItem";
        this.ownerId;
        this.isActive = false;
    }
   

}