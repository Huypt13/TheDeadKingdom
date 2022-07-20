const Vector2 = require("../../../dto/Vector2");
const ServerObject = require("./ServerObject");
const MethodExtensions = require("../../../utility/MethodExtensions");

// skill dinh huong
module.exports = class SkillOrientation extends ServerObject {
  constructor() {
    super();
    this.isDestroyed = false;
    this.playerImpacted = [];
    this.timeRemain;
    this.skill;
    this.afterDestroy = function () {};
  }

  onUpdate() {
    this.timeRemain -= 0.1;
    if (this.timeRemain < 0) {
      console.log("afterdestroy", this.afterDestroy);
      this.afterDestroy(this.skill);
      this.isDestroyed = true;
    }
    return this.isDestroyed;
  }
};
