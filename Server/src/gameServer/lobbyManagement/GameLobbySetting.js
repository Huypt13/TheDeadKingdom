module.exports = class GameLobbySettings {
  constructor(gameMode, maxPlayers, minPlayers, roomLevel) {
    this.gameMode = gameMode || "No Gamemode Defined";
    this.map;
    this.maxPlayers = maxPlayers;
    this.minPlayers = minPlayers;
    this.roomLevel = roomLevel;
  }
};
