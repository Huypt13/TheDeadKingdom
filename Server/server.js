const express = require("express");
const cors = require("cors");

const GameServer = require("./src/gameServer/GameServer");
const UserRouter = require("./src/api/user/User.router");
const Database = require("./src/api/database/Database");
const Tank = require("./src/api/hero/Tank.service");

const Authentication = require("./src/api/middlewares/Authentication.midleware");
const TankRouter = require("./src/api/hero/Tank.router");
const History = require("./src/api/history/History.service");

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
  socket.on("clientJoin", ({ username, id }) => {
    const connection = gameServer.onConnected(socket, { username, id });
    connection.createEvents();
    socket.emit("register", { id: connection.player.id });
  });
});

// rest api
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/user", UserRouter);
app.use("/tank", Authentication, TankRouter);
Database.connect();
server.listen(8080);

const a = (async () => {
  // let b = await Tank.getByTankId(
  //   "62e1136440d7669dcf7492c9",
  //   "62979ec0f7a5a3b40c332a15"
  // );
  // console.log(b);
  // let c = await Tank.getTankByUserId("62979ec0f7a5a3b40c332a15");
  // console.log(c[0].tankList);
  // console.log(
  //   await History.insertMatchHistory({
  //     teamWin: 1,
  //     team1Kill: 15,
  //     team2Kill: 13,
  //     members: [
  //       {
  //         userId: "xx",
  //         team: 1,
  //         isWin: true,
  //         kill: 5,
  //         dead: 1,
  //       },
  //     ],
  //     time: Date.now(),
  //   })
  // );
})();
