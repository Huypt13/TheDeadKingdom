const Vector2 = require("../../../dto/Vector2");
const ServerObject = require("./ServerObject");
const MethodExtensions = require("../../../utility/MethodExtensions");

module.exports = class Bullet extends ServerObject {
  constructor(Position, Tank, Direction) {
    super();
    this.name = "Bullet";
    this.direction = { ...Direction };
    this.speed = Tank?.bulletSpeed || 0.5;
    this.shootingRange = Tank?.shootingRange || 3;
    this.isDestroyed = false;
    this.tank = { ...Tank };
    this.team = 0;
    this.activator = "";
    this.position = { ...Position };
    this.oldPosition = { ...Position };
  }

  onUpdate() {
    this.position.x += this.direction.x * this.speed;
    this.position.y += this.direction.y * this.speed;

    if (
      MethodExtensions.TwoDecimals(
        new Vector2(this.position.x, this.position.y).Distance(
          new Vector2(this.oldPosition.x, this.oldPosition.y)
        )
      ) >=
      this.shootingRange - 0.1
    ) {
      this.isDestroyed = true;
    }

    return this.isDestroyed;
  }

  onUpdate2() {
    this.position.x += this.direction.x * this.speed;
    this.position.y += this.direction.y * this.speed;

    if (
      MethodExtensions.TwoDecimals(
        new Vector2(this.position.x, this.position.y).Distance(
          new Vector2(this.oldPosition.x, this.oldPosition.y)
        )
      ) >=
      20 * this.shootingRange - 0.1
    ) {
      return true;
    }
    return false;
  }
};
