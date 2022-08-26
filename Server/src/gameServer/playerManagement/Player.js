const GameMechanism = require("../gamePlay/GameMechanism");
const Vector2 = require("../../dto/Vector2");
const GameInfor = require("../../helper/GameInfor.helper");

class Player {
  constructor({ username, id, _id }) {
    this.username = username;
    this.id = id; // token ng choi
    this._id = _id; // _id real
    this.isOnline;
    this.position = new Vector2();
    this.lobby = 0; // Id cua lobby
    this.team = 0;
    this.tankRotation = 0;
    this.berrelRotaion = 0;
    this.tank;
    this.startTank;
    this.health;
    this.isDead = false;
    this.respawnTime = 0;
    this.healTicker = 0;
    this.healTime = 0;
    this.kill = 0;
    this.dead = 0;
    this.maxHealth = 800;
    this.spawnPos = new Vector2(0, 0);
    this.effect = {
      // bat loi
      slowled: [], // lam cham  vd {id : xxx ,value : 0.2 , time : 10}
      stunned: [], // thoi gian bi lam choang ko dung dc chieu ko ban dc
      tiedUp: [], // thoi gian bi troi van dung dc chieu vs ban dc
      burned: [],
      autoMove: null, // {id, speed , startPost, direction , range} // speed moi 0.1s
      focusOn: null, // {id, focusId ,speed}
      // hieu ung co loi
      threeBullet: 0,
      healing: {
        value: 0, // value mau moi lan hoi
        times: 0, // so lan hoi mau
        waiting: 0, // time giua moi lan hoi mau
      },

      // tang toc do di chuyen
      speedUp: [], // gop cung slowed luon
      // tang mau ao
      virtualBlood: [],
      // tang dame
      damagedUp: [],
      // tang giap
      armorUp: [],
      // tang toc danh
      attackSpeedUp: [],
    };
  }
  dealDamage(amount) {
    console.log(`DealDame ${GameMechanism.getDame(this.tank, amount)}`, amount);
    if (!amount) {
      console.log("amount null");
      amount = 0;
    }
    this.health -= GameMechanism.getDame(this.tank, amount);
    if (this.health <= 0) {
      this.isDead = true;
      this.respawnTime = 0;
      this.deadResetEffect();
    }
    return this.isDead;
  }

  respawnCounter() {
    const tank = this.tank;
    this.respawnTime += 0.1;
    if (this.respawnTime >= GameInfor.PlayerRespawnTime * this.dead) {
      this.isDead = false;
      this.respawnTime = 0;
      this.health = tank.health;
      return true;
    }
    return false;
  }

  onAutoMoveCounter(connection) {
    let endEf = []; // list hieu ung ket thuc
    if (!this.effect.autoMove) {
      endEf.push(this.effect.autoMove);
    }
    return { endEf: endEf };
  }

  onFocusOnCounter(lobby) {
    let endEf = []; // list hieu ung ket thuc
    const focus = lobby.connections.find((c) => {
      return c.player.id === this.effect.focusOn.focusId;
    });
    const direction = new Vector2(
      focus.player.position.x - this.position.x,
      focus.player.position.y - this.position.y
    ).Normalized();
    this.position.x += (this.effect.focusOn.speed / 10) * direction.x;
    this.position.y += (this.effect.focusOn.speed / 10) * direction.y;

    if (this.position.Distance(focus.player.position) <= 0.5) {
      endEf.push(this.effect.focusOn);
      lobby.connections[0].socket.emit("endFocusOn", { id: this.id });
      lobby.connections[0].socket.broadcast
        .to(lobby.id)
        .emit("endFocusOn", { id: this.id });

      this.effect.focusOn = null;
    } else {
      lobby.connections[0].socket.emit("updatePosition", { ...this, type: 0 });
      lobby.connections[0].socket.broadcast
        .to(lobby.id)
        .emit("updatePosition", { ...this, type: 0 });
    }

    return { endEf: endEf };
  }

  onBurnCounter(lobby) {
    let endEf = []; // list effect ket thuc trong lan update
    let healthChange = false;
    if (this.isDead) {
      return;
    }
    this.effect.burned.forEach((burn) => {
      burn.countTime += 0.1;
      if (burn.countTime >= burn.waiting - 0.01) {
        healthChange = true;
        burn.countTime = 0;
        burn.times--;
        if (burn.value < 0 && this.health >= this.maxHealth) {
          burn.times = 0;
          this.health = this.maxHealth;
        }
        if (burn.times <= 0) {
          endEf.push(burn);
        } else {
          this.health -= GameMechanism.getDame(this.tank, burn.value);
          if (this.health <= 0) {
            this.isDead = true;
            this.deadResetEffect();
            const activator = lobby.skill.find((sk) => {
              sk.id == burn.id;
            })?.activator;
            lobby.deadUpdate(lobby.connections[0], this, activator);
            return;
          }
        }
      }
    });
    if (endEf.length > 0) {
      endEf.forEach((ef) => {
        let index = this.effect.burned.indexOf(ef);
        if (index > -1) {
          console.log("remove burn index", index, ef.id);
          this.effect.burned.splice(index, 1);
        }
      });
    }
    return {
      endEf,
      healthChange,
    };
  }
  onSlowCounter() {
    let endEf = [];
    let totalSlowed = 0;
    this.effect.slowled.forEach((ef) => {
      ef.time -= 0.1;
      if (ef.time < 0) {
        endEf.push(ef);
      } else {
        totalSlowed += ef.value;
      }
    });
    if (endEf.length > 0) {
      endEf.forEach((ef) => {
        let index = this.effect.slowled.indexOf(ef);
        console.log("remove slow index", index, ef.id);
        this.effect.slowled.splice(index, 1);
      });
    }
    this.tank.speed = this.startTank.speed * (1 - Math.min(0.9, totalSlowed));

    return {
      endEf: endEf,
    };
  }
  onAttackUpCounter() {
    let endEf = []; // list hieu ung ket thuc
    let total = 0;
    this.effect.attackSpeedUp.forEach((ef) => {
      ef.time -= 0.1;
      if (ef.time < 0) {
        endEf.push(ef);
      } else {
        total += ef.value;
      }
    });
    if (endEf.length > 0) {
      endEf.forEach((ef) => {
        let index = this.effect.attackSpeedUp.indexOf(ef);
        console.log("remove attackSpeedUp index", index, ef.id);
        this.effect.attackSpeedUp.splice(index, 1);
      });
    }
    let atReal = 1 / this.startTank.attackSpeed;
    this.tank.attackSpeed = 1 / (atReal * (1 + Math.max(total, -0.8)));
    return {
      endEf: endEf,
    };
  }
  onDamagedUpCounter() {
    let endEf = []; // list hieu ung ket thuc
    let dameUp = 0;
    this.effect.damagedUp.forEach((ef) => {
      ef.time -= 0.1;
      if (ef.time < 0) {
        endEf.push(ef);
      } else {
        dameUp += ef.value;
      }
    });
    if (endEf.length > 0) {
      endEf.forEach((ef) => {
        let index = this.effect.damagedUp.indexOf(ef);
        console.log("remove  dameup index", index, ef.id);
        this.effect.damagedUp.splice(index, 1);
      });
    }
    this.tank.damage = this.startTank.damage * (1 + Math.max(-0.8, dameUp));

    return {
      endEf,
    };
  }
  onArmorUpCounter() {
    let endEf = []; // list hieu ung ket thuc
    let armorUp = 0;
    this.effect.armorUp.forEach((ef) => {
      ef.time -= 0.1;
      if (ef.time < 0) {
        endEf.push(ef);
      } else {
        armorUp += ef.value;
      }
    });
    if (endEf.length > 0) {
      endEf.forEach((ef) => {
        let index = this.effect.armorUp.indexOf(ef);
        console.log("remove  stunned index", index, ef.id);
        this.effect.armorUp.splice(index, 1);
      });
    }
    this.tank.armor = this.startTank.armor * (1 + Math.max(-0.8, armorUp));

    return {
      endEf,
    };
  }

  onStunnedCounter() {
    let endEf = []; // list hieu ung ket thuc
    this.effect.stunned.forEach((ef) => {
      ef.time -= 0.1;
      if (ef.time < 0) {
        endEf.push(ef);
      }
    });
    if (endEf.length > 0) {
      endEf.forEach((ef) => {
        let index = this.effect.stunned.indexOf(ef);
        console.log("remove  stunned index", index, ef.id);
        this.effect.stunned.splice(index, 1);
      });
    }

    return {
      endEf,
      stunned: this.effect.stunned.length == 0 ? false : true,
    };
  }

  onTiedupCounter() {
    let endEf = []; // list hieu ung ket thuc
    this.effect.tiedUp.forEach((ef) => {
      ef.time -= 0.1;
      if (ef.time < 0) {
        endEf.push(ef);
      }
    });
    if (endEf.length > 0) {
      endEf.forEach((ef) => {
        let index = this.effect.tiedUp.indexOf(ef);
        console.log("remove  tiedup index", index, ef.id);
        this.effect.tiedUp.splice(index, 1);
      });
    }

    return {
      endEf,
      tiedUp: this.effect.tiedUp.length == 0 ? false : true,
    };
  }
  onThreeBulletCouter() {
    this.effect.threeBullet -= 0.1;
    if (this.effect.threeBullet < 0) {
      this.effect.threeBullet = 0;
    }
  }
  onSkillCounter(connection) {
    if (!this.tank) {
      return;
    }

    let [time1, time2, time3, timeFull1, timeFull2, timeFull3] = [
      this.tank.skill1.timeCounter,
      this.tank.skill2.timeCounter,
      this.tank.skill3.timeCounter,
      this.startTank.skill1.timeCounter,
      this.startTank.skill2.timeCounter,
      this.startTank.skill3.timeCounter,
    ];
    //skill1
    if (time1 != 0) {
      this.tank.skill1.timeCounter -= 0.1;
      if (this.tank.skill1.timeCounter < 0) {
        this.tank.skill1.timeCounter = 0;
      }
    }
    //skill2
    if (time2 != 0) {
      this.tank.skill2.timeCounter -= 0.1;
      if (this.tank.skill2.timeCounter < 0) {
        this.tank.skill2.timeCounter = 0;
      }
    }
    //skill3
    if (time3 != 0) {
      this.tank.skill3.timeCounter -= 0.1;
      if (this.tank.skill3.timeCounter < 0) {
        this.tank.skill3.timeCounter = 0;
      }
    }
    const returnData = {
      time1,
      time2,
      time3,
      timeFull1,
      timeFull2,
      timeFull3,
    };

    connection.socket.emit("updateTimeSkill", returnData);
  }

  deadResetEffect() {
    this.tankRotation = 0;
    this.berrelRotaion = 0;
    this.tank = JSON.parse(JSON.stringify(this.startTank));
    this.tank.skill1.timeCounter = 0.2;
    this.tank.skill2.timeCounter = 0.2;
    this.tank.skill3.timeCounter = 0.2;
    this.effect = {
      // bat loi
      slowled: [], // lam cham  vd {value : 0.2 , time : 10}
      stunned: [], // thoi gian bi lam choang ko dung dc chieu ko ban dc
      tiedUp: [], // thoi gian bi troi van dung dc chieu vs ban dc
      burned: [],
      // hieu ung co loi
      autoMove: null, // {id, speed , startPost, direction , range}
      focusOn: null, // {id, focusId ,speed}
      // hieu ung co loi
      threeBullet: 0,
      healing: {
        value: 0, // value mau moi lan hoi
        times: 0, // so lan hoi mau
        waiting: 0, // time giua moi lan hoi mau
      },

      // tang toc do di chuyen
      speedUp: [],

      // tang mau ao
      virtualBlood: [],
      // tang dame
      damagedUp: [],
      // tang giap
      armorUp: [],
      // tang toc danh
      attackSpeedUp: [],
    };
  }
  setInitValue() {
    this.kill = 0;
    this.dead = 0;
    this.isDead = false;
    this.respawnTime = 0;
    this.tankRotation = 0;
    this.berrelRotaion = 0;
    this.deadResetEffect();
  }
}

module.exports = Player;
