const GameMechanism = require("../gamePlay/GameMechanism");
const Vector2 = require("../../dto/Vector2");

class Player {
  constructor({ username, id }) {
    this.username = username;
    this.id = id;
    this.position = new Vector2();
    this.lobby = 0; // Id cua lobby
    this.tankRotation = 0;
    this.berrelRotaion = 0;
    this.tank;
    this.health;
    this.isDead = false;
    this.respawnTicker = 0;
    this.respawnTime = 0;
  }
  dealDamage(amount) {
    console.log(`DealDame ${GameMechanism.getDame(this.tank, amount)}`);
    this.health -= GameMechanism.getDame(this.tank, amount);
    if (this.health <= 0) {
      this.isDead = true;
      this.respawnTicker = 0;
      this.respawnTime = 0;
    }
    return this.isDead;
  }
  respawnCounter() {
    const tank = this.tank;
    this.respawnTicker += 1;
    if (this.respawnTicker >= 20) {
      this.respawnTicker = 0;
      this.respawnTime += 1;
      if (this.respawnTime >= 3) {
        this.isDead = false;
        this.respawnTicker = 0;
        this.respawnTime = 0;
        this.health = tank.health;
        return true;
      }
    }
    return false;
  }
}

module.exports = Player;
