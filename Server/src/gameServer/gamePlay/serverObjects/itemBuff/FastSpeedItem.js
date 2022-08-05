const BaseItem = require("./BaseItem");
module.exports = class FastSpeedItem extends BaseItem {
  constructor() {
    super();
    this.speedUp;
  }
  buffSpeed(connection, data, lobby) {
    const enemyId = data.enemyId;
    const id = data.id;
    const subjectOfAttack = connection.player;
    subjectOfAttack.effect.slowled.push({
      id,
      value: this.speedUp.value,
      time: this.speedUp.time,
    });

    connection.socket.emit("itemEffectAnimation", {
      enemyId,
      efId: id,
      remove: true,
    });
    connection.socket.broadcast.to(lobby.id).emit("itemEffectAnimation", {
      enemyId,
      efId: id,
      remove: true,
    });

    const totalSlowed = subjectOfAttack.effect.slowled.reduce((pre, cur) => {
      return pre + cur.value;
    }, 0);
    subjectOfAttack.tank.speed =
      subjectOfAttack.startTank.speed * (1 - Math.min(totalSlowed, 0.9));
    const returnData1 = {
      id: enemyId,
      speed: subjectOfAttack.tank.speed,
    };
    console.log("touch speed", returnData1);
    connection.socket.emit("changeSpeed", returnData1);
    connection.socket.broadcast.to(lobby.id).emit("changeSpeed", returnData1);
  }
};
