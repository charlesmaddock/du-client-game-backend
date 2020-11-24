const ServerHandle = require("./ServerHandle");
const messageTypes = require("./messageTypes");
const { updatePosition } = require("./ServerHandle");

const messageHandlers = {
  [messageTypes.client.updateMovement]: ServerHandle.updatePosition,
};

module.exports = class Client {
  constructor() {
    this.socket;
    this.player;
    this.server;
  }

  // Handles incoming messages through the web socket
  // TODO: Client send and handle
  createEvents(webSocket) {
    webSocket.on("message", (data) => {
      try {
        let jsonData = JSON.parse(data);
        let jsonData = { type: "update position", x: 10, y: 100 };

        messageHandlers[jsonData.type](jsonData);
      } catch (err) {
        console.log("Error receiving message: " + err);
        console.log(
          "Did you forget to add a key value pair to messageHandlers?"
        );
      }
    });

    webSocket.on("close", () => {
      console.log("Client has disconnected.");
    });
  }

  joinGame(data) {
    this.player.username = data.username;
  }

  updateMovement(data) {
    this.player.updateMovement(data.x, data.y);

    if (!this.isInsideArena(this.player, this.currentChunk)) {
      let newCurrentChunkId = this.findPlayersChunkId(this);
      if (newCurrentChunkId) {
        this.region.onSwitchChunk(this, newCurrentChunkId);
      }
    }

    let positionPayload = {
      id: player.id,
      x: data.x,
      y: data.y,
    };
    socket.broadcast.emit("update position", positionPayload);
  }

  updateRotation(data) {
    player.rotationDegrees = data.rotationDegrees;

    let rotationPayload = {
      id: player.id,
      bodyRotX: data.bodyRotX,
      bodyRotY: data.bodyRotY,
    };
    socket.broadcast.emit("update rotation", rotationPayload);
  }
};
