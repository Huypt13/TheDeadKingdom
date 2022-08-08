const BaseItem = require("./BaseItem");
module.exports = class BuffDamageItem extends BaseItem {
  constructor() {
    super();
    this.damageUp;
  }
  buffDamage(connection, data, lobby) {
    const enemyId = data.enemyId;
    const id = data.id;
    connection.player.effect.damagedUp.push({
      id: id,
      ...this.damageUp,
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
  }
};
