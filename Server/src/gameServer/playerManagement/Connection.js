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
      connection.lobby.someOneChooseHero(connection, data);
    });
    // in game
    // general
    socket.on("fireBullet", (data) => {
      if (connection.lobby instanceof GameLobby)
        connection.lobby.onFireBullet(connection, data, false);
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
    // skill
  }
}

module.exports = Connection;
