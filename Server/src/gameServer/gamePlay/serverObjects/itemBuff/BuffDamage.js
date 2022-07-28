const BaseItem = require("./BaseItem")
module.exports = class BuffDamage extends BaseItem {
    constructor(){
        super();
        this.type = "Damage";
        this.damageUp = {
            value: 10, 
            time: 7,
          }
    }
    buffDamage(connection, data, lobby) {
        const enemyId = data.enemyId;
        const id = data.id;
        connection.player.effect.damagedUp.push({
            id: id,
            ...this.damageUp
          });

        connection.socket.emit("skillEffectAnimation", {
            enemyId,
            efId: id,
            remove: false,
        });
        connection.socket.broadcast.to(lobby.id).emit("skillEffectAnimation", {
            enemyId,
            efId: id,
            remove: false,
        });
    }
}