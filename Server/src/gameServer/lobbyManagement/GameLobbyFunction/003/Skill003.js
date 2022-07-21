function Skill1Handler(connection, skill, lobby) {
  // dameup
  connection.player.effect.damagedUp.push({
    value: skill.damagedUp.value,
    time: skill.damagedUp.time,
  });

  console.log("dame up", skill.dameUp);
  // 3 tia
  connection.player.effect.threeBullet = skill.timeEffect;
}

function Skill2Handler(connection, data, lobby) {
  const { id, enemyId, typeEnemy, direction, activator } = data;
  const activeBy = lobby.connections.find((c) => {
    return c.player.id === activator;
  });
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

  const skillEffect = skillObject?.skill;
  if (!subjectOfAttack) {
    return;
  }

  let isDead = false;
  if (subjectOfAttack.team != skillObject.team) {
    isDead = subjectOfAttack.dealDamage(skillEffect?.damage);
  }
  if (isDead) {
    // ng chet la player hoac tank ai
    lobby.deadUpdate(connection, subjectOfAttack, skillObject.activator);
  } else {
    // send dame cho client
    let returnData = {
      id: subjectOfAttack.id,
      health: subjectOfAttack.health,
    };
    console.log("skill dame 2 003", returnData);
    connection.socket.emit("playerAttacked", returnData);
    connection.socket.broadcast.to(lobby.id).emit("playerAttacked", returnData);

    // hieu ung troi

    if (typeEnemy == "Player") {
      activeBy.player.tank.skill2.activeId = subjectOfAttack.id;

      // tao buff skill
      const buffSkill = lobby.createBuffSkill(
        connection,
        [subjectOfAttack.id],
        activeBy.player.tank.skill2.timeEffect,
        "003",
        2
      );
      buffSkill.skill = activeBy.player.tank.skill2;
      buffSkill.afterDestroy = (skill) => {
        console.log("after destroy skill 2");
        skill.activeId = "";
      };
      console.log("set after destroy", buffSkill.afterDestroy);
      //
      subjectOfAttack.effect.tiedUp.push({
        id,
        time: skillEffect?.tiedUp,
      });

      console.log("tiedUp array", subjectOfAttack.effect.tiedUp);
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
        tiedUp: true,
      };

      connection.socket.emit("isTiedUp", returnData1);
      connection.socket.broadcast.to(lobby.id).emit("isTiedUp", returnData1);

      // hieu ung move
      subjectOfAttack.effect.autoMove = {
        speed: skillEffect?.enemySpeed,
        startPos: subjectOfAttack.position,
        direction,
        range: skillEffect?.flyRange,
      };
      console.log("set auto move", subjectOfAttack.effect.autoMove);
    }
  }
}

module.exports = { Skill1Handler, Skill2Handler };