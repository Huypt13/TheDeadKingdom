const ServerItem = require("../../utility/ServerItem");
const Vector2 = require("../../dto/Vector2");

module.exports = class AIBase extends ServerItem {
  constructor(maxHealth, OldPosition, Team) {
    super();
    this.team = Team || 0;
    this.username = "AI_Base";
    this.oldPosition = OldPosition;
    this.health = maxHealth;
    this.maxHealth = maxHealth;
    this.isDead = false;
    this.respawnTicker = new Number(0);
    this.respawnTime = new Number(0);
    this.kill = 0;
  }

  onUpdate(onUpdateAI) {
    //Calculate Statemachine
  }

  onObtainTarget(connections) {}

  respawnCounter() {
    this.respawnTicker = this.respawnTicker + 1;

    if (this.respawnTicker >= 10) {
      this.respawnTicker = new Number(0);
      this.respawnTime = this.respawnTime + 1;

      //Three second respond time
      if (this.respawnTime >= 3) {
        console.log("Respawning AI: " + this.id);
        this.isDead = false;
        this.respawnTicker = new Number(0);
        this.respawnTime = new Number(0);
        this.health = this.maxHealth;
        this.position = new Vector2(this.oldPosition.x, this.oldPosition.y);

        return true;
      }
    }

    return false;
  }

  dealDamage(amount = Number) {
    //Adjust Health on getting hit

    this.health = this.health - amount;

    //Check if we are dead
    if (this.health <= 0) {
      this.isDead = true;
      this.respawnTicker = new Number(0);
      this.respawnTime = new Number(0);
    }

    return this.isDead;
  }

  radiansToDegrees() {
    return new Number(57.29578); //360 / (PI * 2);
  }

  degreesToRadians() {
    return new Number(0.01745329); //(PI * 2) / 360;
  }

  worldUpVector() {
    return new Vector2(0, -1);
  }

  getAngleDifference(one, two) {
    let diff = ((two - one + 180) % 360) - 180;
    return diff < -180 ? diff + 360 : diff;
  }
};
