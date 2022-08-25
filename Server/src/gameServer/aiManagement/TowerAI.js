const shortid = require("shortid");

const AIBase = require("./AIBase");
const Vector2 = require("../../dto/Vector2");

module.exports = class TowerAI extends AIBase {
  constructor(Tower, Team) {
    super(Tower.health, null, Team);
    this.id = shortid.generate();
    this.aiId;
    this.username = "AI_TOWER";

    this.target;
    this.hasTarget = false;
    this.tank = { ...Tower };
    //Tank Stats
    this.rotation = 0;

    //Shooting
    this.canShoot = false;
    this.currentTime = 0;
    this.reloadTime = Number(Tower.attackSpeed);
  }

  onUpdate(onUpdateTower, onFireBullet) {
    let targetConnection = this.target;
    let direction = new Vector2(1, 0);
    let targetPosition = targetConnection?.player?.position;
    if (targetPosition) {
      direction.x = targetPosition.x - this.position.x;
      direction.y = targetPosition.y - this.position.y;
      direction = direction.Normalized();
    } else {
      onUpdateTower({
        id: this.id,
        username: this.username,
        barrelRotation: this.rotation,
      });
      return;
    }
    //Calculate barrel rotation
    let rotation =
      Math.atan2(direction.y, direction.x) * this.radiansToDegrees();

    if (isNaN(rotation)) {
      onUpdateTower({
        id: this.id,
        username: this.username,
        barrelRotation: this.rotation,
      });
      return;
    }

    //Shooting

    if (this.canShoot && !this.isDead && this.hasTarget) {
      onFireBullet({
        activator: this.id,
        position: { ...this.position },
        direction: { ...direction },
      });
      this.canShoot = false;
      this.currentTime = 0;
    } else {
      this.currentTime = +this.currentTime + +0.1;
      if (this.currentTime >= this.reloadTime) {
        this.canShoot = true;
      }
    }

    onUpdateTower({
      id: this.id,
      username: this.username,
      barrelRotation: rotation,
    });
  }

  onObtainTarget(connections) {
    let minConnection = { position: new Vector2(1e5, 1e5) };
    let target = null;
    for (const connection of connections) {
      const player = connection.player;
      if (
        this.position.Distance(player.position) <
          minConnection.position.Distance(this.position) &&
        !player.isDead &&
        player.team != this.team
      ) {
        target = connection;
        minConnection.position = player.position;
      }
    }
    if (
      minConnection.position.Distance(this.position) > this.tank.shootingRange
    ) {
      this.target = null;
      this.hasTarget = false;
      return;
    }
    this.hasTarget = true;
    this.target = target;
  }
};
