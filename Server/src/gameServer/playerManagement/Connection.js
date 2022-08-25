const Vector2 = require("../../dto/Vector2");
const GameLobby = require("../lobbyManagement/GameLobby");

class Connection {
  constructor() {
    this.socket;
    this.player;
    this.gameServer;
    this.lobby;
  }
  createEvents() {
    try {
      const socket = this.socket;
      const player = this.player;
      const gameServer = this.gameServer;
      const connection = this;

      socket.on("disconnect", () => {
        console.log("disconnect cmnr");
        gameServer.onDisconnected(connection);
      });
      socket.on("joinGame", () => {
        console.log("join game", this.player.id);
        gameServer.onAttemptToJoinGame(this);
      });

      // choose hero
      socket.on("chooseHero", (data) => {
        if (connection.lobby instanceof GameLobby)
          connection.lobby.someOneChooseHero(connection, data);
      });
      // in game
      // general
      socket.on("fireBullet", (data) => {
        if (connection.lobby instanceof GameLobby)
          connection.lobby.onFireBullet(connection, data, false);
      });

      // nhan skill 1
      socket.on("skill", (data) => {
        if (connection.lobby instanceof GameLobby) {
          connection.lobby.onSkill(connection, data);
        }
      });
      socket.on("touchSkill", (data) => {
        if (connection.lobby instanceof GameLobby) {
          this.lobby.onTouchSkill(this, data);
        }
      });
      socket.on("exitSkill", (data) => {
        if (connection.lobby instanceof GameLobby) {
          this.lobby.onExitSkill(this, data);
        }
      });
      socket.on("collisionDestroy", (data) => {
        if (connection.lobby instanceof GameLobby) {
          console.log("trung dan", data);
          this.lobby.onCollisionDestroy(this, data);
        }
      });
      socket.on("updatePosition", ({ position }) => {
        if (connection.lobby instanceof GameLobby) {
          player.position = new Vector2(position.x, position.y);
          socket.broadcast
            .to(this.lobby.id)
            .emit("updatePosition", { ...player, type: 1 });
        }
      });
      socket.on("stopAutoMoving", () => {
        if (connection.lobby instanceof GameLobby) {
          player.effect.autoMove = null;
          player.tank.speed = player.startTank.speed;
          console.log("stop Moving", player.tank.speed);
        }
      });
      socket.on("updateRotation", (data) => {
        if (connection.lobby instanceof GameLobby) {
          player.tankRotation = data.tankRotation;
          player.barrelRotation = data.barrelRotation;
          socket.broadcast.to(this.lobby.id).emit("updateRotation", player);
        }
      });
      socket.on("quitGame", (data) => {
        gameServer.onSwitchLobby(this, gameServer.generalServerID);
      });
      socket.on("onCollisionHealHpEffects", (data) => {
        if (connection.lobby instanceof GameLobby) {
          const id = data.id;
          this.lobby.onCollisionHealHpEffects(this, id);
        }
      });
      socket.on("collisionDestroyHpBox", (data) => {
        if (connection.lobby instanceof GameLobby)
          this.lobby.onCollisionDestroyHpBox(this, data);
      });
      socket.on("collisionDestroyBox", (data) => {
        if (connection.lobby instanceof GameLobby) {
          this.lobby.onCollisionDestroyBox(this, data);
        }
      });
      socket.on("PlayerTouchItem", (data) => {
        if (connection.lobby instanceof GameLobby) {
          this.lobby.onTouchItem(this, data);
        }
      });
      socket.on("UpdatePoint", (data) => {
        if (connection.lobby instanceof GameLobby) {
          this.lobby.dealPointFlag(data, connection);
        }
      });
      socket.on("sendMessage", (data) => {
        if (connection.lobby instanceof GameLobby)
          this.lobby.SendMessage(this, data);
      });
    } catch (error) {
      console.log("connection error", error);
    }
  }
}

module.exports = Connection;
