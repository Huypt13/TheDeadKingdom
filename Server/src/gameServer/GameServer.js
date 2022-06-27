const shortid = require("shortid");

const Connection = require("./playerManagement/Connection");
const LobbyBase = require("./lobbyManagement/LobbyBase");
const Player = require("./playerManagement/Player");
const GameLobby = require("./lobbyManagement/GameLobby");
const GameLobbySetting = require("./lobbyManagement/GameLobbySetting");

// server game manage all lobby , all connections
// co the tao nhieu server

class GameServer {
  constructor() {
    this.connections = [];
    this.lobbys = [];
    this.generalServerID = "General Server";
    this.startLobby = new LobbyBase();
    this.startLobby.id = this.generalServerID;
    this.lobbys[this.generalServerID] = this.startLobby;
  }
  async onUpdate() {
    // update all lobby each 100ms

    for (let id in this.lobbys) {
      await this.lobbys[id].onUpdate();
    }
  }

  onConnected(socket, { username, id }) {
    // tao connection va add vao connections
    // join lobby
    // startlobby index =0
    // check lobby in game ?
    // if in game reconnect

    const gameServer = this;
    let connection = new Connection();
    connection.socket = socket;
    connection.player = new Player({
      username,
      id,
    });
    connection.player.lobby = gameServer.startLobby.id;
    connection.gameServer = gameServer;

    let player = connection.player;
    let lobbys = gameServer.lobbys;

    console.log("Added new player to the server (" + player.id + ")");
    gameServer.connections[player.id] = connection;

    socket.join(player.lobby);
    connection.lobby = lobbys[player.lobby];
    connection.lobby.onEnterLobby(connection);

    return connection;
  }
  onDisconnected(connection = Connection) {
    // xoa connection trong gameserver.connections
    // leave khoi game lobby

    const gameServer = this;
    const id = connection.player.id;
    delete gameServer.connections[id];
    console.log("Player " + connection.player.id + " has disconnected");

    // leave lobby
    const currentLobbyId = connection.player.lobby;
    gameServer.lobbys[currentLobbyId].onLeaveLobby(connection);

    // check de close lobby
    if (
      currentLobbyId != gameServer.generalServerID &&
      gameServer.lobbys[currentLobbyId] != undefined &&
      gameServer.lobbys[currentLobbyId].connections.length == 0
    ) {
      gameServer.closeDownLobby(currentLobbyId);
    }
  }
  onSwitchLobby(connection = Connection, lobbyID) {
    const gameServer = this;
    let lobbys = gameServer.lobbys;

    connection.socket.join(lobbyID); // Join the new lobby's socket channel
    connection.lobby = lobbys[lobbyID]; //assign reference to the new lobby

    lobbys[connection.player.lobby].onLeaveLobby(connection);
    lobbys[lobbyID].onEnterLobby(connection);
  }
  onAttemptToJoinGame(connection = Connection) {
    let lobbyFound = false;
    let gameLobbies = [];
    for (let id in this.lobbys) {
      if (this.lobbys[id] instanceof GameLobby) {
        gameLobbies.push(this.lobbys[id]);
      }
    }

    console.log("Found (" + gameLobbies.length + ") lobbies on the server");

    gameLobbies.forEach((lobby) => {
      if (!lobbyFound) {
        let canJoin = lobby.canEnterLobby(connection);

        if (canJoin) {
          lobbyFound = true;
          this.onSwitchLobby(connection, lobby.id);
        }
      }
    });
    //All game lobbies full or we have never created one
    if (!lobbyFound) {
      console.log("Making a new game lobby");
      let gamelobby = new GameLobby(
        new GameLobbySetting("CountKill", 1, 1, null)
      );
      gamelobby.endGameLobby = () => {
        console.log("end lobby");
        this.closeDownLobby(gamelobby.id);
      };
      this.lobbys[gamelobby.id] = gamelobby;
      this.onSwitchLobby(connection, gamelobby.id);
    }
  }
  closeDownLobby(id) {
    console.log(`closing ${id}`);
    delete this.lobbys[id];
  }
}

module.exports = GameServer;