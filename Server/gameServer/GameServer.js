// server game manage all lobby , all connections
// co the tao nhieu server
class GameServer {
  constructor() {
    this.connections = [];
    this.lobbys = [];
    //this.lobbys[0] = new LobbyBase();
  }
  onUpdate() {
    // update all lobby each 100ms
    this.lobbys.forEach((lobby) => {
      lobby.onUpdate();
    });
  }

  onConnected() {
    // check lobby in game ?
    // if in game reconnect
  }
  onDisconnected() {}
  onSwitchLobby() {}
  onAttempToJoinGame() {}
  onCloseDownLobby() {}
}

module.exports = GameServer;
