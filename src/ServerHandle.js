let Client = require("./Client");
let ServerSend = require("./ServerSend");
const messageTypes = require("./messageTypes");

////////////////////////////////////////////////////////////////////////////////
//                         HANDLE MESSAGE FROM SOCKET                         //
////////////////////////////////////////////////////////////////////////////////
const messageHandlers = {
  [messageTypes.fromClient.join]: join,
  [messageTypes.fromClient.updateDirection]: updateDirection,
  [messageTypes.fromClient.fireBullet]: fireBullet,
};

function handleMessage(data, client) {
  try {
    // console.log(`Received:`);
    // console.log(jsonData);
    let jsonData = JSON.parse(data);
    messageHandlers[jsonData.type](jsonData, client);
  } catch (err) {
    printError(err, data);
  }
}

function printError(err, data) {
  let typeName = "undefined";
  for (const key in messageTypes.fromClient) {
    if (messageTypes.fromClient[key] === JSON.parse(data).type) {
      typeName = key;
    }
  }
  if (typeName === "undefined") {
    console.log(
      "A message with an undefined type has been sent. Did you forget to add a key value pair to messageHandlers?"
    );
  } else {
    console.log(`Error receiving message of type '${typeName}': ` + err);
  }
}

////////////////////////////////////////////////////////////////////////////////
//                        MESSAGE HANDLER FUNCTIONS                           //
////////////////////////////////////////////////////////////////////////////////
function join(jsonData, client = Client) {
  // Check if the room is full
  if (Object.values(client.server.clients).length < 18) {
    let isValidPlayer = client.player.create(jsonData.username, jsonData.class);
    if (isValidPlayer) {
      client.server.playerJoinGame(client);
    } else {
      ServerSend.sendError(
        client,
        "The player you tried to create is either invalid or has already joined."
      );
    }
  } else {
    ServerSend.sendError(
      client,
      "Sorry, there are too many clients connected, you can't join."
    );
  }
}

function updateDirection(jsonData, client = Client) {
  client.player.updateDirection(jsonData.x, jsonData.y);
}

function fireBullet(jsonData, client = Client) {
  client.server.spawnBullet(jsonData, client);
}

module.exports = { handleMessage };
