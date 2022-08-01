// function healHp(connection, lobby) {
//   const isFinish = connection.player.healHp();
//   const returnData = {
//     id: connection.player.id,
//     health: connection.player.health,
//   };
//   connection.socket.emit("playerAttacked", returnData);
//   connection.socket.broadcast.to(lobby.id).emit("playerAttacked", returnData);
//   if (isFinish) {
//     const healing = connection.player.effect.healing;
//     for (let property in healing) {
//       healing[property] = 0;
//     }
//     connection.socket.emit("HpStopHeal", connection.player.id);
//     connection.socket.broadcast
//       .to(lobby.id)
//       .emit("HpStopHeal", connection.player.id);
//   }
// }

function onSlowEffect(connection, lobby) {
  const { endEf } = connection.player.onSlowCounter();
  if (endEf.length > 0) {
    const returnData = {
      id: connection.player.id,
      speed: connection.player.tank.speed,
    };
    connection.socket.emit("changeSpeed", returnData);
    connection.socket.broadcast.to(lobby.id).emit("changeSpeed", returnData);
    console.log({
      endEf,
      id: connection.player.id,
    });

    connection.socket.emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
    connection.socket.broadcast.to(lobby.id).emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
  }
}
function onStunnedEffect(connection, lobby) {
  const { stunned, endEf } = connection.player.onStunnedCounter();

  if (endEf.length > 0) {
    connection.socket.emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
    connection.socket.broadcast.to(lobby.id).emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
  }
  if (!stunned) {
    const returnData1 = {
      id: connection.player.id,
      stunned,
    };
    connection.socket.emit("isStunned", returnData1);
    connection.socket.broadcast.to(lobby.id).emit("isStunned", returnData1);
  }
}

function onTiedUpEffect(connection, lobby) {
  const { tiedUp, endEf } = connection.player.onTiedupCounter();

  if (endEf.length > 0) {
    connection.socket.emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
    connection.socket.broadcast.to(lobby.id).emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
  }
  if (!tiedUp) {
    const returnData1 = {
      id: connection.player.id,
      tiedUp,
    };
    console.log("end tiedUp ", tiedUp);
    connection.socket.emit("isTiedUp", returnData1);
    connection.socket.broadcast.to(lobby.id).emit("isTiedUp", returnData1);
  }
}
function onDamagedUpEffect(connection, lobby) {
  const { endEf } = connection.player.onDamagedUpCounter();

  if (endEf.length > 0) {
    connection.socket.emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
    connection.socket.broadcast.to(lobby.id).emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
  }
}
function onArmordUpEffect(connection, lobby) {
  const { endEf } = connection.player.onArmorUpCounter();

  if (endEf.length > 0) {
    connection.socket.emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
    connection.socket.broadcast.to(lobby.id).emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
  }
}

function onAttackSpeedEffect(connection, lobby) {
  const { endEf } = connection.player.onAttackUpCounter();

  if (endEf.length > 0) {
    console.log("endef tang attack speed", endEf);
    const returnData = {
      id: connection.player.id,
      attackSpeed: connection.player.tank.attackSpeed,
    };
    connection.socket.emit("changeAttackSpeed", returnData);
    connection.socket.broadcast
      .to(lobby.id)
      .emit("changeAttackSpeed", returnData);
    console.log({
      endEf,
      id: connection.player.id,
    });

    connection.socket.emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
    connection.socket.broadcast.to(lobby.id).emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
  }
}

function onBurnedEffect(connection, lobby) {
  const { endEf, healthChange } = connection.player.onBurnCounter(lobby);
  if (healthChange) {
    let returnData = {
      id: connection.player.id,
      health: connection.player.health,
    };
    connection.socket.emit("playerAttacked", returnData);
    connection.socket.broadcast.to(lobby.id).emit("playerAttacked", returnData);

    if (endEf.length > 0) {
      connection.socket.emit("endEffectAnimation", {
        endEf,
        id: connection.player.id,
      });
      connection.socket.broadcast.to(lobby.id).emit("endEffectAnimation", {
        endEf,
        id: connection.player.id,
      });
    }
  }
}

function onAutoMoveEffect(connection, lobby) {
  const { endEf } = connection.player.onAutoMoveCounter(connection);

  if (endEf.length > 0) {
    connection.socket.emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
    connection.socket.broadcast.to(lobby.id).emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
    connection.socket.emit("endAutoMove", {
      id: connection.player.id,
    });
  }
}
function onFoucusEffect(connection, lobby) {
  const { endEf } = connection.player.onFocusOnCounter(lobby);

  if (endEf.length > 0) {
    connection.socket.emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
    connection.socket.broadcast.to(lobby.id).emit("endEffectAnimation", {
      endEf,
      id: connection.player.id,
    });
  }
}
module.exports = {
  // healHp,
  onSlowEffect,
  onStunnedEffect,
  onDamagedUpEffect,
  onArmordUpEffect,
  onAttackSpeedEffect,
  onBurnedEffect,
  onTiedUpEffect,
  onAutoMoveEffect,
  onFoucusEffect,
};
