module.exports = class GameLobbySettings {
  constructor(gameMode, maxPlayers, minPlayers, levelData) {
    this.gameMode = gameMode || "No Gamemode Defined";
    this.maxPlayers = maxPlayers;
    this.minPlayers = minPlayers;
    this.levelData = levelData;
  }
};
