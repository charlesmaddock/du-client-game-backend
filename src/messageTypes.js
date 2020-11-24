// Messages sent from the server
const fromServer = {
  position: "pos",
  fire: "fire",
  joinGame: "join",
};

// Messages sent from the client
const fromClient = {
  updateMovement: "move",
};

module.exports = { fromServer, fromClient };
