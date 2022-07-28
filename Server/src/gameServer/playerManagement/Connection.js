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
      if (connection.lobby instanceof GameLobby)
        this.lobby.onCollisionDestroy(this, data);
    });
    socket.on("updatePosition", ({ position }) => {
      if (connection.lobby instanceof GameLobby) {
        player.position = new Vector2(position.x, position.y);
        socket.broadcast.to(this.lobby.id).emit("updatePosition", player);
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
    socket.on('collisionDestroyWoodBox', (data) => {
      if (connection.lobby instanceof GameLobby)
      this.lobby.onCollisionDestroyWoodBox(this, data);
    });
    socket.on("PlayerTouchItem", (data) => {
      if (connection.lobby instanceof GameLobby) {
        this.lobby.onTouchItem(this, data);
      }
    });
  }
}

module.exports = Connection;
