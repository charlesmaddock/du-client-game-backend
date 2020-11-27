const Client = require("./Client");
const Player = require("./Player");
const Bullet = require("./Bullet");
const ServerSend = require("./ServerSend");
const Vector2 = require("./Vector2");
const config = require("./config");
const { load } = require("protobufjs");

module.exports = class Server {
  constructor() {
    this.clients = {};
    this.bullets = {};

    this.hallOfFame = [{ name: "loser bot", kills: 0 }]; // Contains ex: {username: "name", kills: 10}
  }

  updateHallOfFame(username, kills) {
    let oldHallOfFame = [...this.hallOfFame];
    for (let i = 0; i < this.hallOfFame.length; i++) {
      if (kills >= this.hallOfFame[i].kills) {
        this.hallOfFame.splice(i, 0, { name: username, kills });
        break;
      }
    }
    if (this.hallOfFame.length > 5) {
      this.hallOfFame.pop();
    }

    if (this.hallOfFame !== oldHallOfFame) {
      ServerSend.updateHallOfFame(this.clients, this.hallOfFame);
    }
  }

  // Interval update every x milliseconds
  onUpdate() {
    // Update all clients with their players
    for (let clientId in this.clients) {
      this.clients[clientId].update();
    }
    // Update all bullets
    for (let bulletId in this.bullets) {
      this.bullets[bulletId].update();
    }
  }

  // Handles a new client to the server
  onConnected(socket) {
    let client = new Client();
    client.socket = socket;
    client.player = new Player(client.id);
    client.server = this;

    // Let the new client know what their id is
    ServerSend.register(client);

    // Send all the current players so that the frontend can see
    // them even though it doesn't join the game as a player.
    ServerSend.spawnAllPlayersForClient(client);

    // Add the client to clients to keep track of it
    this.clients[client.player.id] = client;

    // Send the hall of fame
    ServerSend.updateHallOfFame(this.clients, this.hallOfFame);

    console.log("CONNECTION: " + client.player.id + " at " + new Date().toLocaleString()); // prettier-ignore
    return client;
  }

  onDisconnected(client = Client) {
    console.log("DISCONNECTION: "+ client.player.displayInfo() + " at " + new Date().toLocaleString()); // prettier-ignore

    let server = this;
    ServerSend.despawnPlayer(client);
    delete server.clients[client.id];
  }

  playerJoinGame(client = Client) {
    let randomSpawnPos = new Vector2(
      Math.random() * config.MAP_WIDTH,
      Math.random() * config.MAP_HEIGHT
    );
    let player = client.player;
    player.position = randomSpawnPos;
    console.log("JOIN GAME: " + player.displayInfo());
    ServerSend.spawnPlayer(client);
  }

  spawnBullet(jsonData, client = Client) {
    if (client.player.canSpawnBullet()) {
      let direction = new Vector2(
        jsonData.directionX,
        jsonData.directionY
      ).normalized();
      let newBullet = new Bullet(this, client.player, direction);
      this.bullets[newBullet.id] = newBullet;
      ServerSend.spawnBullet(client, newBullet);
    }
  }

  despawnBullet(bullet = Bullet) {
    delete this.bullets[bullet.id];
    ServerSend.despawnBullet(bullet, this.clients);
  }
};
