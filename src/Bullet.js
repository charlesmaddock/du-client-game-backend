const shortid = require("shortid");
const Classes = require("./Classes");
const Vector2 = require("./Vector2");
const Player = require("./Player");
const config = require("./config");

module.exports = class Bullet {
  constructor(server, shooter = Player, direction) {
    this.id = shortid.generate();
    this.shooter = shooter;
    this.server = server;

    this.position = new Vector2(shooter.position.x, shooter.position.y);

    this.age = Number(0);
    this.maxAge = Number(3000); // millisekunder

    this.radius = Number(0);
    this.speed = Number(0);
    this.setClassValues(shooter.class);

    this.direction = new Vector2(direction.x, direction.y)
      .normalized()
      .multiply(this.speed);
  }

  setClassValues(classType) {
    if (classType === Classes.MACHINE_GUNNER) {
      this.radius = Number(2);
      this.speed = Number(3);
    } else if (classType === Classes.SHOTGUN) {
      this.radius = Number(3);
      this.speed = Number(2.5);
    } else if (classType === Classes.CANNON) {
      this.radius = Number(4);
      this.speed = Number(2);
    }
  }

  update() {
    this.position = this.position.add(this.direction);

    this.age += config.TICKS_PER_SECONDS;
    if (this.age >= this.maxAge) {
      this.server.despawnBullet(this);
      return;
    }
  }

  getAttackDamage() {
    return this.radius * 1.5;
  }

  displayInfo() {
    return `(${this.id} | ${this.radius} )`;
  }
};
