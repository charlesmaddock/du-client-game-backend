const shortid = require("shortid");

module.exports = class Client {
  constructor() {
    this.id = shortid.generate();
    this.socket;
    this.player;
    this.server;
  }

  update() {
    // Only update players that have joined the map
    if (this.player.joined === true) {
      this.player.update(this);
      this.player.checkBulletCollision(this.server.bullets, this);
    }
  }
};
