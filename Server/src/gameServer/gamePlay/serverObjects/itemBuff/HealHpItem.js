const BaseItem = require("./BaseItem")
module.exports = class Healthis extends BaseItem {
    constructor(){
        super();
        this.type = "Hp";
        this.healing = {
            value: -240,
            waiting: 0.3,
            times: 2
          }
    }

    buffHp(connection, data, lobby) {
        const enemyId = data.enemyId;
        if (connection.player.health === connection.player.maxHealth)
          return;
        const player = connection.player;
        connection.socket.emit("skillEffectAnimation", {
          enemyId: enemyId,
          efId: this.id,
          remove: false, // remove game object tao ra hieu ung nay
        });
        lobby.despawnItem(this);
        connection.socket.broadcast.to(lobby.id).emit("skillEffectAnimation", {
          enemyId: enemyId,
          efId: this.id,
          remove: false,
        });
        player.effect.burned.push({
          id: this.id,
          countTime: 0,
          ...this.healing});
        
    }
}