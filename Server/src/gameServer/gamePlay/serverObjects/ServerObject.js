const shortID = require("shortid");
const Vector2 = require("../../../dto/Vector2");

module.exports = class ServerObject {
  constructor() {
    this.id = shortID.generate();
    this.username = "ServerObject";
    this.position = new Vector2();
  }
};
