const WebSocket = require("ws");
const Server = require("./src/Server");
const ServerHandle = require("./src/ServerHandle");
const ServerSend = require("./src/ServerSend");
const config = require("./src/config");

const PORT = process.env.PORT || 52300;

const webSocketServer = new WebSocket.Server({ port: PORT });
const server = new Server();

console.log("\x1b[43m%s\x1b[0m", `Server has started on port ${PORT}`);

// Start the update loop of the server, it will update all the players every x milliseconds
setInterval(() => {
  server.onUpdate();
}, 1000 / config.TICKS_PER_SECONDS);

webSocketServer.on("connection", (webSocket) => {
  // Create the client
  let client = server.onConnected(webSocket);

  // Listen to incoming messages from the new client
  webSocket.on("message", (data) => {
    ServerHandle.handleMessage(data, client);
  });

  // Run this code if the client disconnects
  webSocket.on("close", () => {
    client.server.onDisconnected(client);
  });
});
