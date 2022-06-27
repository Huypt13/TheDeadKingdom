const LobbyBase = require("./LobbyBase");
const LobbyState = require("../../utility/LobbyState");
const Vector2 = require("../../dto/Vector2");
const Bullet = require("../gamePlay/serverObjects/Bullet");
const TankAI = require("../aiManagement/TankAI");
const AIBase = require("../aiManagement/AIBase");
const Connection = require("../playerManagement/Connection");
const TowerAI = require("../aiManagement/TowerAI");
const TankService = require("../../api/hero/Tank.service");

module.exports = class GameLobby extends LobbyBase {
  constructor(settings = GameLobbySettings) {
    super();
    this.settings = settings;
    this.lobbyState = new LobbyState();
    this.bullets = [];
    this.waitingTime = 0;
    this.matchTime = 0; // time tran dau
    this.sendTime = 0; // time gui time tran dau xuong client
    this.endGameLobby = function () {};
  }
  async onUpdate() {
    super.onUpdate();
    const lobby = this;
    // let serverItems = lobby.serverItems;

    lobby.updateBullets();
    lobby.updateDeadPlayers();
    lobby.updateAIDead();
    lobby.onUpdateAI();
    lobby.onMatchTime();
    await lobby.onJoinGame();
    //

    //Clos lobby because no one is here
    if (lobby.connections.length == 0) {
      lobby.endGameLobby();
    }
  }

  onMatchTime() {
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
    if ((this.lobbyState.currentState = this.lobbyState.GAME)) {
      if (this.settings.gameMode == "CountKill") {
        onCountKillWin();
      }
    }
  }

  onCountKillWin() {}

  async onJoinGame() {
    if (this.lobbyState.currentState == this.lobbyState.WAITING) {
      this.waitingTime += +0.1;
      if (this.waitingTime > 10) {
        this.waitingTime = 0;
        this.lobbyState.currentState = this.lobbyState.GAME;
        if (this.connections.length > 0) {
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

          await this.onSpawnAllPlayersIntoGame();
          this.onSpawnAIIntoGame();
        }
      }
    }
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
  async someOneChooseHero(connection, tankId) {
    // check tank dc chon chua

    // neu tank chua dc chon

    connection.player.tank = await TankService.getByTankId(tankId);
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
      };

      console.log(returnData1);
      socket.emit("loadWating", returnData1);
      socket.broadcast.to(lobby.id).emit("loadWating", returnData1);
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
      lobby.connections.forEach((connection) => {
        if (connection != undefined) {
          connection.socket.emit("unloadGame");
          connection.server.onSwitchLobby(
            connection,
            connection.server.generalServerID
          );
        }
      });
    }
  }
  async onSpawnAllPlayersIntoGame() {
    let lobby = this;
    let connections = lobby.connections;

    for (const connection of connections) {
      const addSuccess = await lobby.addPlayer(connection);
      if (!addSuccess) {
        // huy room thong bao cho ng dung
      }
    }
  }
  onSpawnAIIntoGame() {
    const tankAi = {
      speed: 0.15,
      rotationSpeed: 0.3,
      damage: 20,
      health: 160,
      attackSpeed: 1,
      bulletSpeed: 1, // 100 ms
      shootingRange: 6,
    };
    this.onServerSpawn(
      new TankAI("01", new Vector2(-6, 2), 4, tankAi, 1),
      new Vector2(-6, 2)
    );
    this.onServerSpawn(
      new TankAI("01", new Vector2(-6, 4), 4, tankAi, 2),
      new Vector2(-6, 4)
    );
    this.onServerSpawn(
      new TankAI("01", new Vector2(-3, 4), 4, tankAi, 2),
      new Vector2(-3, 4)
    );
    // this.onServerSpawn(
    //   new TankAI("01", new Vector2(-6, 6), 4, tankAi, 0),
    //   new Vector2(5, 2)
    // );
    // this.onServerSpawn(new TowerAI("01", tankAi, 1), new Vector2(-3, 0));
    // this.onServerSpawn(new TowerAI("01", tankAi, 0), new Vector2(-5, 0));
    // this.onServerSpawn(new TowerAI("01", tankAi, 2), new Vector2(-1, 0));
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
  onCollisionDestroy(connection = Connection, data) {
    const lobby = this;
    const returnBullet = this.bullets.filter((e) => e.id == data.id);
    console.log(returnBullet.length);
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
      if (subjectOfAttack.team != bullet.team) {
        isDead = subjectOfAttack.dealDamage(bullet?.tank?.damage || 5);
      }

      console.log("health ", subjectOfAttack.health);

      if (isDead) {
        let returnData = {
          id: subjectOfAttack.id,
        };
        connection.socket.emit("playerDied", returnData);
        connection.socket.broadcast.to(lobby.id).emit("playerDied", returnData);
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
        return false;
      }
      for (const tankRemain of tankList[0]?.tankList) {
        if (tankRemain.remaining > 0) {
          tank = tankRemain.tank;
          connection.player.tank = tankRemain.tank;
          console.log(tank);
          break;
        }
      }
    }
    if (!tank) {
      return false;
    }
    const tankUser = await TankService.getByTankUserById(
      tank._id,
      connection.player.id
    );
    if (!tankUser || tankUser?.remaining <= 0) {
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
    console.log("return data spawn player", returnData);
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
  }
  removePlayer(connection = Connection) {
    let lobby = this;

    connection.socket.broadcast.to(lobby.id).emit("disconnected", {
      id: connection.player.id,
    });
  }
  getRandomSpawn() {}
  getRndInteger(min, max) {}
};
