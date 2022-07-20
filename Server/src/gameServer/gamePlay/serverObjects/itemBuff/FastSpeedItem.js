const BaseItem = require("./BaseItem")
module.exports = class FastSpeedItem extends BaseItem {
    constructor() {
        super();
        this.type = "Speed";
        this.speedUp = {
            value: -1.1,
            time: 8,
        }
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
}