const express = require("express");
const shortid = require("shortid");
const cors = require("cors");

const GameServer = require("./src/gameServer/GameServer");
const GameMechanism = require("./src/gameServer/gamePlay/GameMechanism");
const UserRouter = require("./src/api/user/User.router");
const UserServices = require("./src/api/user/User.service");
const Database = require("./src/api/database/Database");
const Bullet = require("./src/gameServer/gamePlay/serverObjects/Bullet");
const Tank = require("./src/api/hero/Tank.service");

const Authentication = require("./src/api/middlewares/Authentication.midleware");
const TankRouter = require("./src/api/hero/Tank.router");

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

//console.log(GameMechanism.getDame({ armor: 99 }, 1000));

// const a = (async () => {
//   console.log(
//     JSON.stringify(await Tank.getTankByUserId("6296d13fb263c0630e920031"))
//   );
// })();
