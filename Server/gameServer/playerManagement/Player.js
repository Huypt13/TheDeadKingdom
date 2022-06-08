class Player {
  constructor({ username, id, tank }) {
    this.username = username;
    this.id = id;
    this.position = new Vector2();
    this.lobby = 0; // luu id  thuc te la index cua room
    this.tankRotation = 0;
    this.berrelRotaion = 0;
    this.tank = tank;
    this.health = tank.health;
    this.isDead = false;
    this.respawnTicker = 0;
    this.respawnTime = 0;
  }
  dealDamage(amount) {
    console.log("dealdame");
    this.health -= amount;
    if (this.health <= 0) {
      this.isDead = true;
      this.respawnTicker = 0;
      this.respawnTime = 0;
    }
    return this.isDead;
  }
  respawnCounter() {
    const tank = this.tank;
    this.respawnTicker += 1;
    if (this.respawnTicker >= 20) {
      this.respawnTicker = 0;
      this.respawnTime += 1;
      if (this.respawnTime >= 3) {
        this.isDead = false;
        this.respawnTicker = 0;
        this.respawnTime = 0;
        this.health = tank.health;
        this.position = new Vector2(-3, this.posInLobby); // can change
        return true;
      }
    }
    return false;
  }
}
