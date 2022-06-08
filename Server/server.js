const express = require("express");
const shortid = require("shortid");
const GameServer = require("./gameServer/GameServer");

const app = express();
const server = require("http").createServer(app);

app.get("/", (req, res) => {
  res.send("lala");
});

// game server
const io = require("socket.io")(server);
const gameServer = new GameServer();
// update game server
setInterval(() => {
  gameServer.onUpdate();
}, 100);
io.on("connection", (socket) => {
  console.log(`${socket.id} join room`);
  // socket.emit("open");
  socket.emit("register", { id: shortid.generate() });
});

server.listen(8080);
