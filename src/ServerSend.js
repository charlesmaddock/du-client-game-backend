const Client = require("./Client");
const Bullet = require("./Bullet");
const messageTypes = require("./messageTypes");

module.exports = class ServerSend {
  // Send the payload to all the clients.
  static broadcast(allClients, payload) {
    for (let clientId in allClients) {
      allClients[clientId].socket.send(payload);
    }
  }

  static register(newClient) {
    let registerPayload = JSON.stringify({
      type: messageTypes.fromServer.register,
      id: newClient.player.id,
    });
    newClient.socket.send(registerPayload);
  }

  static spawnAllPlayersForClient(joiningClient = Client) {
    let allClients = joiningClient.server.clients;
    for (const clientId in allClients) {
      const player = allClients[clientId].player;
      if (player.joined) {
        let payload = player.inJSON(messageTypes.fromServer.spawnPlayer);
        joiningClient.socket.send(payload);
      }
    }
  }

  static spawnPlayer(client = Client) {
    let payload = client.player.inJSON(messageTypes.fromServer.spawnPlayer);
    this.broadcast(client.server.clients, payload);
  }

  static despawnPlayer(client = Client) {
    let payload = JSON.stringify({
      type: messageTypes.fromServer.despawnPlayer,
      id: client.id,
    });
    this.broadcast(client.server.clients, payload);
  }

  static spawnBullet(client = Client, bullet = Bullet) {
    let bulletPayload = JSON.stringify({
      type: messageTypes.fromServer.spawnBullet,
      id: bullet.id,
      posX: bullet.position.x,
      posY: bullet.position.y,
      dirX: bullet.direction.x,
      dirY: bullet.direction.y,
      speed: bullet.speed,
      radius: bullet.radius,
    });

    this.broadcast(client.server.clients, bulletPayload);
  }

  static despawnBullet(bullet = Bullet, allClients) {
    let payload = JSON.stringify({
      type: messageTypes.fromServer.despawnBullet,
      id: bullet.id,
    });

    this.broadcast(allClients, payload);
  }

  static sendError(client = Client, msg) {
    client.socket.send(
      JSON.stringify({ type: messageTypes.fromServer.error, message: msg })
    );
  }

  static updatePosition(client = Client) {
    let payload = JSON.stringify({
      type: messageTypes.fromServer.updatePosition,
      id: client.id,
      x: client.player.position.x,
      y: client.player.position.y,
    });

    this.broadcast(client.server.clients, payload);
  }

  static updateDirection(client = Client) {
    let payload = JSON.stringify({
      type: messageTypes.fromServer.updateDirection,
      id: client.id,
      x: client.player.direction.x,
      y: client.player.direction.y,
    });

    this.broadcast(client.server.clients, payload);
  }

  static updateHealth(client = Client) {
    let payload = JSON.stringify({
      type: messageTypes.fromServer.updateHealth,
      id: client.id,
      health: client.player.health,
    });

    this.broadcast(client.server.clients, payload);
  }

  static updateHallOfFame(allClients, hallOfFame) {
    for (const clientId in allClients) {
      // Only send to frontend, which never joins the game
      if (allClients[clientId].player.joined === false) {
        let payload = JSON.stringify({
          type: messageTypes.fromServer.updateHallOfFame,
          hallOfFame,
        });
        allClients[clientId].socket.send(payload);
      }
    }
  }
};
