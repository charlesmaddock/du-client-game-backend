const WebSocket = require("ws");
const Server = require("./src/Server");

const PORT = process.env.PORT || 52300;
const TICKS_PER_SECONDS = 38;

const webSocketServer = new WebSocket.Server({ port: PORT });
const server = new Server("hej");

console.log("\x1b[43m%s\x1b[0m", `Server has started on port ${PORT}`);

// Start the update loop of the server, it will update all the players every x milliseconds
setInterval(() => {
  server.onUpdate();
}, 1000 / TICKS_PER_SECONDS);

webSocketServer.on("connection", (webSocket) => {
  // Create the client and begin listening to messages from the socket
  let client = server.onConnected(webSocket);
  client.createEvents(webSocket);

  // Let the client know what their id is
  let registerPayload = JSON.stringify({
    type: "register",
    id: client.player.id,
  });

  console.log(`sending ${registerPayload}`);
  webSocket.send(registerPayload);
});
