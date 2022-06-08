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
    const lobby = this.lobby;

    socket.on("disconnect", () => {});
    socket.on("joinGame", () => {});

    // in game
    // general
    socket.on("fireBullet", (data) => {});
    socket.on("collisionDestroy", (data) => {});
    socket.on("updatePos", (data) => {});
    socket.on("updateRotation", ({ tankRotation, barrelRotation }) => {});

    // skill
  }
}

module.exports = Connection;
