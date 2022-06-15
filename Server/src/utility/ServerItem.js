const shortID = require("shortid");
const Vector2 = require("../dto/Vector2");

module.exports = class ServerItem {
  constructor() {
    this.username = "ServerItem";
    this.id = shortID.generate();
    this.position = new Vector2();
  }
};
