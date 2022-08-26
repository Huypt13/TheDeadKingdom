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
    isDead = subjectOfAttack.dealDamage(skillEffect?.damage);
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
    console.log("skill dame 1 001", returnData);
    connection.socket.emit("playerAttacked", returnData);
    connection.socket.broadcast.to(lobby.id).emit("playerAttacked", returnData);

    // hieu ung lam cham

    if (typeEnemy == "Player") {
      subjectOfAttack.effect.slowled.push({
        id,
        value: skillEffect?.slowled?.value,
        time: skillEffect?.slowled?.time,
      });

      console.log("slow array", subjectOfAttack.effect.slowled);
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
}

function Skill2Handler(connection, data, lobby) {
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
    console.log("skill dame 2 001", returnData);
    connection.socket.emit("playerAttacked", returnData);
    connection.socket.broadcast.to(lobby.id).emit("playerAttacked", returnData);

    // hieu ung lam choang

    if (typeEnemy == "Player") {
      subjectOfAttack.effect.stunned.push({
        id,
        time: skillEffect?.stunned,
      });

      console.log("stuned array", subjectOfAttack.effect.stunned);
      connection.socket.emit("skillEffectAnimation", {
        enemyId,
        efId: id,
        remove: true,
      });
      connection.socket.broadcast.to(lobby.id).emit("skillEffectAnimation", {
        enemyId,
        efId: id,
        remove: true,
      });

      const returnData1 = {
        id: enemyId,
        stunned: true,
      };

      connection.socket.emit("isStunned", returnData1);
      connection.socket.broadcast.to(lobby.id).emit("isStunned", returnData1);
    }
  }
}

function Skill3Handler(connection, skill, lobby) {
  // mau ao
  // speedup
  connection.player.effect.slowled.push({
    value: -skill.speedUp.value,
    time: skill.speedUp.time,
  });
  const totalSlowed = connection.player.effect.slowled.reduce((pre, cur) => {
    return pre + cur.value;
  }, 0);
  const returnData1 = {
    id: connection.player.id,
    speed: connection.player.startTank.speed * (1 - Math.min(totalSlowed, 0.9)),
  };
  console.log("touch speed", returnData1);
  connection.socket.emit("changeSpeed", returnData1);
  connection.socket.broadcast.to(lobby.id).emit("changeSpeed", returnData1);
  // dameup
  connection.player.effect.damagedUp.push({
    value: skill.damagedUp.value,
    time: skill.damagedUp.time,
  });

  // amor up
  connection.player.effect.armorUp.push({
    value: skill.armorUp.value,
    time: skill.armorUp.time,
  });
  // attackSpeedUp
  connection.player.effect.attackSpeedUp.push({
    value: skill.attackSpeedUp.value,
    time: skill.attackSpeedUp.time,
  });
  const totalAttackUp = connection.player.effect.attackSpeedUp.reduce(
    (pre, cur) => {
      return pre + cur.value;
    },
    0
  );
  let atReal = 1 / connection.player.startTank.attackSpeed;
  connection.player.tank.attackSpeed =
    1 / (atReal * (1 + Math.max(totalAttackUp, -0.8)));
  const returnData2 = {
    id: connection.player.id,
    attackSpeed: connection.player.tank.attackSpeed,
  };
  console.log("attack speed up", returnData2);
  connection.socket.emit("changeAttackSpeed", returnData2);
  connection.socket.broadcast
    .to(lobby.id)
    .emit("changeAttackSpeed", returnData2);
}
module.exports = { Skill1Handler, Skill2Handler, Skill3Handler };
