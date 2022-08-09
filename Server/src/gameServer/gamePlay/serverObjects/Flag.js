const ServerObject = require("./ServerObject");
const GameMechanism = require("../GameMechanism");

module.exports = class Flag extends ServerObject {
  constructor() {
    super();
    this.username = "Flag";
    this.point = 0;
    this.maxPoint;
    this.team = 0;
    this.end = false;
  }

  dealPoint(team) {
    if (this.end) {
      this.end = false;
    }
    if (this.point == 0) {
      this.team = team;
      this.point++;
    } else {
      if (this.team == team) {
        if (this.point != this.maxPoint) {
          this.point++;
        }
      } else {
        this.point--;
      }
    }
    if (this.point >= this.maxPoint) {
      this.end = true;
    }
    return this.end;
  }
};
