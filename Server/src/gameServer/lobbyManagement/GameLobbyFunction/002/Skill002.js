function Skill1Handler(connection, data, lobby) {
  const { id, enemyId, typeEnemy } = data;
  let connection1 = lobby.connections.find((c) => {
    return c.player.id === enemyId;
  });

  const ai = lobby.serverItems.find((s) => {
    return s.id === enemyId;
  });

  const subjectOfAttack = typeEnemy == "AI" ? ai : connection1?.player;

  const skillObject = lobby.skill.find((e) => {
    return e.id == id;
  });
  if (!skillObject) return;

  const skillEffect = skillObject?.skill;
  if (!subjectOfAttack || subjectOfAttack?.isDead) {
    return;
  }

  let isDead = false;
  if (subjectOfAttack?.team != skillObject?.team) {
    isDead = subjectOfAttack.dealDamage(skillEffect.damage);
  } else {
    if (typeEnemy == "Player") {
      subjectOfAttack.health = Math.min(
        subjectOfAttack.health + skillEffect.healing,
        subjectOfAttack.startTank.health
      );

      connection.socket.emit("skillEffectAnimation", {
        enemyId,
        efId: id,
        remove: false, // remove game object tao ra hieu ung nay
        time: 1,
      });
      connection.socket.broadcast.to(lobby.id).emit("skillEffectAnimation", {
        enemyId,
        efId: id,
        remove: false,
        time: 1,
      });

      const returnData1 = {
        id: subjectOfAttack.id,
        health: subjectOfAttack.health,
      };
      console.log("hoi mau", returnData1);
      connection.socket.emit("playerAttacked", returnData1);
      connection.socket.broadcast
        .to(lobby.id)
        .emit("playerAttacked", returnData1);
    }
  }
  if (isDead) {
    // ng chet la player hoac tank ai
    lobby.deadUpdate(connection, subjectOfAttack, skillObject?.activator);
  } else {
    // send dame cho client
    let returnData = {
      id: subjectOfAttack.id,
      health: subjectOfAttack.health,
    };
    console.log("skill dame 1 002", returnData);
    connection.socket.emit("playerAttacked", returnData);
    connection.socket.broadcast.to(lobby.id).emit("playerAttacked", returnData);
  }
}

function Skill2Handler(connection, data, lobby) {
  const { id, enemyId, typeEnemy } = data;
  const skillObject = lobby.skill.find((e) => {
    return e.id == id;
  });
  if (!skillObject) return;
  let connection1 = lobby.connections.find((c) => {
    return c.player.id === enemyId;
  });
  const subjectOfAttack = connection1.player;
  const skillEffect = skillObject?.skill;
  if (subjectOfAttack?.team != skillObject?.team) {
    connection.socket.emit("skillEffectAnimation", {
      enemyId,
      efId: id,
      remove: false, // remove game object tao ra hieu ung nay
      time: 1,
    });
    connection.socket.broadcast.to(lobby.id).emit("skillEffectAnimation", {
      enemyId,
      efId: id,
      remove: false,
      time: 1,
    });
    subjectOfAttack.effect.burned.push({
      id,
      countTime: 0,
      ...skillEffect?.burned,
    });
    subjectOfAttack.effect.slowled.push({
      id,
      ...skillEffect.slowled,
      time: skillObject?.timeRemain,
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

function Skill2Exit(connection, data, lobby) {
  const { id } = data;
  let burn = connection.player.effect.burned.find((b) => {
    return b.id === id;
  });
  if (burn) {
    burn.times = -1;
  }
  let slow = connection.player.effect.slowled.find((b) => {
    return b.id === id;
  });
  if (slow) {
    slow.time = -1;
  }

  connection.socket.emit("endEffectAnimation", {
    endEf: id,
    id: connection.player.id,
  });
  connection.socket.broadcast.to(lobby.id).emit("endEffectAnimation", {
    endEf: id,
    id: connection.player.id,
  });
}

function Skill3Handler(connection, data, lobby) {
  const { id, enemyId, typeEnemy } = data;
  let connection1 = lobby.connections.find((c) => {
    return c.player.id === enemyId;
  });

  const ai = lobby.serverItems.find((s) => {
    return s.id === enemyId;
  });

  const subjectOfAttack = typeEnemy == "AI" ? ai : connection1?.player;

  const skillObject = lobby.skill.find((e) => {
    return e.id == id;
  });
  if (!skillObject) return;

  const skillEffect = skillObject?.skill;
  if (!subjectOfAttack || subjectOfAttack?.isDead) {
    return;
  }

  let isDead = false;
  if (subjectOfAttack?.team != skillObject?.team) {
    isDead = subjectOfAttack.dealDamage(skillEffect?.damage);
  } else {
    if (typeEnemy == "Player") {
      subjectOfAttack.health = Math.min(
        subjectOfAttack.health + skillEffect?.healing,
        subjectOfAttack.startTank.health
      );

      // hieu ung hoi mau
      connection.socket.emit("skillEffectAnimation", {
        enemyId,
        efId: id,
        remove: false, // remove game object tao ra hieu ung nay
        time: 1,
      });
      connection.socket.broadcast.to(lobby.id).emit("skillEffectAnimation", {
        enemyId,
        efId: id,
        remove: false,
        time: 1,
      });

      const returnData1 = {
        id: subjectOfAttack.id,
        health: subjectOfAttack.health,
      };
      console.log("hoi mau", returnData1);
      connection.socket.emit("playerAttacked", returnData1);
      connection.socket.broadcast
        .to(lobby.id)
        .emit("playerAttacked", returnData1);

      // xoa hieu ung bat loi
      // slowled
      subjectOfAttack.effect.slowled.forEach((sl) => {
        if (sl.value > 0) {
          sl.time = -0.1;
        }
      });

      // stunned
      subjectOfAttack.effect.stunned.forEach((e) => {
        e.time = -0.1;
      });

      // tiedUp

      subjectOfAttack.effect.tiedUp.forEach((e) => {
        e.time = -0.1;
      });
      // burned
      subjectOfAttack.effect.burned.forEach((e) => {
        e.times = -0.1;
      });

      // damagedUp
      subjectOfAttack.effect.damagedUp.forEach((e) => {
        if (e.value < 0) {
          e.time = -0.1;
        }
      });
      // armorUp
      subjectOfAttack.effect.armorUp.forEach((e) => {
        if (e.value < 0) {
          e.time = -0.1;
        }
      });

      // attackSpeedUp
      subjectOfAttack.effect.attackSpeedUp.forEach((e) => {
        if (e.value < 0) {
          e.time = -0.1;
        }
      });
    }
  }
  if (isDead) {
    // ng chet la player hoac tank ai
    lobby.deadUpdate(connection, subjectOfAttack, skillObject?.activator);
  } else {
    // send dame cho client
    let returnData = {
      id: subjectOfAttack.id,
      health: subjectOfAttack.health,
    };
    console.log("skill dame 3 002", returnData);
    connection.socket.emit("playerAttacked", returnData);
    connection.socket.broadcast.to(lobby.id).emit("playerAttacked", returnData);
  }
}
module.exports = { Skill1Handler, Skill3Handler, Skill2Handler, Skill2Exit };
