const { Server } = require("ws");
const Classes = require("./Classes");
const config = require("./config");
const ServerSend = require("./ServerSend");
const Vector2 = require("./Vector2");

module.exports = class Player {
  constructor(clientId) {
    this.username = "";
    this.joined = false;
    this.id = clientId;
    this.class = "";

    this.position = new Vector2();
    this.direction = new Vector2();

    this.speed = Number(1);
    this.kills = Number(0);
    this.radius = Number(5);

    this.health = Number(100);
    this.healthCounterMS = Number(0);
    this.MSUntilNewHealth = Number(3000);

    this.bulletCooldownCounterMS = Number(0);
    this.bulletCooldownMS = null;
  }

  create(username, classType) {
    // Check if player is trying to send join again, return false if they do
    if (this.joined === false) {
      this.username = username.substring(0, 32);
      // Validate the chosen class
      if (classType >= 0 && classType < Classes.all.length) {
        this.class = Classes.all[classType];
        // Cooldown time depends on class
        this.bulletCooldownMS = Number(
          this.class === Classes.MACHINE_GUNNER
            ? 500
            : this.class === Classes.SHOTGUN
            ? 1000
            : 3000
        );
        this.joined = true;
        return true;
      }
    }

    return false;
  }

  update(client) {
    this.position = this.position.add(this.direction);
    this.clampPosToMapSize();
    ServerSend.updatePosition(client);
    ServerSend.updateDirection(client);

    this.bulletCooldownCounterMS += 1000 / config.TICKS_PER_SECONDS;

    // If x amount of milliseconds has passed, add HP to they player so they slowly regen
    this.healthCounterMS += 1000 / config.TICKS_PER_SECONDS;
    if (this.healthCounterMS > this.MSUntilNewHealth && this.health < 100) {
      this.health += this.health + 8 > 100 ? 100 - this.health : 8;
      this.healthCounterMS = 0;
      ServerSend.updateHealth(client);
    }
  }

  checkBulletCollision(allBullets, client) {
    // Reversed array since we remove elements during iteration
    let bulletValues = Object.values(allBullets);
    for (let i = bulletValues.length - 1; i >= 0; i--) {
      let bullet = bulletValues[i];
      // Check if the bullet is colliding with a player and
      // dont hit if the bullet is from the same shooter.
      if (
        bullet.position.distance(this.position) < this.radius + bullet.radius &&
        bullet.shooter.id !== this.id
      ) {
        // Decrease health
        this.health -= bullet.getAttackDamage();
        ServerSend.updateHealth(client);

        // Player is dead
        if (this.health <= 0) {
          bullet.shooter.addKill(client);
          this.onPlayerDeath(client);
        }

        // Remove the bullet that hit
        client.server.despawnBullet(this);
        ServerSend.despawnBullet(bullet, client.server.clients);
      }
    }
  }

  addKill(client) {
    this.kills += 1;
    // client.server.updateLeaderBoard(this.username, this.kills);
  }

  updateDirection(x, y) {
    let dir = new Vector2(x, y).normalized().multiply(this.speed);
    if (!isNaN(dir.x) && !isNaN(dir.y)) {
      this.direction = dir;
    }
  }

  clampPosToMapSize() {
    // Clamp the players position to within the map
    if (this.position.x < 0) {
      this.position.x = 0;
    }
    if (this.position.x > config.MAP_WIDTH) {
      this.position.x = config.MAP_WIDTH;
    }
    if (this.position.y < 0) {
      this.position.y = 0;
    }
    if (this.position.y > config.MAP_HEIGHT) {
      this.position.y = config.MAP_HEIGHT;
    }
  }

  canSpawnBullet() {
    if (this.bulletCooldownMS !== null) {
      if (this.bulletCooldownCounterMS > this.bulletCooldownMS) {
        this.bulletCooldownCounterMS = 0;
        return true;
      }
    }
    return false;
  }

  // Essentially a respawn
  onPlayerDeath(client) {
    client.server.updateHallOfFame(this.username, this.kills);

    this.position = new Vector2(
      Math.random() * config.MAP_WIDTH,
      Math.random() * config.MAP_HEIGHT
    );
    this.kills = Number(0);

    this.health = Number(100);
    ServerSend.updateHealth(client);

    this.bulletCooldownCounterMS = Number(0);
    this.healthCounterMS = Number(0);
  }

  inJSON(messageType) {
    return JSON.stringify({
      type: messageType,
      id: this.id,
      username: this.username,
      posX: this.position.x,
      posY: this.position.y,
      dirX: this.direction.x,
      dirY: this.direction.y,
      class: this.class,
      health: this.health,
      kills: this.kills,
    });
  }

  displayInfo() {
    return `(${this.username} | ${this.health} | (${this.position.x},${this.position.y}))`;
  }
};
