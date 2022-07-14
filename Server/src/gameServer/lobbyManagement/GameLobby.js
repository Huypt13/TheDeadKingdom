const LobbyBase = require("./LobbyBase");
const LobbyState = require("../../utility/LobbyState");
const Vector2 = require("../../dto/Vector2");
const Bullet = require("../gamePlay/serverObjects/Bullet");
const TankAI = require("../aiManagement/TankAI");
const AIBase = require("../aiManagement/AIBase");
const Connection = require("../playerManagement/Connection");
const TankService = require("../../api/hero/Tank.service");
const Player = require("../playerManagement/Player");
const Potion = require("../gamePlay/serverObjects/Potion");
const WoodBox = require("../gamePlay/serverObjects/WoodBox");
const FastSpeedItem = require("../gamePlay/serverObjects/itemBuff/FastSpeedItem");
const BuffArmorItem = require("../gamePlay/serverObjects/itemBuff/BuffArmorItem");
const TripleBulletItem = require("../gamePlay/serverObjects//itemBuff/TripleBulletItem");
const HealHpItem = require("../gamePlay/serverObjects//itemBuff/HealHpItem");
const Helipad = require("../gamePlay/serverObjects/Helipad");
const BaseItem = require("../gamePlay/serverObjects/itemBuff/BaseItem");
const { iteratee } = require("lodash");
const GameInfor = require("../../helper/GameInfor.helper");
const SkillOrientation = require("../gamePlay/serverObjects/SkillOrientation");
const Skill001 = require("./GameLobbyFunction/001/Skill001");

const LobbyEffect = require("./GameLobbyFunction/LobbyEffect");
const SkillBuff = require("../gamePlay/serverObjects/SkillBuff");
const Skill002 = require("./GameLobbyFunction/002/Skill002");
const SkillRegion = require("../gamePlay/serverObjects/SkillRegion");

module.exports = class GameLobby extends LobbyBase {
  constructor(settings = GameLobbySettings) {
    super();
    this.settings = settings;
    this.lobbyState = new LobbyState();
    this.bullets = [];
    this.skill = [];
    this.waitingTime = 0;
    this.matchTime = 0; // time tran dau
    this.sendTime = 0; // time gui time tran dau xuong client
    this.teamWin = 0;
    this.ai1Kill = 0;
    this.ai2Kill = 0;
    this.isSendRs = 0;
    this.endGameLobby = function () {};
    this.listItem = [];
  }
  async onUpdate() {
    super.onUpdate();
    const lobby = this;
    // let serverItems = lobby.serverItems;

    if (this.lobbyState.currentState == this.lobbyState.GAME) {
      lobby.updateBullets();
      lobby.updateSkills();
      lobby.updateDeadPlayers();
      lobby.updateAIDead();
      lobby.onUpdateAI();
      lobby.onMatchTime();
      lobby.OnUpdateEffectCooldown();
      lobby.OnUpdateEffectTime();
      lobby.onUpdateItem();
    }
    lobby.onWinning();
    await lobby.onJoinGame();
    //

    //Clos lobby because no one is here
    if (lobby.connections.length == 0) {
      lobby.endGameLobby();
    }
  }

  onMatchTime() {
    if (this.lobbyState.currentState != this.lobbyState.GAME) {
      console.log(this.lobbyState.currentState);
    }
    if (this.lobbyState.currentState == this.lobbyState.GAME) {
      this.matchTime += +0.1;
      this.sendTime++;
      if (this.sendTime == 10) {
        this.sendTime = 0;
        this.connections[0].socket.emit("updateTime", {
          matchTime: this.matchTime,
        });
        this.connections[0].socket.broadcast
          .to(this.id)
          .emit("updateTime", { matchTime: this.matchTime });
      }
    }
  }

  onWinning() {
    if (this.lobbyState.currentState == this.lobbyState.GAME) {
      if (this.settings.gameMode == "CountKill") {
        this.onCountKillWin();
      }
      this.onSendResult();
    }
    //
  }
  onCountKillWin() {
    if (this.matchTime >= GameInfor.CountKillTime - 0.1) {
      console.log("count kill win");
      this.lobbyState.currentState = this.lobbyState.ENDGAME;
      this.matchTime = 0;
      let { team1Kill, team2Kill } = this.getTeamKill();
      if (team1Kill + this.ai1Kill > team2Kill + this.ai2Kill) {
        this.teamWin = 1;
      } else if (team1Kill + this.ai1Kill < team2Kill + this.ai2Kill) {
        this.teamWin = 2;
      } else {
        this.teamWin = Math.floor(Math.random() * 2) + 1;
      }
    }
  }

  killUpdate() {
    let { team1Kill, team2Kill } = this.getTeamKill();
    const returnData = {
      kill1: team1Kill + this.ai1Kill,
      kill2: team2Kill + this.ai2Kill,
    };
    this.connections[0].socket.emit("killUpdate", returnData);
    this.connections[0].socket.broadcast
      .to(this.id)
      .emit("killUpdate", returnData);
  }

  getTeamKill() {
    return this.connections.reduce(
      (pre, connection) => {
        const { team, kill } = connection.player;
        return {
          team1Kill: (pre.team1Kill += (team == 1 ? 1 : 0) * kill),
          team2Kill: (pre.team2Kill += (team == 2 ? 1 : 0) * kill),
        };
      },
      {
        team1Kill: 0,
        team2Kill: 0,
      }
    );
  }

  onSendResult() {
    if (
      this.lobbyState.currentState == this.lobbyState.ENDGAME &&
      this.isSendRs == 0
    ) {
      const returnData1 = {
        state: this.lobbyState.currentState,
      };
      this.connections[0].socket.emit("lobbyUpdate", returnData1);
      this.connections[0].socket.broadcast
        .to(this.id)
        .emit("lobbyUpdate", returnData1);
      this.isSendRs = 1;
      let returnData = {
        playerRs: this.connections.map((connection) => {
          return {
            id: connection.player.id,
            username: connection.player.username,
            kill: connection.player.kill,
            dead: connection.player.dead,
            team: connection.player.team,
          };
        }),
      };
      let { team1Kill, team2Kill } = this.getTeamKill();
      this.connections.forEach((connection) => {
        if (connection.player.team == this.teamWin) {
          returnData = {
            ...returnData,
            result: "win",
            kill1: team1Kill + this.ai1Kill,
            kill2: team2Kill + this.ai2Kill,
          };
        } else {
          returnData = {
            ...returnData,
            result: "lose",
            kill1: team1Kill + this.ai1Kill,
            kill2: team2Kill + this.ai2Kill,
          };
        }
        connection.socket.emit("rsmatch", returnData);
      });
      console.log(
        "out room",
        this.connections.length,
        this?.connections[1]?.player.id
      );
      while (this.connections.length > 0) {
        const connection = this.connections[0];
        console.log("out room", connection.player.id);
        connection.gameServer.onSwitchLobby(
          connection,
          connection.gameServer.generalServerID
        );
      }
    }
  }

  async onJoinGame() {
    if (this.lobbyState.currentState == this.lobbyState.WAITING) {
      this.waitingTime += +0.1;
      if (this.waitingTime > GameInfor.WaitChoolseTime) {
        this.waitingTime = 0;
        this.lobbyState.currentState = this.lobbyState.GAME;
        if (this.connections.length > 0) {
          this.onJoinGameInit();
          console.log("join game");
          this.connections[0].socket.emit("loadGame");
          this.connections[0].socket.broadcast.to(this.id).emit("loadGame");
          const returnData = {
            state: this.lobbyState.currentState,
          };
          this.connections[0].socket.emit("lobbyUpdate", returnData);
          this.connections[0].socket.broadcast
            .to(this.id)
            .emit("lobbyUpdate", returnData);

          this.setInitialListItem();
          await this.onSpawnAllPlayersIntoGame();
          this.onSpawnAIIntoGame();
        }
      }
    }
  }
  setInitialListItem(){
    const buffArmorItem = new BuffArmorItem();
    const fastSpeedItem = new FastSpeedItem();
    const healHpItem = new HealHpItem();
    const tripleBulletItem = new TripleBulletItem();
    const buffArmorItem2 = new BuffArmorItem();
    const fastSpeedItem2 = new FastSpeedItem();
    const healHpItem2 = new HealHpItem();
    const tripleBulletItem2 = new TripleBulletItem();
    this.listItem.push(buffArmorItem, fastSpeedItem, healHpItem, tripleBulletItem);
    this.listItem.push(buffArmorItem2, fastSpeedItem2, healHpItem2, tripleBulletItem2);
   
  }
  onJoinGameInit() {
    this.connections.forEach((connection) => {
      connection.player.setInitValue();
    });
  }

  onUpdateAI() {
    let aiList = this.serverItems.filter((item) => {
      return item instanceof AIBase;
    });
    aiList.forEach((ai) => {
      //Update each ai unity, passing in a function for those that need to update other connections
      ai.onObtainTarget(this.connections);

      ai.onUpdate(
        (data) => {
          if (data?.username == "AI_TOWER") {
            this.connections.forEach((connection) => {
              let socket = connection.socket;
              socket.emit("updateTower", data);
            });
          } else {
            this.connections.forEach((connection) => {
              let socket = connection.socket;
              socket.emit("updateAI", data);
            });
          }
        },
        (data) => {
          this.onFireBullet(undefined, data, true, ai.id);
        },
        (data) => {
          this.connections.forEach((connection) => {
            let socket = connection.socket;
            socket.emit("updateHealthAI", data);
          });
        }
      );
    });

  }
  onUpdateItem(){
    this.listItem.forEach((item) => {
      if(item instanceof BaseItem && item.isActive) { 
        if(!item.existTimeCouter()){
          console.log("item: "+item.id+"|" + item.isActive);
          const index = this.serverItems.indexOf(item);
          this.serverItems.splice(index, 1);
          const returnData = {id : item.id};
          this.connections.forEach((connection) => {
            connection.socket.emit("serverUnSpawn", returnData);
          });
        }
      }
    })
  }

  canEnterLobby(connection = Connection) {
    let lobby = this;
    let maxPlayerCount = lobby.settings.maxPlayers;
    let currentPlayerCount = lobby.connections.length;

    if (currentPlayerCount + 1 > maxPlayerCount) {
      return false;
    }
    return true;
  }
  async someOneChooseHero(connection, tankId) {
    // check tank dc chon chua

    // neu tank chua dc chon

    connection.player.tank = await TankService.getByTankId(tankId);
    connection.player.startTank = { ...connection.player.tank };
    const returnData = {
      id: connection.player.id,
      username: connection.player.username,
      typeId: connection.player.tank.typeId,
      level: connection.player.tank.level,
    };
    connection.socket.emit("updateHero", returnData);
    connection.socket.broadcast.to(this.id).emit("updateHero", returnData);
  }
  onEnterLobby(connection = Connection) {
    let lobby = this;
    let socket = connection.socket;
    super.onEnterLobby(connection);

    // du nguoi thi vao chon tuong
    if (lobby.connections.length == lobby.settings.maxPlayers) {
      console.log("We have enough players we can start choose hero");
      lobby.lobbyState.currentState = lobby.lobbyState.WAITING;
      const returnData1 = {
        players: lobby.connections.map((e) => {
          return {
            username: e.player.username,
            id: e.player.id,
            team: e.player.team,
          };
        }),
        time: GameInfor.WaitChoolseTime,
      };

      console.log("load waiting", returnData1);
      socket.emit("loadWaiting", returnData1);
      socket.broadcast.to(lobby.id).emit("loadWaiting", returnData1);
    }
    const returnData = {
      state: lobby.lobbyState.currentState,
    };
    socket.emit("lobbyUpdate", returnData);
    socket.broadcast.to(lobby.id).emit("lobbyUpdate", returnData);
  }
  onLeaveLobby(connection = Connection) {
    let lobby = this;

    super.onLeaveLobby(connection);

    lobby.removePlayer(connection);
    lobby.onUnspawnAllAIInGame(connection);
    if (lobby.connections.length < lobby.settings.minPlayers) {
      while (this.connections.length > 0) {
        const connection = this.connections[0];
        if (connection != undefined) {
          connection.socket.emit("unloadGame");
          connection.gameServer.onSwitchLobby(
            connection,
            connection.gameServer.generalServerID
          );
        }
      }
    }
  }
  async onSpawnAllPlayersIntoGame() {
    let lobby = this;
    let connections = lobby.connections;
    let canplay = true;
    for (const connection of connections) {
      const addSuccess = await lobby.addPlayer(connection);
      console.log("spawn player", connection.player.id, addSuccess);
      if (!addSuccess) {
        // huy room thong bao cho ng dung
        canplay = false;
        break;
      }
    }
    if (!canplay) {
      this.lobbyState.currentState = this.lobbyState.ERROR;
      const returnData1 = {
        state: this.lobbyState.currentState,
      };
      this.connections[0].socket.emit("lobbyUpdate", returnData1);
      this.connections[0].socket.broadcast
        .to(this.id)
        .emit("lobbyUpdate", returnData1);
      while (this.connections.length > 0) {
        const connection = this.connections[0];
        connection.socket.emit("errorPickTank");
        connection.gameServer.onSwitchLobby(
          connection,
          connection.gameServer.generalServerID
        );
      }
    }
  }
  onSpawnAIIntoGame() {
    const tankAi = {
      speed: 0.15,
      rotationSpeed: 0.3,
      damage: 80,
      health: 1000,
      attackSpeed: 1,
      bulletSpeed: 1, // 100 ms
      shootingRange: 6,
    };
    // this.onServerSpawn(
    //   new TankAI("01", new Vector2(-6, 2), 4, tankAi, 1),
    //   new Vector2(-6, 2)
    // );
    this.onServerSpawn(
      new TankAI("01", new Vector2(-6, 4), 4, tankAi, 0),
      new Vector2(-6, 4)
    );
    // this.onServerSpawn(
    //   new TankAI("01", new Vector2(-3, 4), 4, tankAi, 2),
    //   new Vector2(-3, 4)
    // );
    // this.onServerSpawn(
    //   new TankAI("01", new Vector2(-6, 6), 4, tankAi, 0),
    //   new Vector2(5, 2)
    // );
    // this.onServerSpawn(new TowerAI("01", tankAi, 1), new Vector2(-3, 0));
    // this.onServerSpawn(new TowerAI("01", tankAi, 0), new Vector2(-5, 0));
    // this.onServerSpawn(new TowerAI("01", tankAi, 2), new Vector2(-1, 0));

    this.onServerSpawn(new Potion(1), new Vector2(7, -5));
    this.onServerSpawn(new Potion(2), new Vector2(7, -1)) ;
    this.onServerSpawn(new WoodBox(), new Vector2(-1,3));
    this.onServerSpawn(new WoodBox(), new Vector2(2,3));
    this.onServerSpawn(new WoodBox(), new Vector2(4,3));
    this.onServerSpawn(new Helipad(2), new Vector2(-3,1));
    this.onServerSpawn(new Helipad(3), new Vector2(-3,3));
  

  }
  onUnspawnAllAIInGame(connection = Connection) {
    let lobby = this;
    let serverItems = lobby.serverItems;

    //Remove all server items from the client, but still leave them in the server others
    serverItems.forEach((serverItem) => {
      connection.socket.emit("serverUnspawn", {
        id: serverItem.id,
      });
    });
  }

  updateBullets() {
    let lobby = this;
    let bullets = lobby.bullets;
    bullets.forEach((bullet) => {
      const isDestroy = bullet.onUpdate();
      if (isDestroy) {
        lobby.despawnBullet(bullet);
      }
    });
  }

  updateSkills() {
    // skill 1 type 001
    this.skill.forEach((skill) => {
      if (skill instanceof SkillOrientation) {
        if (skill.onUpdate()) {
          this.despawnSkill(skill);
        }
      }
      if (skill instanceof SkillBuff) {
        if (skill.onUpdate()) {
          this.endSkillBuff(skill);
        }
      }
      if (skill instanceof SkillRegion) {
        if (skill.onUpdate()) {
          this.despawnSkill(skill);
        }
      }
    });
  }

  onFireBullet(connection = Connection, data, isAI = false, aiId) {
    const { activator, position, direction } = data;
    const activeBy = this.connections.find((c) => {
      return c.player.id === activator;
    });

    if (!isAI) {
      let bullet = new Bullet(position, activeBy?.player?.tank, direction);
      bullet.activator = activator;
      bullet.team = activeBy?.player?.team;
      this.bullets.push(bullet);
      const returnData = {
        name: "Bullet",
        id: bullet.id,
        team: bullet.team,
        activator,
        direction,
        position,
        bulletSpeed: activeBy?.player?.tank?.bulletSpeed || bullet.speed,
      };
      connection.socket.emit("serverSpawn", returnData);
      connection.socket.broadcast.to(this.id).emit("serverSpawn", returnData); //Only broadcast to those in the same lobby as us
    } else if (this.connections.length > 0) {
      // get tank by aiid
      const tankAi = this.serverItems.find((item) => {
        return item.id == aiId;
      });
      let bullet = new Bullet(position, tankAi.tank, {
        x: -direction.x,
        y: -direction.y,
      });
      bullet.activator = activator;
      bullet.team = tankAi?.team;
      this.bullets.push(bullet);
      const returnData = {
        name: "Bullet",
        team: bullet.team,
        id: bullet.id,
        activator,
        direction: { x: -direction.x, y: -direction.y },
        position,
        bulletSpeed: tankAi.tank.bulletSpeed || bullet.speed,
      };
      this.connections[0].socket.emit("serverSpawn", returnData);
      this.connections[0].socket.broadcast
        .to(this.id)
        .emit("serverSpawn", returnData); //Broadcast to everyone that the ai spawned a bullet for
    }
  }

  createOrientationSkill(data, activeBy, connection, skill) {
    const { position, direction, activator, typeId, num } = data;
    let skillObject = new SkillOrientation(position, direction, skill);

    skillObject.activator = activator;
    skillObject.team = activeBy?.player?.team;

    this.skill.push(skillObject);
    const returnData = {
      name: `OrientationSkill`,
      num,
      typeId,
      id: skillObject.id,
      team: skillObject.team,
      activator,
      direction,
      position,
      skillSpeed: skillObject.speed,
    };

    connection.socket.emit("skillSpawn", returnData);
    connection.socket.broadcast.to(this.id).emit("skillSpawn", returnData);
  }
  createRegionSkill(data, activeBy, connection, skill, timeRemain) {
    const { position, activator, typeId, num } = data;
    let skillObj = new SkillRegion(position, skill);
    skillObj.activator = activator;
    skillObj.team = activeBy?.player?.team;
    skillObj.timeRemain = timeRemain;
    this.skill.push(skillObj);

    const returnData = {
      name: "skillRegion",
      activator,
      id: skillObj.id,
      typeId,
      num,
      position,
    };
    connection.socket.emit("skillSpawn", returnData);
    connection.socket.broadcast.to(this.id).emit("skillSpawn", returnData);
  }
  createBuffSkill(connection, playerImpacted, timeRemain, typeId, num) {
    const skillBuff = new SkillBuff();
    skillBuff.playerImpacted = playerImpacted;
    skillBuff.timeRemain = timeRemain;
    this.skill.push(skillBuff);
    const returnData = {
      name: "skillBuff",
      id: skillBuff.id,
      typeId,
      num,
      playerImpacted,
    };
    connection.socket.emit("skillSpawn", returnData);
    connection.socket.broadcast.to(this.id).emit("skillSpawn", returnData);
  }

  onSkill(connection, data) {
    const { typeId, activator, num } = data;
    const activeBy = this.connections.find((c) => {
      return c.player.id === activator;
    });

    if (typeId === "001" && num === 1) {
      this.createOrientationSkill(
        data,
        activeBy,
        connection,
        activeBy?.player?.tank?.skill1
      );
    } else if (typeId === "001" && num === 2) {
      this.createOrientationSkill(
        data,
        activeBy,
        connection,
        activeBy?.player?.tank?.skill2
      );
    } else if (typeId === "001" && num === 3) {
      this.createBuffSkill(
        connection,
        [connection.player.id],
        connection.player.startTank.skill3.damagedUp.time,
        typeId,
        num
      );
      Skill001.Skill3Handler(
        connection,
        connection.player.startTank.skill3,
        this
      );
    } else if (typeId === "002" && num === 1) {
      this.createOrientationSkill(
        data,
        activeBy,
        connection,
        activeBy?.player?.tank?.skill1
      );
    } else if (typeId === "002" && num === 2) {
      this.createRegionSkill(
        data,
        activeBy,
        connection,
        activeBy?.player?.tank?.skill2,
        activeBy?.player?.tank?.skill2.slowled.time
      );
    } else if (typeId === "002" && num === 3) {
      this.createRegionSkill(
        data,
        activeBy,
        connection,
        activeBy?.player?.tank?.skill3,
        0.5
      );
    }
  }
  onTouchSkill(connection, data) {
    const { typeId, num } = data;
    if (typeId == "001" && num === 1) {
      Skill001.Skill1Handler(connection, data, this);
    }
    if (typeId == "001" && num === 2) {
      Skill001.Skill2Handler(connection, data, this);
    }
    if (typeId == "002" && num === 1) {
      Skill002.Skill1Handler(connection, data, this);
    }
    if (typeId == "002" && num === 2) {
      Skill002.Skill2Handler(connection, data, this);
    }
    if (typeId == "002" && num === 3) {
      Skill002.Skill3Handler(connection, data, this);
    }
  }
  onExitSkill(connection, data) {
    const { typeId, num } = data;

    if (typeId == "002" && num === 2) {
      Skill002.Skill2Exit(connection, data, this);
    }
  }
  deadUpdate(connection, subjectOfAttack, activator) {
    if (
      subjectOfAttack instanceof Player ||
      subjectOfAttack instanceof TankAI
    ) {
      const con = this.connections.find((c) => {
        return c.player.id === activator;
      });
      if (con) {
        con.player.kill++;
      } else {
        if (subjectOfAttack.team == 1) {
          this.ai2Kill++;
        }
        if (subjectOfAttack.team == 2) {
          this.ai1Kill++;
        }
      }
      if (subjectOfAttack instanceof Player) {
        subjectOfAttack.dead++;
      }
      this.killUpdate();
    }
    let returnData = {
      id: subjectOfAttack.id,
    };
    connection.socket.emit("playerDied", returnData);
    connection.socket.broadcast.to(this.id).emit("playerDied", returnData);
  }
  onCollisionDestroy(connection = Connection, data) {
    const lobby = this;
    const returnBullet = this.bullets.filter((e) => e.id == data.id);
    returnBullet.forEach((bullet) => {
      //new

      bullet.isDestroyed = true;
      let enemyId = data?.enemyId;

      let connection1 = lobby.connections.find((c) => {
        return c.player.id === enemyId;
      });

      const ai = lobby.serverItems.find((s) => {
        return s.id === enemyId;
      });

      const subjectOfAttack = connection1?.player ? connection1?.player : ai;

      if (!subjectOfAttack) {
        return;
      }
      let isDead = false;
      // console.log("health before", subjectOfAttack.health);
      // console.log(bullet?.tank?.damage);
      if (subjectOfAttack.team != bullet.team) {
        isDead = subjectOfAttack.dealDamage(bullet?.tank?.damage);
      }

      // console.log("health ", subjectOfAttack.health);

      if (isDead) {
        // ng chet la player hoac tank ai
        this.deadUpdate(connection, subjectOfAttack, bullet?.activator);
      } else {
        let returnData = {
          id: subjectOfAttack.id,
          health: subjectOfAttack.health,
        };
        connection.socket.emit("playerAttacked", returnData);
        connection.socket.broadcast
          .to(lobby.id)
          .emit("playerAttacked", returnData);
      }
    });
  }
  onCollisionDestroyHpBox(connection = Connection, data) {
    let lobby = this;
    let id = data?.id;
    let enemyId = data?.enemyId;
    const potion = this.serverItems.find((item) => item.id == enemyId);
    if (!potion || potion.team == connection.player.team) return;
    const returnBullet = lobby.bullets.filter((e) => e.id == id);
    returnBullet.forEach((bullet) => {
      bullet.isDestroyed = true;
      let isDead = false;
      if (potion.team != bullet.team) {
        isDead = potion.dealDamage(bullet?.tank?.damage || 5);
      }

      if (isDead) {
        let returnData = {
          id: enemyId,
        };
        connection.socket.emit("playerDied", returnData);
        connection.socket.broadcast.to(lobby.id).emit("playerDied", returnData);
      } else {
        let returnData = {
          id: potion.id,
          health: potion.health,
        };
        connection.socket.emit("playerAttacked", returnData);
        connection.socket.broadcast
          .to(lobby.id)
          .emit("playerAttacked", returnData);
      }
    });
  }
  onCollisionDestroyWoodBox(connection = Connection, data) {
    console.log("destroy");
    let lobby = this;
    let id = data?.id;
    let enemyId = data?.enemyId;
    const woodBox = this.serverItems.find(item => item.id == enemyId);
    if(!woodBox)return;
    console.log("destroy1");
    const returnBullet = lobby.bullets.filter((e) => e.id == id);
    returnBullet.forEach((bullet) => {
    let isDead = false;
    bullet.isDestroyed = true;
        isDead = woodBox.dealDamage(bullet?.tank?.damage || 5);
        console.log("isDead: " + isDead);
      if (isDead) {
        let returnData = {
          id: enemyId,
        };
        connection.socket.emit("playerDied", returnData);
        connection.socket.broadcast.to(lobby.id).emit("playerDied", returnData);
        console.log("create");
        this.spawnRandomItem(woodBox.position);
      } else {
        let returnData = {
          id: woodBox.id,
          health: woodBox.health,
        };
        connection.socket.emit("playerAttacked", returnData);
        connection.socket.broadcast
          .to(lobby.id)
          .emit("playerAttacked", returnData);
      }
    });
  }
  randomInRange(max, min){
    return Math.floor(Math.random()*(max-min))+min;
  }
  spawnRandomItem(position){
        const nonActiveItems = this.listItem.filter(item => item.isActive == false);
        const index = this.randomInRange(nonActiveItems.length, 0);
        const item = nonActiveItems[index];
       ;
        if(item){
          item.isActive = true;
          this.onServerSpawn(item, position);
          console.log("item :" + item.name)
        }
  }

  despawnBullet(bullet = Bullet) {
    let index = this.bullets.indexOf(bullet);
    if (index > -1) {
      this.bullets.splice(index, 1);
    }
    let returnData = { id: bullet.id };
    const lobby = this;
    lobby.connections.forEach((connection) => {
      connection.socket.emit("serverUnSpawn", returnData);
    });
  }
  despawnSkill(skill) {
    let index = this.skill.indexOf(skill);
    if (index > -1) {
      this.skill.splice(index, 1);
    }
    this.connections.forEach((connection) => {
      connection.socket.emit("severUnspawnSkill", {
        id: skill.id,
      });
    });
  }

  endSkillBuff(skill) {
    let index = this.skill.indexOf(skill);
    if (index > -1) {
      this.skill.splice(index, 1);
    }
    console.log(skill);
    skill.playerImpacted.forEach((id) => {
      if (this.connections.length > 0) {
        this.connections[0].socket.emit("endEffectAnimation", {
          endEf: [{ id: skill.id }],
          id,
        });
        this.connections[0].socket.broadcast
          .to(this.id)
          .emit("endEffectAnimation", { endEf: [{ id: skill.id }], id });
      }
    });
  }

  async addPlayer(connection = Connection) {
    let lobby = this;
    let connections = lobby.connections;
    let socket = connection.socket;

    // let randomPosition = lobby.getRandomSpawn();
    // connection.player.position = new Vector2(
    //   randomPosition.x,
    //   randomPosition.y
    // );
    connection.player.position = new Vector2(0, 0);

    let tank = connection.player?.tank;

    if (!tank) {
      const tankList = await TankService.getTankByUserId(connection.player.id);
      if (!tankList[0]?.tankList) {
        console.log(connection.player.id, "ko co tank");
        return false;
      }
      for (const tankRemain of tankList[0]?.tankList) {
        if (tankRemain.remaining > 0) {
          tank = tankRemain.tank;
          connection.player.tank = { ...tankRemain.tank };
          connection.player.startTank = { ...tankRemain.tank };
          break;
        }
      }
    }
    if (!tank) {
      console.log(connection.player.id, "ko co tank remain >0");
      return false;
    }
    const tankUser = await TankService.getByTankUserById(
      tank._id,
      connection.player.id
    );
    if (!tankUser || tankUser?.remaining <= 0) {
      console.log("chon tank check remain fail", connection.player.id);
      return false;
    }

    connection.player.health = tank.health;
    console.log(
      `spawn player ${connection.player.id} team ${connection.player.team}`,
      this.connections.length
    );
    const returnData = {
      id: connection.player.id,
      position: connection.player.position,
      team: connection.player.team,
      tank,
    };
    socket.emit("spawn", returnData); //tell myself I have spawned
    socket.broadcast.to(lobby.id).emit("spawn", returnData); // Tell other

    // tell another to me
    connections.forEach((c) => {
      if (c.player.id != connection.player.id) {
        socket.emit("spawn", {
          id: c.player.id,
          position: c.player.position,
          tank,
        });
      }
    });
    return true;
  }
  updateDeadPlayers() {
    let lobby = this;
    let connections = lobby.connections;
    connections.forEach((connection) => {
      let player = connection.player;
      if (player.isDead) {
        player.deadResetEffect();
        connection.socket.emit("removeAllEffect", { id: player.id });
        connection.socket.broadcast
          .to(this.id)
          .emit("removeAllEffect", { id: player.id });

        connection.socket.emit("deadPlayerReset", {
          id: player.id,
          speed: player.startTank.speed,
          attackSpeed: player.startTank.attackSpeed,
        });
        connection.socket.broadcast.to(this.id).emit("deadPlayerReset", {
          id: player.id,
          speed: player.startTank.speed,
          attackSpeed: player.startTank.attackSpeed,
        });

        let isRespawn = player.respawnCounter();
        if (isRespawn) {
          let returnData = {
            id: player.id,
            position: {
              x: player.position.x,
              y: player.position.y,
            },
            health: player.tank.health,
          };
          connection.socket.emit("playerRespawn", returnData);
          connection.socket.broadcast
            .to(lobby.id)
            .emit("playerRespawn", returnData);
        }
      }
    });
  }
  updateAIDead() {
    const lobby = this;
    const connections = this.connections;
    let aiList = lobby.serverItems.filter((item) => {
      return item instanceof AIBase;
    });
    aiList.forEach((ai) => {
      if (ai.username != "AI_TOWER") {
        if (ai.isDead) {
          let isRespawn = ai.respawnCounter();
          if (isRespawn) {
            let socket = connections[0].socket;
            let returnData = {
              id: ai.id,
              position: {
                x: ai.position.x,
                y: ai.position.y,
              },
              health: ai.maxhealth,
            };

            socket.emit("playerRespawn", returnData);
            socket.broadcast.to(lobby.id).emit("playerRespawn", returnData);
          }
        }
      }
    });
    for (let item of lobby.serverItems) {
      if (item instanceof Potion && item.isDead) {
        if (!item.reSpawn()) {
          for (let connection of lobby.connections) {
            connection.socket.emit("playerRespawn", item);
            connection.socket.broadcast
              .to(lobby.id)
              .emit("playerRespawn", item);
          }
        }
      }
    }
    
  }
  removePlayer(connection = Connection) {
    let lobby = this;

    connection.socket.broadcast.to(lobby.id).emit("disconnected", {
      id: connection.player.id,
    });
  }

  onCollisionHealHpEffects(connection = Connection, potionId) {
    const lobby = this;
    const potion = lobby.serverItems.find((item) => item.id == potionId);
    console.log(connection.player.health + "||" + connection.player.maxHealth);
    if (
      !potion.isActive ||
      connection.player.health === connection.player.maxHealth ||
      connection.player.team != potion.team
    )
      return;
    connection.socket.emit("startLoadingCoolDown", potion.id);
    connection.socket.broadcast
      .to(this.id)
      .emit("startLoadingCoolDown", potion.id);
    const player = connection.player;
    connection.socket.emit("HpHeal", player.id);
    connection.socket.broadcast.to(this.id).emit("HpHeal", player.id);
    potion.isActive = false;
    const healing = player.effect.healing;
    for (let property in healing) {
      healing[property] = potion.healing[property];
    }
  }
  OnUpdateEffectCooldown() {
    for (let item of this.serverItems) {
      if (item?.isActive != undefined && !item.isActive) {
        if (item.coolDown()) {
          for (let connection of this.connections)
            connection.socket.emit("stopLoading", item.id);
        }
      }
    }
  }
  OnUpdateEffectTime() {
    for (let connection of this.connections) {
      if (connection.player.effect.healing.value != 0) {
        LobbyEffect.healHp(connection, this);
      }
      if (connection.player.effect.slowled.length > 0) {
        LobbyEffect.onSlowEffect(connection, this);
      }
      if (connection.player.effect.stunned.length > 0) {
        LobbyEffect.onStunnedEffect(connection, this);
      }
      if (connection.player.effect.damagedUp.length > 0) {
        LobbyEffect.onDamagedUpEffect(connection, this);
      }
      if (connection.player.effect.armorUp.length > 0) {
        LobbyEffect.onArmordUpEffect(connection, this);
      }
      if (connection.player.effect.attackSpeedUp.length > 0) {
        LobbyEffect.onAttackSpeedEffect(connection, this);
      }
      if (connection.player.effect.burned.length > 0) {
        LobbyEffect.onBurnedEffect(connection, this);
      }
    }
  }

  getRandomSpawn() {}
  getRndInteger(min, max) {}
};
