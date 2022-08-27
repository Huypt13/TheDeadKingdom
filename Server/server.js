const express = require("express");

const fs = require("fs");

const MarketPlaceRouter = require("./src/api/marketPlaceItem/MarketPlace.router");

const listener = require("./src/blockchainListenServer/listener");

const cors = require("cors");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

const GameServer = require("./src/gameServer/GameServer");
const UserRouter = require("./src/api/user/User.router");

const Database = require("./src/api/database/Database");

const Authentication = require("./src/api/middlewares/Authentication.midleware");
const TankRouter = require("./src/api/hero/Tank.router");
const SocketAuthen = require("./src/api/middlewares/SocketAuthen.middleware");
const HistoryRouter = require("./src/api/history/History.router");
const BoxRouter = require("./src/api/box/Box.router");
const Tank = require("./src/api/hero/Tank.service");

const app = express();
const server = require("http").createServer(app);
dotenv.config();
app.get("/", (req, res) => {
  res.send("lala");
});

// game server
const io = require("socket.io")(server);
const gameServer = new GameServer();
// update game server
const gameSeverLoop = (async () => {
  try {
    setInterval(async () => {
      try {
        await gameServer.onUpdate();
      } catch (error) {
        console.log("game update error ", error);
      }
    }, 100);
    io.on("connection", (socket) => {
      try {
        console.log(`${socket.id} join room`);
        socket.on("clientJoin", async ({ username, id }) => {
          let _id = await SocketAuthen.getUserId(id);
          // neu chua trong game
          if (!gameServer.connections[_id]) {
            const connection = gameServer.onConnected(socket, {
              username,
              id,
              _id,
            });
            connection.createEvents();
            socket.emit("register", { id: connection.player.id });
          } else {
            console.log("vao lai game");
            let connection = gameServer.connections[_id];
            socket.emit("register", { id: connection.player.id });

            connection.socket = socket;
            connection.createEvents();

            // neu dang trong tran
            connection.player.isOnline = true;
            const currentLobbyId = connection.player.lobby;
            socket.join(currentLobbyId);

            // neu dang o general lobby thi leave
            if (currentLobbyId != gameServer.generalServerID) {
              // reload game
              connection.lobby.reloadGame(connection);
            }
          }
        });
      } catch (error) {
        console.log("connection error", error);
      }
    });
  } catch (e) {
    console.log(e);
  }
})();

// listen blockchain events
// listener.init();
// rest api
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(
  "/user",
  (req, res, next) => {
    res.locals.gameServer = gameServer;
    next();
  },
  UserRouter
);
app.use("/tank", TankRouter);
app.use("/box", BoxRouter);
app.use("/history", Authentication, HistoryRouter);
app.use("/marketPlace", MarketPlaceRouter);
Database.connect(app);
server.listen(8080, "0.0.0.0");
// server.listen(8080);
