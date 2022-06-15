const Vector2 = require("../../dto/Vector2");

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
      gameServer.onDisconnected(connection);
    });
    socket.on("joinGame", () => {
      console.log("join game", this.player.id);
      gameServer.onAttemptToJoinGame(this);
    });

    // in game
    // general
    socket.on("fireBullet", (data) => {
      connection.lobby.onFireBullet(connection, data, false);
    });
    socket.on("collisionDestroy", (data) => {
      this.lobby.onCollisionDestroy(this, data);
    });
    socket.on("updatePosition", ({ position }) => {
      player.position = new Vector2(position.x, position.y);
      socket.broadcast.to(this.lobby.id).emit("updatePosition", player);
    });
    socket.on("updateRotation", (data) => {
      player.tankRotation = data.tankRotation;
      player.barrelRotation = data.barrelRotation;

      socket.broadcast.to(this.lobby.id).emit("updateRotation", player);
    });
    socket.on("quitGame", (data) => {
      server.onSwitchLobby(this, server.generalServerID);
    });
    // skill
  }
}

module.exports = Connection;
