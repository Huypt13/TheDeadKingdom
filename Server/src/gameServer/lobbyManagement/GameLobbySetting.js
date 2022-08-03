module.exports = class GameLobbySettings {
  constructor(gameMode, maxPlayers, minPlayers, levelData, roomLevel) {
    this.gameMode = gameMode || "No Gamemode Defined";
    this.map;
    this.maxPlayers = maxPlayers;
    this.minPlayers = minPlayers;
    this.levelData = levelData;
    this.roomLevel = roomLevel;
  }
};
