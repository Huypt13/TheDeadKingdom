const shortid = require("shortid");

const Vector2 = require("../dto/Vector2");

const MapProps = require("./lobbyManagement/MapProps");

const _ = require("lodash");

const Connection = require("./playerManagement/Connection");
const LobbyBase = require("./lobbyManagement/LobbyBase");
const Player = require("./playerManagement/Player");
const GameLobby = require("./lobbyManagement/GameLobby");
const GameLobbySetting = require("./lobbyManagement/GameLobbySetting");
const GameInfor = require("../helper/GameInfor.helper");
const GameType = require("./lobbyManagement/GameType");
const Maps = require("./lobbyManagement/Maps");
const UserService = require("../api/user/User.service");
const Ranking = require("../helper/Ranking.helper");

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

  onConnected(socket, { username, id, _id }) {
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
      _id,
    });
    connection.player.lobby = gameServer.startLobby.id;
    connection.gameServer = gameServer;

    let player = connection.player;
    let lobbys = gameServer.lobbys;

    console.log("Added new player to the server (" + player._id + ")");
    gameServer.connections[player._id] = connection;

    socket.join(player.lobby);
    connection.lobby = lobbys[player.lobby];
    connection.lobby.onEnterLobby(connection);

    return connection;
  }
  onDisconnected(connection = Connection) {
    // xoa connection trong gameserver.connections
    // leave khoi game lobby

    const gameServer = this;
    const _id = connection.player._id;

    console.log("Player " + connection.player._id + " has disconnected");
    const currentLobbyId = connection.player.lobby;
    // neu dang o general lobby thi leave
    if (currentLobbyId == gameServer.generalServerID) {
      delete gameServer.connections[_id];
      gameServer.lobbys[currentLobbyId].onLeaveLobby(connection);
    }
    connection.player.isOnline = false;
    // check de close lobby
    if (
      currentLobbyId != gameServer.generalServerID &&
      gameServer.lobbys[currentLobbyId] != undefined &&
      gameServer.lobbys[currentLobbyId].connections.reduce((pre, cur) => {
        return (pre += cur.player.isOnline ? 1 : 0);
      }, 0) == 0
    ) {
      console.log("close lobby", currentLobbyId);
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

  async onAttemptToJoinGame(connection = Connection) {
    let lobbyFound = false;
    let gameLobbies = [];
    const userInfor = await UserService.getUserInfor(connection.player._id);
    console.log(userInfor);
    for (let id in this.lobbys) {
      if (
        this.lobbys[id] instanceof GameLobby &&
        this.lobbys[id].lobbyState.currentState ==
          this.lobbys[id].lobbyState.LOBBY &&
        this.lobbys[id].settings?.roomLevel ==
          Ranking.getLevelRank(userInfor.numOfStars)
      ) {
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
      // random type
      const type = _.shuffle(GameType.types)[0]; // random type
      console.log("Making a new game lobby", type);

      let gamelobby = new GameLobby(
        new GameLobbySetting(
          type,
          GameInfor[`${type}MaxPlayer`],
          GameInfor[`${type}MinPlayer`],
          Ranking.getLevelRank(userInfor.numOfStars)
        )
      );
      // random map
      gamelobby.settings.map = _.shuffle(Maps[type])[0];
      console.log("map", gamelobby.settings.map);
      gamelobby.settings.tankSpawnPosition =
        MapProps.map[gamelobby.settings.map].TankSpawnPosition;
      console.log(
        "random game",
        type,
        gamelobby.settings.map,
        GameInfor[`${type}MaxPlayer`]
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

    while (this.lobbys[id].connections.length > 0) {
      this.onSwitchLobby(this.lobbys[id].connections[0], this.generalServerID);
    }
    delete this.lobbys[id];
  }
}

module.exports = GameServer;
