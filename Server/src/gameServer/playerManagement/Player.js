const GameMechanism = require("../gamePlay/GameMechanism");
const Vector2 = require("../../dto/Vector2");

class Player {
  constructor({ username, id }) {
    this.username = username;
    this.id = id;
    this.position = new Vector2();
    this.lobby = 0; // Id cua lobby
    this.team = 0;
    this.tankRotation = 0;
    this.berrelRotaion = 0;
    this.tank;
    this.health;
    this.isDead = false;
    this.respawnTicker = 0;
    this.respawnTime = 0;
    this.kill = 0;
    this.dead = 0;
    this.maxHealth = 800;
    this.effect = {
      // bat loi
      slowled: {
        value: 0,
        time: 0,
      }, // lam cham  vd {value : 0.2 , time : 10}
      stunned: 0, // thoi gian bi lam choang ko dung dc chieu ko ban dc
      tiedUp: 0, // thoi gian bi troi van dung dc chieu vs ban dc
      burned: {
        value: 0, // dame moi lan dot
        times: 0, // so lan dot
        waiting: 0, // time giua moi lan dot
      },
      // hieu ung co loi

      healing: {
        value: 0, // value mau moi lan hoi
        times: 0, // so lan hoi mau
        waiting: 0, // time giua moi lan hoi mau
      },

      // tang toc do di chuyen
      speedUp: {
        value: 0, // %
        time: 0,
      },

      // tang mau ao
      virtualBlood: {
        value: 0, // %
        time: 0,
      },
      // tang dame
      damagedUp: {
        value: 0, // %
        time: 0,
      },
      // tang giap
      armorUp: {
        value: 0, // %
        time: 0,
      },
      // tang toc danh
      attackSpeedUp: {
        value: 0, // %
        time: 0,
      },
    }
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
  healHp() {
 
    this.respawnTicker += 1;
    if (this.respawnTicker >= (this.effect.healing.waiting-0.01)* 10) {
      this.health += this.effect.healing.value;
      if (this.health >= this.maxHealth) {
        this.health = this.maxHealth;
        return true;
      }
      this.respawnTicker = 0;
      this.respawnTime += 1;
      if (this.respawnTime >= this.effect.healing.times) {
        this.respawnTicker = 0;
        this.respawnTime = 0;
        return true;
      }
    }
    return false;
  }
}

module.exports = Player;
