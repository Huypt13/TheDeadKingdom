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
      "Player " + player.id + " has entered the lobby (" + lobby.id + ")"
    );

    lobby.connections.push(connection);
    player.team = 2 - (this.connections.length % 2); // team 1 2
    player.lobby = lobby.id;
    connection.lobby = lobby;
  }
  onLeaveLobby(connection = Connection) {
    console.log(`player ${connection.player.id} leave lobby ${this.id}`);
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

    //Set Position
    item.position = position;
    //Set item into the array
    serverItems.push(item);
    //Tell everyone in the room
    console.log("onserver spawn", item.aiId, item?.team);
    connections.forEach((connection) => {
      connection.socket.emit("serverSpawn", {
        id: item.id,
        aiId: item?.aiId,
        name: item.username,
        health: item?.health,
        team: item?.team || 0,
        position,
      });
    });
  }
  onServerUnspawn(item = ServerItem) {
    let lobby = this;
    let connections = lobby.connections;

    //Remove item from array
    lobby.deleteServerItem(item);
    //Tell everyone in the room
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

    //Remove our item out the array
    if (index > -1) {
      serverItems.splice(index, 1);
    }
  }
};