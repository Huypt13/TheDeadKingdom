const BaseItem = require("./BaseItem")
module.exports = class BuffArmorItem extends BaseItem {
    constructor(){
        super();
        this.type = "Armor";
        this.armorUp = {
            value: 20,
            time: 8
        }
    }
    buffArmor(connection, data, lobby) {
        const enemyId = data.enemyId;
        const id = data.id;
        connection.player.effect.armorUp.push({
            id: id,
            value: this.armorUp.value,
            time: this.armorUp.time,
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