const shortID = require("shortid");
const Connection = require("../playerManagement/Connection");
const ServerItem = require("../../utility/ServerItem");
const Vector2 = require("../../dto/Vector2");

// lobby base quan ly base lobby connection and server item join left
module.exports = class LobbyBase {
  constructor() {
    this.id = shortID.generate();
    this.connections = [];
    this.serverItems = [];
  }
  onUpdate() {
    const lobby = this;
  }
  onEnterLobby(connection = Connection) {
    let lobby = this;
    let player = connection.player;

    console.log(
      "Player " + player._id + " has entered the lobby (" + lobby.id + ")"
    );

    lobby.connections.push(connection);
    //  player.team = 2 - (this.connections.length % 2); // team 1 2
    player.lobby = lobby.id;
    connection.lobby = lobby;
  }
  onLeaveLobby(connection = Connection) {
    console.log(`player ${connection.player._id} leave lobby ${this.id}`);
    connection.lobby = undefined;
    let index = this.connections.indexOf(connection);
    if (index > -1) {
      this.connections.splice(index, 1);
    }
  }
  onServerSpawn(item, position = Vector2) {
    let lobby = this;
    let serverItems = lobby.serverItems;
    let connections = lobby.connections;

    item.position = position;
    serverItems.push(item);
    connections.forEach((connection) => {
      connection.socket.emit("serverSpawn", {
        id: item.id,
        aiId: item?.aiId,
        name: item.username,
        health: item?.health,
        maxHealth: item?.maxHealth,
        point: item?.point,
        maxPoint: item?.maxPoint,
        team: item?.team || 0,
        position,
        type: item?.type,                                                                                     
      });
    });
  }
  onServerUnspawn(item = ServerItem) {
    let lobby = this;
    let connections = lobby.connections;

    lobby.deleteServerItem(item);
    connections.forEach((connection) => {
      connection.socket.emit("serverUnspawn", {
        id: item.id,
      });
    });
  }
  onDeleteServerItem(item = ServerItem) {
    let lobby = this;
    let serverItems = lobby.serverItems;
    let index = serverItems.indexOf(item);

    if (index > -1) {
      serverItems.splice(index, 1);
    }
  }
};
