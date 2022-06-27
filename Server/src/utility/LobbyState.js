module.exports = class LobbyState {
  constructor() {
    //Predefined States
    this.GAME = "Game";
    this.LOBBY = "Lobby";
    this.ENDGAME = "EndGame";
    this.WAITING = "Waiting";
    //Current state of the lobby
    this.currentState = this.LOBBY;
  }
};
