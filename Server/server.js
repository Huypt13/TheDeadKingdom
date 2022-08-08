const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

const GameServer = require("./src/gameServer/GameServer");
const UserRouter = require("./src/api/user/User.router");
const Database = require("./src/api/database/Database");
const Tank = require("./src/api/hero/Tank.service");

const Authentication = require("./src/api/middlewares/Authentication.midleware");
const TankRouter = require("./src/api/hero/Tank.router");
const History = require("./src/api/history/History.service");
const SocketAuthen = require("./src/api/middlewares/SocketAuthen.middleware");
const UserService = require("./src/api/user/User.service");
const HistoryService = require("./src/api/history/History.service");
const HistoryRouter = require("./src/api/history/History.router");
const RabbitMq = require("./src/helper/RabbitMq.helper");

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
app.use("/history", Authentication, HistoryRouter);
Database.connect();
server.listen(8080);

const a = (async () => {
  //console.log(await HistoryService.getUserHistory("62979d10f7a5a3b40c332a04"));
  // const saltRounds = 10;
  // let hash = await bcrypt.hash("123", saltRounds);
  // let compare = await bcrypt.compare(
  //   "123",
  //   "$2b$10$Q/gCCCsDdNDzplSHDjH27.Luk3mj.v.0dCUv745wz2bJjUU5IKudW"
  // );
  // console.log(hash, compare);
})();
