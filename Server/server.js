const express = require("express");

const test = require("./src/utility/test");


const listener = require("./src/blockchainListenServer/listener");


const cors = require("cors");
const bcrypt = require("bcrypt");

const GameServer = require("./src/gameServer/GameServer");
const UserRouter = require("./src/api/user/User.router");

const Database = require("./src/api/database/Database");
const Tank = require("./src/api/hero/Tank.service");

const Authentication = require("./src/api/middlewares/Authentication.midleware");
const TankRouter = require("./src/api/hero/Tank.router");
const BoxRouter = require("./src/api/Box/Box.router");
const History = require("./src/api/history/History.service");
const SocketAuthen = require("./src/api/middlewares/SocketAuthen.middleware");
const UserService = require("./src/api/user/User.service");
const HistoryService = require("./src/api/history/History.service");
const HistoryRouter = require("./src/api/history/History.router");

const app = express();
const server = require("http").createServer(app);

app.get("/", (req, res) => {
  res.send("lala");
});

// game server
const io = require("socket.io")(server);
const gameServer = new GameServer();
// update game server
setInterval(async () => {
  await gameServer.onUpdate();
}, 100);

io.on("connection", (socket) => {
  console.log(`${socket.id} join room`);
  socket.on("clientJoin", async ({ username, id }) => {
    let _id = await SocketAuthen.getUserId(id);
    // neu chua trong game
    if (!gameServer.connections[id]) {
      const connection = gameServer.onConnected(socket, { username, id, _id });
      connection.createEvents();
      socket.emit("register", { id: connection.player.id });
    } else {
      let connection = gameServer.connections[id];
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
});

// listen blockchain events 
// listener.init()
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
app.use("/tank", Authentication, TankRouter);
app.use("/box", Authentication, BoxRouter);
app.use("/history", Authentication, HistoryRouter);
Database.connect();
server.listen(8080);
test.runTest();
//console.log(GameMechanism.getDame({ armor: 99 }, 1000));

// const a = (async () => {
//  console.log("tank cong",await Tank.insertAll("62ef8b9359f656820c803049"));

// })();
