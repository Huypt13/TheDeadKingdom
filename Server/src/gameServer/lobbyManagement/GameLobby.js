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
const WoodBox = require("../gamePlay/serverObjects/Box/WoodBox");
const IronBox = require("../gamePlay/serverObjects/Box/IronBox");
const PileBox = require("../gamePlay/serverObjects/Box/PileBox");
const FastSpeedItem = require("../gamePlay/serverObjects/itemBuff/FastSpeedItem");
const BuffArmorItem = require("../gamePlay/serverObjects/itemBuff/BuffArmorItem");
const BuffDamageItem = require("../gamePlay/serverObjects/itemBuff/BuffDamageItem");
const HealHpItem = require("../gamePlay/serverObjects//itemBuff/HealHpItem");
const Helipad = require("../gamePlay/serverObjects/Helipad");
const BaseItem = require("../gamePlay/serverObjects/itemBuff/BaseItem");
const BaseBox = require("../gamePlay/serverObjects/Box/BaseBox");
const { iteratee } = require("lodash");
const GameInfor = require("../../helper/GameInfor.helper");
const SkillOrientation = require("../gamePlay/serverObjects/SkillOrientation");
const Skill001 = require("./GameLobbyFunction/001/Skill001");

const LobbyEffect = require("./GameLobbyFunction/LobbyEffect");
const SkillBuff = require("../gamePlay/serverObjects/SkillBuff");
const Skill002 = require("./GameLobbyFunction/002/Skill002");
const SkillRegion = require("../gamePlay/serverObjects/SkillRegion");
const Skill003 = require("./GameLobbyFunction/003/Skill003");
const TowerAI = require("../aiManagement/TowerAI");
const GameLobbySetting = require("./GameLobbySetting");
const MapProp = require("./MapProps");
const GameLobbySettings = require("./GameLobbySetting");
const History = require("../../api/history/History.service");
const Filter = require("bad-words");
const filter = new Filter();
const BadWords = require("../../helper/BadWords");
const shortID = require("shortid");
const SocketAuthen = require("../../api/middlewares/SocketAuthen.middleware");
const User = require("../../api/user/User.service");
const MainHouse = require("../gamePlay/serverObjects/MainHouse");
const Flag = require("../gamePlay/serverObjects/Flag");

module.exports = class GameLobby extends LobbyBase {
  constructor(settings = GameLobbySetting) {
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
      lobby.updateBulletsRemove();
      lobby.updateSkills();
      lobby.updateDeadPlayers();
      lobby.updateAIDead();
      lobby.onUpdateAI();
      lobby.onMatchTime();
      lobby.OnUpdateEffectCooldown();
      lobby.OnUpdateEffectTime();
      lobby.onUpdateItemTime();
    }
    await lobby.onWinning();
    await lobby.onJoinGame();
    //

    //Clos lobby because no one is here
    if (lobby.connections.length == 0) {
      lobby.endGameLobby();
    }
  }
  onUpdateItemTime() {
    this.serverItems.forEach((item) => {
      if (item?.timeRemain) {
        item.timeRemain -= 0.1;
        if (item.timeRemain < 0) {
          let returnData = {
            id: item.id,
            time: 0,
          };
          this.connections[0].socket.emit("playerDied", returnData);
          this.connections[0].socket.broadcast
            .to(this.id)
            .emit("playerDied", returnData);
          item.isDead = true;
        }
      }
    });
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

  async onWinning() {
    if (this.lobbyState.currentState == this.lobbyState.GAME) {
      if (this.settings.gameMode == "CountKill") {
        this.onCountKillWin();
      }
      if (this.settings.gameMode == "Destroy") {
        this.onDestroyWin();
      }
      if (this.settings.gameMode == "Flag") {
        this.onFlagWin();
      }
      await this.onSendResult();
    }
    //
  }
  onFlagWin() {
    let num = 0;
    let numEnd = 0;
    let team = 0;
    let team1point = 0;
    let team2point = 0;
    this.serverItems.forEach((item) => {
      if (item instanceof Flag) {
        num++;
        if (item?.end) {
          numEnd++;
          team = item.team;
        }
        team1point = team1point + (item.team == 1) ? item.point : 0;
        team2point = team2point + (item.team == 2) ? item.point : 0;
      }
    });
    if (num == numEnd && num != 0) {
      this.lobbyState.currentState = this.lobbyState.ENDGAME;
      this.teamWin = team;
    }

    // het time
    if (this.matchTime >= GameInfor.FlagTime - 0.1) {
      this.lobbyState.currentState = this.lobbyState.ENDGAME;
      if (team1point > team2point) {
        this.teamWin = 1;
      } else if (team1point < team2point) {
        this.teamWin = 2;
      } else {
        this.teamWin = Math.floor(Math.random() * 2) + 1;
      }
    }
  }
  onDestroyWin() {
    let houseDead = [];
    let house1 = {};
    let house2 = {};
    this.serverItems.forEach((item) => {
      if (item instanceof MainHouse) {
        if (item?.team == 1) {
          house1 = { ...item };
        } else {
          house2 = { ...item };
        }
        if (item?.isDead) {
          console.log("dead item", item);
          houseDead.push(item);
        }
      }
    });
    if (houseDead?.length == 2) {
      this.lobbyState.currentState = this.lobbyState.ENDGAME;
      this.teamWin = Math.floor(Math.random() * 2) + 1;
      return;
    }
    if (houseDead?.length == 1) {
      this.lobbyState.currentState = this.lobbyState.ENDGAME;
      this.teamWin = 3 - houseDead[0]?.team;
      return;
    }
    if (this.matchTime >= GameInfor.DestroyTime - 0.1) {
      this.lobbyState.currentState = this.lobbyState.ENDGAME;
      if (house1.health == house2.health) {
        this.teamWin = Math.floor(Math.random() * 2) + 1;
      } else if (house1.health > house2.health) {
        this.teamWin = 1;
      } else {
        this.teamWin = 2;
      }
      return;
    }
  }

  dealPointFlag(data, connection) {
    const { id, team } = data;
    this.serverItems.forEach((item) => {
      if (item instanceof Flag && item.id === id) {
        const end = item.dealPoint(team);
        const returnData = {
          id: item.id,
          point: item.point,
          team: item.team,
        };
        if (!end) {
          connection.socket.emit("updateFlagPoint", returnData);
          connection.socket.broadcast
            .to(this.id)
            .emit("updateFlagPoint", returnData);
        }
      }
    });
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
      waitingTime: GameInfor.PlayerRespawnTime,
      listPlayer: this.connections.map((connection) => {
        return {
          id: connection.player.id,
          kill: connection.player.kill,
          dead: connection.player.dead,
        };
      }),
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

  async onSendResult() {
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
            tankType: connection.player.startTank.typeId,
            tankLevel: connection.player.startTank.level,
          };
        }),
      };
      let { team1Kill, team2Kill } = this.getTeamKill();
      let history = {
        teamWin: this.teamWin,
        gameMode: this.settings.gameMode,
        team1Kill: team1Kill + this.ai1Kill,
        team2Kill: team2Kill + this.ai2Kill,
        time: Date.now(),
      };

      let members = [];
      for (const connection of this.connections) {
        if (connection.player.team == this.teamWin) {
          await User.updateStar(1, connection.player._id);
          let reward = await User.rewardAfterMatch(connection.player._id, true);

          members.push({
            tank: connection.player.startTank.tankUserId,
            userId: connection.player._id,
            team: connection.player.team,
            isWin: true,
            kill: connection.player.kill,
            dead: connection.player.dead,
          });
          console.log("aaaa", connection.player.startTank.tankUserId, members);

          returnData = {
            ...returnData,
            result: "win",
            kill1: team1Kill + this.ai1Kill,
            kill2: team2Kill + this.ai2Kill,
            reward: reward,
          };
        } else {
          await User.updateStar(-1, connection.player._id);
          let reward = await User.rewardAfterMatch(
            connection.player._id,
            false
          );
          members.push({
            tank: connection.player.startTank.tankUserId,
            userId: connection.player._id,
            team: connection.player.team,
            isWin: false,
            kill: connection.player.kill,
            dead: connection.player.dead,
          });
          returnData = {
            ...returnData,
            result: "lose",
            kill1: team1Kill + this.ai1Kill,
            kill2: team2Kill + this.ai2Kill,
            reward: reward,
          };
        }
        connection.socket.emit("rsmatch", returnData);
      }
      // save history:
      history = { ...history, members };
      await History.insertMatchHistory(history);
      console.log(
        "out room",
        this.connections.length,
        this?.connections[1]?.player.id
      );
      // update star
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
          console.log("join game");
          this.connections[0].socket.emit("loadGame", {
            map: this.settings.map,
            gameMode: this.settings.gameMode,
            time: GameInfor[`${this.settings.gameMode}Time`],
          });
          this.connections[0].socket.broadcast.to(this.id).emit("loadGame", {
            map: this.settings.map,
            gameMode: this.settings.gameMode,
            time: GameInfor[`${this.settings.gameMode}Time`],
          });
          const returnData = {
            state: this.lobbyState.currentState,
          };
          this.connections[0].socket.emit("lobbyUpdate", returnData);
          this.connections[0].socket.broadcast
            .to(this.id)
            .emit("lobbyUpdate", returnData);

          this.setInitialListItem();
          await this.onSpawnAllPlayersIntoGame();
          this.onJoinGameInit();
          this.onSpawnAIIntoGame();
        }
      }
    }
  }
  setInitialListItem() {
    const amountEachItem = 2;
    const itemNames = [];
    itemNames["BuffArmorItem"] = BuffArmorItem;
    itemNames["FastSpeedItem"] = FastSpeedItem;
    itemNames["HealHpItem"] = HealHpItem;
    itemNames["BuffDamageItem"] = BuffDamageItem;
    const buffItems = MapProp.buffItem;
    for (let buffItemName in buffItems) {
      const buffItem = new itemNames[buffItemName]();
      for (let property in buffItems[buffItemName]) {
        buffItem[property] = buffItems[buffItemName][property];
      }
      for (let i = 0; i < amountEachItem; i++) this.listItem.push(buffItem);
    }
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

  canEnterLobby(connection = Connection) {
    let lobby = this;
    let maxPlayerCount = lobby.settings.maxPlayers;
    let currentPlayerCount = lobby.connections.length;

    if (currentPlayerCount + 1 > maxPlayerCount) {
      return false;
    }
    return true;
  }
  async someOneChooseHero(connection, _id) {
    console.log("choose hero", connection.player._id);
    const tank = await TankService.getByTankId(_id, connection.player._id);
    if (!tank) {
      return;
    }
    console.log("choose tank", tank);
    connection.player.tank = JSON.parse(JSON.stringify(tank));
    connection.player.startTank = JSON.parse(JSON.stringify(tank));
    connection.player.maxHealth = connection.player.startTank.health;
    connection.player.startTank.tankUserId = _id;
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
        players: lobby.connections.map((e, i) => {
          e.player.spawnPos =
            this.settings.tankSpawnPosition[i]?.position || new Vector2(0, 0);

          console.log("spawn pos s", i, e.player.spawnPos);
          e.player.position = new Vector2(
            e.player.spawnPos.x,
            e.player.spawnPos.y
          );
          if (i % 2 == 0) {
            e.player.team = 1;
          } else {
            e.player.team = 2;
          }
          return {
            username: e.player.username,
            id: e.player.id,
            team: e.player.team,
          };
        }),
        time: GameInfor.WaitChoolseTime,
        map: this.settings.map,
        gameMode: this.settings.gameMode,
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
      bulletSpeed: 1,
      shootingRange: 6,
    };

    // if (this.settings.gameMode == "Destroy") {
    //   let house1 = new MainHouse();
    //   house1.team = 1;
    //   house1.health = 2000;
    //   house1.maxHealth = 2000;
    //   this.onServerSpawn(house1, new Vector2(7, -8));

    //   let house2 = new MainHouse();
    //   house2.team = 2;
    //   house2.health = 2000;
    //   house1.maxHealth = 2000;

    //   console.log(house2);
    //   this.onServerSpawn(house2, new Vector2(7, 1));
    // }

    let objectWithName = [];
    objectWithName["BlueTeamPotion"] = Potion;
    objectWithName["RedTeamPotion"] = Potion;
    objectWithName["WoodBox"] = WoodBox;
    objectWithName["IronBox"] = IronBox;
    objectWithName["PileBox"] = PileBox;
    // objectWithName["BlueTeamTankAI"] = TankAI;
    objectWithName["RedTeamTankAI"] = TankAI;
    objectWithName["BlueTeamTankAI"] = TankAI;
    objectWithName["BaseTankAI"] = TankAI;
    objectWithName["BlueTeamBigTurret"] = TowerAI;
    objectWithName["RedTeamBigTurret"] = TowerAI;
    objectWithName["BlueTeamSmallTurret"] = TowerAI;
    objectWithName["RedTeamSmallTurret"] = TowerAI;
    objectWithName["Helipad1"] = Helipad;
    objectWithName["Helipad2"] = Helipad;
    objectWithName["Helipad3"] = Helipad;
    objectWithName["Flag"] = Flag;
    objectWithName["BaseRed"] = MainHouse;
    objectWithName["BaseBlue"] = MainHouse;
    let currentMap = this.settings.map;
    let objectPositions = MapProp.map[currentMap];
    let objectProperties = MapProp.props;
    for (let objectName in objectPositions) {
      if (!objectWithName[objectName]) continue;
      for (let pos of objectPositions[objectName]) {
        if (this.settings.gameMode == "Flag" && objectName == "Flag") {
          let flag = new Flag();
          flag.maxPoint = objectProperties.Flag.maxPoint;
          this.onServerSpawn(flag, new Vector2(pos.position.x, pos.position.y));
          continue;
        }
        if (this.settings.gameMode == "Destroy") {
          if (objectName == "BaseRed" || objectName == "BaseBlue") {
            let gameObject = new objectWithName[objectName]();
            for (let property in objectProperties[objectName]) {
              gameObject[property] = objectProperties[objectName][property];
            }
            console.log("object", gameObject);
            this.onServerSpawn(
              gameObject,
              new Vector2(pos.position.x, pos.position.y)
            );
            continue;
          }
        }
        let objectPosition = new Vector2(pos.position.x, pos.position.y);
        let gameObject = null;
        if (
          objectWithName[objectName] != TankAI &&
          objectWithName[objectName] != TowerAI
        ) {
          gameObject = new objectWithName[objectName]();
        }

        for (let property in objectProperties[objectName]) {
          if (property == "AIBase") {
            console.log(objectProperties[objectName][property]);
            gameObject = new objectWithName[objectName](
              ...objectProperties[objectName][property],
              { ...objectPosition }
            );
            continue;
          }
          gameObject[property] = objectProperties[objectName][property];
        }
        // console.log(gameObject);
        // console.log(objectPosition);
        this.onServerSpawn(gameObject, objectPosition);
      }
    }
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
  updateBulletsRemove() {
    let lobby = this;
    let bullets = lobby.bullets;
    for (var i = bullets.length - 1; i >= 0; i--) {
      const isRemove = bullets[i].onUpdate2();
      if (isRemove) {
        this.bullets.splice(i, 1);
      }
    }
  }

  updateSkills() {
    // skill 1 type 001
    for (let i = this.skill.length - 1; i >= 0; i--) {
      let skill = this.skill[i];
      if (skill instanceof SkillOrientation) {
        if (skill.onUpdate()) {
          this.despawnSkill(skill);
        }
        if (skill.onUpdate2()) {
          this.destroySkill(skill);
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
          this.destroySkill(skill);
        }
      }
    }
  }

  onFireBullet3Tia(connection, data) {
    const { activator, position, direction } = data;
    const activeBy = this.connections.find((c) => {
      return c.player.id === activator;
    });
    // lech moi tia 30 do
    // tia 1
    let bullet1 = new Bullet(position, activeBy?.player?.tank, direction);
    bullet1.activator = activator;
    bullet1.team = activeBy?.player?.team;
    this.bullets.push(bullet1);
    const returnData1 = {
      name: "Bullet",
      id: bullet1.id,
      team: bullet1.team,
      activator,
      direction,
      position,
      bulletSpeed: activeBy?.player?.tank?.bulletSpeed || 6,
    };
    connection.socket.emit("serverSpawn", returnData1);
    connection.socket.broadcast.to(this.id).emit("serverSpawn", returnData1);

    // tia 2
    let direction2 = {};
    // y=sin , x =cos
    // sin(a+pi/6) = 0,866xsin(a) + 0,5cos(a)
    // cos(a+pi/6) = cosa + 0.866 - sina*0.5x
    direction2.y = 0.866 * direction.y + 0.5 * direction.x;
    direction2.x = 0.866 * direction.x - 0.5 * direction.y;
    let bullet2 = new Bullet(position, activeBy?.player?.tank, direction2);
    bullet2.activator = activator;
    bullet2.team = activeBy?.player?.team;
    this.bullets.push(bullet2);
    const returnData2 = {
      name: "Bullet",
      id: bullet2.id,
      team: bullet2.team,
      activator,
      direction: { ...direction2 },
      position,
      bulletSpeed: activeBy?.player?.tank?.bulletSpeed || bullet2.speed,
    };
    connection.socket.emit("serverSpawn", returnData2);
    connection.socket.broadcast.to(this.id).emit("serverSpawn", returnData2);

    // tia phai

    // sin(a-pi/6) =
    // cos(a-pi/6) = cosa + 0.866 + sina*0.5x

    let direction3 = {};
    direction3.y = 0.866 * direction.y - 0.5 * direction.x;
    direction3.x = 0.866 * direction.x + 0.5 * direction.y;

    let bullet3 = new Bullet(position, activeBy?.player?.tank, direction3);
    bullet3.activator = activator;
    bullet3.team = activeBy?.player?.team;
    this.bullets.push(bullet3);
    const returnData3 = {
      name: "Bullet",
      id: bullet3.id,
      team: bullet3.team,
      activator,
      direction: { ...direction3 },
      position,
      bulletSpeed: activeBy?.player?.tank?.bulletSpeed || bullet3.speed,
    };
    connection.socket.emit("serverSpawn", returnData3);
    connection.socket.broadcast.to(this.id).emit("serverSpawn", returnData3);
  }
  onFireBullet(connection = Connection, data, isAI = false, aiId) {
    const { activator, position, direction } = data;
    const activeBy = this.connections.find((c) => {
      return c.player.id === activator;
    });

    if (!isAI) {
      if (activeBy?.player?.effect?.threeBullet != 0) {
        this.onFireBullet3Tia(connection, data);
        return;
      }
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
      id: skillObject?.id,
      team: skillObject?.team,
      activator,
      direction,
      position,
      skillSpeed: skillObject?.speed,
    };

    connection.socket.emit("skillSpawn", returnData);
    connection.socket.broadcast.to(this.id).emit("skillSpawn", returnData);
  }

  createRegionSkill(data, activeBy, connection, skill, timeRemain) {
    const { position, activator, typeId, num } = data;
    if (
      activeBy.player.position.Distance(new Vector2(position.x, position.y)) >
      skill.range
    ) {
      skill.timeCounter = 0;
      return;
    }

    let skillObj = new SkillRegion(position, skill);
    skillObj.activator = activator;
    skillObj.team = activeBy?.player?.team;
    skillObj.timeRemain = timeRemain;
    skillObj.direction = data?.direction;
    this.skill.push(skillObj);

    const returnData = {
      name: "skillRegion",
      activator,
      id: skillObj.id,
      typeId,
      num,
      position,
      direction: skillObj.direction,
    };

    connection.socket.emit("skillSpawn", returnData);
    connection.socket.broadcast.to(this.id).emit("skillSpawn", returnData);
    return skillObj.id;
  }

  createSkillMove(connection, data, range) {
    const { position, direction, enemyId } = data;

    const returnData = {
      name: "skillMove",
      id: enemyId,
      position: {
        x: position.x - direction.x * range,
        y: position.y - direction.y * range,
      },
    };
    connection.socket.emit("updatePosition", returnData);
    connection.socket.broadcast.to(this.id).emit("updatePosition", returnData);
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
    return skillBuff;
  }

  onSkill(connection, data) {
    const { typeId, activator, num } = data;
    const activeBy = this.connections.find((c) => {
      return c.player.id === activator;
    });
    let [time1, time2, time3, timeFull1, timeFull2, timeFull3] = [
      activeBy.player.tank.skill1.timeCounter,
      activeBy.player.tank.skill2.timeCounter,
      activeBy.player.tank.skill3.timeCounter,
      activeBy.player.startTank.skill1.timeCounter,
      activeBy.player.startTank.skill2.timeCounter,
      activeBy.player.startTank.skill3.timeCounter,
    ];
    if (num == 1) {
      if (time1 > 0) {
        return;
      }
      activeBy.player.tank.skill1.timeCounter = timeFull1;
      console.log("hoi chieu ", timeFull1);
    }
    if (num == 2) {
      if (time2 > 0) return;
      activeBy.player.tank.skill2.timeCounter = timeFull2;
    }
    if (num == 3) {
      if (time3 > 0) return;
      activeBy.player.tank.skill3.timeCounter = timeFull3;
    }
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
        connection.player.startTank?.skill3,
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
    } else if (typeId === "003" && num === 1) {
      // luot va buff
      // this.createSkillMove(
      //   connection,
      //   data,
      //   activeBy?.player?.tank?.skill1?.range
      // );
      activeBy.player.effect.autoMove = {
        speed: 0,
        startPos: data.position,
        direction: data.direction,
        range: activeBy?.player?.tank?.skill1?.range,
      };
      activeBy.player.tank.speed = 30;
      activeBy.player.effect.slowled.push({
        value: -50,
        time: 0.2,
      });
      activeBy.socket.emit("startAutoMove", {
        id: activeBy.player.id,
        direction: data.direction,
        speed: 30, // toc bien
        startPos: data.position,
        range: activeBy?.player?.tank?.skill1?.range,
        rotate: false,
      });
      activeBy.socket.broadcast.to(this.id).emit("startAutoMove", {
        id: activeBy.player.id,
        direction: data.direction,
        speed: 30, // toc bien
        startPos: data.position,
        range: activeBy?.player?.tank?.skill1?.range,
        rotate: false,
      });

      this.createBuffSkill(
        connection,
        [connection.player.id],
        connection?.player?.tank?.skill1?.timeEffect,
        typeId,
        num
      );
      Skill003.Skill1Handler(
        connection,
        connection.player.startTank.skill1,
        this
      );
    } else if (typeId == "003" && num === 2) {
      if (activeBy.player.tank.skill2.activeId != "") {
        // bay den activeid
        activeBy.socket.emit("startFocusOn", { id: activeBy.player.id });
        activeBy.player.effect.focusOn = {
          focusId: activeBy.player.tank.skill2.activeId,
          speed: activeBy.player.tank.skill2.enemySpeed,
        };
        activeBy.player.tank.skill2.activeId = "";
      } else {
        data.position.x -= data.direction.x * 0.5;
        data.position.y -= data.direction.y * 0.5;
        this.createRegionSkill(
          data,
          activeBy,
          connection,
          activeBy?.player?.tank?.skill2,
          0.3
        );
      }
    } else if (typeId === "003" && num === 3) {
      console.log("xxxx", connection.player.tank.skill3.range);
      let towerAI = new TowerAI(
        connection.player.tank.skill3.tower,
        connection.player.team
      );

      towerAI.aiId = "003_3";
      towerAI.oldPosition = new Vector2(data.position.x, data.position.y);

      towerAI.timeRemain = connection.player.tank.skill3.timeEffect;
      if (
        connection.player.position.Distance(
          new Vector2(data.position.x, data.position.y)
        ) > connection.player.tank.skill3.range
      ) {
        connection.player.tank.skill3.timeCounter = 0;
        return;
      }

      this.onServerSpawn(
        towerAI,
        new Vector2(data.position.x, data.position.y)
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
    if (typeId == "003" && num === 2) {
      Skill003.Skill2Handler(connection, data, this);
    }
  }
  onTouchItem(connection, data) {
    const id = data.id;
    const item = this.serverItems.find((item) => item.id == id);
    if (!item) return;
    const owner = this.serverItems.find((owner) => owner.id == item.ownerId);
    owner.isActive = false;
    const type = item.type;
    item.isActive = false;
    switch (type) {
      case "Armor":
        item.buffArmor(connection, data, this);
        break;
      case "Damage":
        item.buffDamage(connection, data, this);
        break;
      case "Speed":
        item.buffSpeed(connection, data, this);
        break;
      case "Hp":
        item.buffHp(connection, data, this);
        break;
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
      time: GameInfor.PlayerRespawnTime * subjectOfAttack.dead,
    };
    connection.socket.emit("playerDied", returnData);
    connection.socket.broadcast.to(this.id).emit("playerDied", returnData);
  }
  onCollisionDestroy(connection = Connection, data) {
    const lobby = this;
    const returnBullet = this.bullets.filter((e) => e.id == data.id);
    console.log("bullet get", returnBullet);
    returnBullet.forEach((bullet) => {
      bullet.isDestroyed = true;
      let enemyId = data?.enemyId;

      let connection1 = lobby.connections.find((c) => {
        return c.player.id === enemyId;
      });

      const ai = lobby.serverItems.find((s) => {
        return s.id === enemyId;
      });

      const subjectOfAttack = connection1?.player ? connection1?.player : ai;
      if (!subjectOfAttack || subjectOfAttack?.isDead) {
        return;
      }
      let isDead = false;
      if (subjectOfAttack.team != bullet.team) {
        isDead = subjectOfAttack.dealDamage(bullet?.tank?.damage);
      }

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
        connection.socket.emit("stopLoading", potion.id);
        connection.socket.broadcast.to(lobby.id).emit("stopLoading", potion.id);

        let returnData1 = {
          id: potion.id,
          health: potion.health,
        };
        connection.socket.emit("playerAttacked", returnData1);
        connection.socket.broadcast
          .to(lobby.id)
          .emit("playerAttacked", returnData1);
        let returnData = {
          id: enemyId,
        };
        connection.socket.emit("boxDied", returnData);
        connection.socket.broadcast.to(lobby.id).emit("boxDied", returnData);
        const index = this.serverItems.indexOf(potion);
        this.serverItems.splice(index, 1);
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
  onCollisionDestroyBox(connection = Connection, data) {
    let lobby = this;
    let id = data?.id;
    let enemyId = data?.enemyId;
    const box = this.serverItems.find((item) => item.id == enemyId);
    if (!box) return;
    const returnBullet = lobby.bullets.filter((e) => e.id == id);
    returnBullet.forEach((bullet) => {
      let isDead = false;
      bullet.isDestroyed = true;
      isDead = box.dealDamage(bullet?.tank?.damage || 5);
      if (isDead) {
        let returnData = {
          id: enemyId,
        };
        connection.socket.emit("serverUnSpawn", returnData);
        connection.socket.broadcast
          .to(lobby.id)
          .emit("serverUnSpawn", returnData);
        this.spawnRandomItem(box);
      } else {
        let returnData = {
          id: box.id,
          health: box.health,
        };
        connection.socket.emit("playerAttacked", returnData);
        connection.socket.broadcast
          .to(lobby.id)
          .emit("playerAttacked", returnData);
      }
    });
  }
  randomInRange(max, min) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  spawnRandomItem(owner) {
    const nonActiveItems = this.listItem.filter(
      (item) => item.isActive == false
    );
    let index;
    if (owner instanceof BaseBox)
      index = this.randomInRange(nonActiveItems.length, -1);
    else {
      index = this.randomInRange(nonActiveItems.length - 1, 0);
    }
    const item = nonActiveItems[index];
    if (item) {
      item.ownerId = owner.id;
      item.isActive = true;
      this.onServerSpawn(item, owner.position);
    }
  }

  despawnBullet(bullet = Bullet) {
    let returnData = { id: bullet.id };
    const lobby = this;
    lobby.connections.forEach((connection) => {
      connection.socket.emit("serverUnSpawn", returnData);
    });
  }
  despawnSkill(skill) {
    this.connections.forEach((connection) => {
      connection.socket.emit("severUnspawnSkill", {
        id: skill.id,
      });
    });
  }
  destroySkill(skill) {
    let index = this.skill.indexOf(skill);
    if (index > -1) {
      this.skill.splice(index, 1);
    }
  }
  despawnItem(item) {
    const index = this.serverItems.indexOf(item);
    this.serverItems.splice(index, 1);
    const returnData = { id: item.id };
    this.connections.forEach((connection) => {
      connection.socket.emit("serverUnSpawn", returnData);
    });
  }

  endSkillBuff(skill) {
    let index = this.skill.indexOf(skill);

    if (index > -1) {
      this.skill.splice(index, 1);
    }
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
  reloadGame(connection = Connection) {
    // update map
    connection.socket.emit("reloadGame", {
      map: this.settings.map,
      gameMode: this.settings.gameMode,
      time: this.matchTime,
    });
    const returnData = {
      state: this.lobbyState.currentState,
    };

    connection.socket.emit("lobbyUpdate", returnData);
    // reload kill dead
    this.killUpdate();
    // reload all player
    console.log("reload game", connection.player._id);
    console.log("reload game", this.connections.length);
    this.connections.forEach((c) => {
      connection.socket.emit("spawn", {
        id: c.player.id,
        position: c.player.position,
        team: c.player.team,
        tank: c.player.tank,
        health: c.player.health,
        maxHealth: c.player.startTank.health,
      });
    });

    // reload serverItems
    this.serverItems.forEach((item) => {
      connection.socket.emit("serverSpawn", {
        id: item.id,
        aiId: item?.aiId,
        name: item.username,
        health: item?.health,
        maxHealth: item?.maxHealth,
        team: item?.team || 0,
        position: item?.position,
        type: item?.type,
        point: item?.point,
        maxPoint: item?.maxPoint,
      });
    });
    // reload list item
    this.listItem.forEach((item) =>
      connection.socket.emit("serverSpawn", {
        id: item.id,
        aiId: item?.aiId,
        name: item.username,
        health: item?.health,
        maxHealth: item?.maxHealth,
        team: item?.team || 0,
        position: item?.position,
        type: item?.type,
      })
    );
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
    connection.player.isOnline = true;
    let tank = connection.player?.startTank;
    // chua chon tank
    if (!tank) {
      const tankList = await TankService.getTankByUserId(connection.player._id);
      if (!tankList[0]?.tankList) {
        console.log(connection.player.id, "ko co tank");
        return false;
      }
      for (const tankRemain of tankList[0]?.tankList) {
        // dang ban

        if (tankRemain.remaining > 0 && !tankRemain?.isSelling) {
          tank = tankRemain.tank;
          connection.player.startTank = JSON.parse(JSON.stringify(tank));
          connection.player.startTank.tankUserId = tankRemain._id;
          connection.player.maxHealth = connection.player.startTank.health;
          connection.player.tank = JSON.parse(JSON.stringify(tank));
          break;
        }
      }
    }
    if (!tank) {
      console.log(connection.player.id, "ko co tank remain >0");
      return false;
    }
    const tankUser = await TankService.getByTankUserById(
      connection.player.startTank.tankUserId,
      connection.player._id
    );

    if (!tankUser || tankUser?.remaining <= 0 || tankUser?.isSelling) {
      console.log("chon tank check remain fail", connection.player.id);
      return false;
    }
    await TankService.updateRemaining(connection.player.startTank.tankUserId);

    connection.player.health = tank.health;
    console.log(
      `spawn player ${connection.player.id} team ${connection.player.team}`,
      this.connections.length
    );
    const returnData = {
      id: connection.player.id,
      position: connection.player.spawnPos,
      team: connection.player.team,
      tank,
      health: tank?.health,
      maxHealth: connection?.player?.startTank?.health,
    };
    console.log(
      "sp player",
      connection.player.position,
      connection.player.spawnPos
    );
    socket.emit("spawn", returnData); //tell myself I have spawned
    socket.broadcast.to(lobby.id).emit("spawn", returnData); // Tell other

    // tell another to me
    // connections.forEach((c) => {
    //   if (c.player.id != connection.player.id) {
    //     socket.emit("spawn", {
    //       id: c.player.id,
    //       position: c.player.position,
    //       tank,
    //     });
    //   }
    // });
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
          player.position.x = player.spawnPos.x;
          player.position.y = player.spawnPos.y;

          let returnData = {
            id: player.id,
            position: {
              x: player.spawnPos.x,
              y: player.spawnPos.y,
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
              health: ai.maxHealth,
            };

            socket.emit("playerRespawn", returnData);
            socket.broadcast.to(lobby.id).emit("playerRespawn", returnData);
          }
        }
      }
    });
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
    console.log(
      "hoi mau",
      connection.player.health + "||" + connection.player.maxHealth
    );
    if (
      !potion ||
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
    connection.socket.emit("skillEffectAnimation", {
      enemyId: player.id,
      efId: potion.id,
      remove: false, // remove game object tao ra hieu ung nay
    });
    connection.socket.broadcast.to(lobby.id).emit("skillEffectAnimation", {
      enemyId: player.id,
      efId: potion.id,
      remove: false,
    });
    potion.isActive = false;
    player.effect.burned.push({
      id: potion.id,
      countTime: 0,
      ...potion.healing,
    });
  }
  OnUpdateEffectCooldown() {
    for (let item of this.serverItems) {
      if (item?.isActive != undefined && !item.isActive) {
        if (item instanceof Potion && !item.isDead && item.coolDown()) {
          for (let connection of this.connections)
            connection.socket.emit("stopLoading", item.id);
        }
        if (item instanceof Helipad && item.coolDown()) {
          this.spawnRandomItem(item);
          item.isActive = true;
        }
      }
    }
  }
  OnUpdateEffectTime() {
    for (let connection of this.connections) {
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
      if (connection.player.effect.threeBullet != 0) {
        connection.player.onThreeBulletCouter();
      }
      if (connection.player.effect.tiedUp.length > 0) {
        LobbyEffect.onTiedUpEffect(connection, this);
      }
      if (connection.player.effect.autoMove) {
        LobbyEffect.onAutoMoveEffect(connection, this);
      }
      if (connection.player.effect.focusOn) {
        LobbyEffect.onFoucusEffect(connection, this);
      }
      connection.player.onSkillCounter(connection);
    }
  }
  SendMessage(connection, data) {
    filter.addWords(...BadWords);
    let content = filter.clean(data.text);
    const toTeam = data.toTeam;
    const returnData = {
      text: content,
      id: connection.player.id,
    };
    if (!toTeam) {
      connection.socket.emit("receivedMessage", returnData);
      connection.socket.broadcast
        .to(this.id)
        .emit("receivedMessage", returnData);
    } else {
      this.connections.forEach((c) => {
        if (c.player.team == connection.player.team) {
          c.socket.emit("receivedMessage", returnData);
        }
      });
    }
  }
};
