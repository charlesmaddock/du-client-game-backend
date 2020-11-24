let Client = require("./Client");
let Player = require("./Player");

module.exports = class Server {
  constructor() {
    this.clients = {};
    this.bullets = {};
  }

  // Interval update every x milliseconds
  onUpdate() {
    // Update all players
    for (let clientId in this.clients) {
      this.clients[clientId].player.update();
    }
  }

  // Handles a new client to the server
  onConnected(socket) {
    let client = new Client();
    client.socket = socket;
    client.player = new Player();
    client.server = this;
    console.log(
      "New connection to server: " +
        client.player.id +
        " at " +
        new Date().toLocaleString()
    );
    this.clients[client.player.id] = client;
    return client;
  }

  onDisconnected(client = Client) {
    let server = this;
    let player = client.player;
    let id = player.id;

    if (client.currentChunk) {
      // Removes the player's client and chunk from player and hides it
      client.currentChunk.onLeaveChunk(client);
      client.currentChunk.removePlayer(client);
    }
    // Finally, remove the client
    delete server.clients[id];
    console.log(
      "SERVER: " +
        client.player.displayInfo() +
        " disconnected at " +
        new Date().toLocaleString()
    );
  }

  // When a player first joins the Real world, and when it respawns
  onAttemptToJoinWorld(client = Client) {
    // Later, when there are more regions, check which one is the closest
    // Function sends finds and sends loaded chunks to the client
    let player = client.player;
    player.spawnPlayer(client);
  }
};
