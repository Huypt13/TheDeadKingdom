const shortid = require("shortid");

const AIBase = require("./AIBase");
const Vector2 = require("../../dto/Vector2");

module.exports = class TankAI extends AIBase {
  constructor(Zone, TankAi, Team, OldPosition) {
    super(TankAi.health, OldPosition, Team);
    this.id = shortid.generate();
    this.aiId;
    this.username;
    this.target;
    this.hasTarget;
    this.zone = Zone;
    this.tank = { ...TankAi };
    this.iscommback;
    //Tank Stats
    this.rotation;
    //Shooting
    this.canShoot;
    this.currentTime;
    this.reloadTime = Number(TankAi.attackSpeed);
  }

  onUpdate(onUpdateAI, onFireBullet, onUpdateHealthAi) {
    let ai = this;
    let zoneChange = ai.position.Distance(this.oldPosition);
    if (!ai.hasTarget || zoneChange > this.zone) {
      if (!this.iscommback && zoneChange != 0) {
        this.health = this.tank.health;
        onUpdateHealthAi({ id: this.id, health: this.tank.health });
      }
      this.iscommback = true;
    }
    if (this.iscommback) {
      if (zoneChange <= 0.1) {
        if (zoneChange != 0) {
          this.health = this.tank.health;
          onUpdateHealthAi({ id: this.id, health: this.tank.health });
        }
        this.iscommback = false;
        this.position = new Vector2(this.oldPosition.x, this.oldPosition.y);
      }
      this.onComebackOldPos();
      let direction = new Vector2();
      direction.x = ai.oldPosition.x - ai.position.x;
      direction.y = ai.oldPosition.y - ai.position.y;
      direction = direction.Normalized();
      onUpdateAI({
        id: ai.id,
        position: { ...ai.position },
        tankRotation: { ...ai.rotation },
        barrelRotation:
          Math.atan2(direction.y, direction.x) * ai.radiansToDegrees(),
      });
      return;
    }

    let targetConnection = ai.target;
    let targetPosition = targetConnection.player.position;

    //Get normalized direction between tank and target
    let direction = new Vector2();
    direction.x = targetPosition.x - ai.position.x;
    direction.y = targetPosition.y - ai.position.y;
    direction = direction.Normalized();

    //Calculate Distance
    let distance = ai.position.Distance(targetPosition);
    //Calculate barrel rotation
    let rotation = Math.atan2(direction.y, direction.x) * ai.radiansToDegrees();

    if (isNaN(rotation)) {
      return;
    }

    //Movement
    let angleAmount = ai.getAngleDifference(ai.rotation, rotation); //Direction we need the angle to rotate

    let angleStep = angleAmount * ai.tank.rotationSpeed; //Dont just snap but rotate towards
    ai.rotation = ai.rotation + angleStep; //Apple the angle step
    let forwardDirection = ai.getForwardDirection();

    //Shooting
    if (ai.canShoot && !ai.isDead) {
      onFireBullet({
        activator: ai.id,
        position: { ...ai.position },
        direction: { ...direction },
      });
      ai.canShoot = false;
      ai.currentTime = Number(0);
    } else {
      ai.currentTime = Number(ai.currentTime) + Number(0.1);
      if (ai.currentTime >= ai.reloadTime) {
        ai.canShoot = true;
      }
    }

    //Apply position from forward direction
    if (Math.abs(angleAmount) < 10) {
      if (distance > this.tank.shootingRange - 2) {
        ai.position.x = ai.position.x + forwardDirection.x * ai.tank.speed;
        ai.position.y = ai.position.y + forwardDirection.y * ai.tank.speed;
      }
    }

    //console.log(ai.id + ': bar(' + rotation + ') tank(' + ai.rotation + ')');

    onUpdateAI({
      id: ai.id,
      position: { ...ai.position },
      tankRotation: { ...ai.rotation },
      barrelRotation: rotation,
    });
  }

  onComebackOldPos() {
    let direction = new Vector2();
    direction.x = this.oldPosition.x - this.position.x;
    direction.y = this.oldPosition.y - this.position.y;
    direction = direction.Normalized();
    let rotation =
      Math.atan2(direction.y, direction.x) * this.radiansToDegrees();

    if (isNaN(rotation)) {
      return;
    }
    let angleAmount = this.getAngleDifference(this.rotation, rotation); //Direction we need the angle to rotate
    let angleStep = angleAmount * this.tank.rotationSpeed; //Dont just snap but rotate towards
    this.rotation = this.rotation + angleStep; //Apple the angle step
    let forwardDirection = this.getForwardDirection();
    if (Math.abs(angleAmount) < 10) {
      this.position.x = this.position.x + forwardDirection.x * this.tank.speed;
      this.position.y = this.position.y + forwardDirection.y * this.tank.speed;
    }
  }

  onObtainTarget(connections) {
    const ai = this;

    let minConnection = { position: new Vector2(1e5, 1e5) };
    let target = null;
    for (const connection of connections) {
      const player = connection.player;
      if (
        ai.position.Distance(player.position) <
          minConnection.position.Distance(ai.position) &&
        !player.isDead &&
        player.team != this.team
      ) {
        target = connection;
        minConnection.position = player.position;
      }
    }
    if (
      minConnection.position.Distance(ai.position) >
      this.tank.shootingRange + 1
    ) {
      ai.hasTarget = false;
      ai.target = null;
      return;
    }
    ai.hasTarget = true;
    ai.target = target;
  }

  getForwardDirection() {
    let ai = this;

    let radiansRotation = (ai.rotation + 90) * ai.degreesToRadians(); //We need the 90 degree art offset to get the correct vector
    let sin = Math.sin(radiansRotation);
    let cos = Math.cos(radiansRotation);

    let worldUpVector = ai.worldUpVector();
    let tx = worldUpVector.x;
    let ty = worldUpVector.y;

    return new Vector2(cos * tx - sin * ty, sin * tx + cos * ty);
  }
};
