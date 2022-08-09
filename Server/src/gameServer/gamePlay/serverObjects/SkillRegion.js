const Vector2 = require("../../../dto/Vector2");
const ServerObject = require("./ServerObject");
const MethodExtensions = require("../../../utility/MethodExtensions");

// skill dinh huong
module.exports = class SkillOrientation extends ServerObject {
  constructor(Position, Skill) {
    super();
    this.isDestroyed = false;
    this.skill = { ...Skill };
    this.team = 0;
    this.activator = "";
    this.position = { ...Position };
    this.direction;
    this.timeRemain;
    this.isWait = false;
  }

  onUpdate() {
    this.timeRemain -= 0.1;
    if (this.timeRemain < 0) {
      this.isDestroyed = true;
    }
    return this.isDestroyed;
  }
};
