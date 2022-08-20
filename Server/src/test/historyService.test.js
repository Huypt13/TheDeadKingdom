const mongoose = require("mongoose");
const UserService = require("../api/user/User.service");

process.env.NODE_ENV = "test";

const testInsert = require("./testInsert");
const TankUser = require("../api/hero/TankUser.schema");
const History = require("../api/history/History.schema");

const Tank = require("../api/hero/Tank.schema");

const Database = require("../api/database/Database");
const User = require("../api/user/User.schema");
const HistoryService = require("../api/history/History.service");

// npm i -g jest  // global
Database.connect();

describe("Test history Service", () => {
  jest.setTimeout(30000);
  beforeEach(async () => {
    await testInsert.insertTankData();
    await testInsert.insertUserData();
    await testInsert.insertHistory();
    await testInsert.insertTankUserData();
  });
  test("Insert match history", async () => {
    const history = await HistoryService.insertMatchHistory({
      teamWin: 1,
      team1Kill: 5,
      team2Kill: 3,
      gameMode: "Flag",
      members: [
        {
          userId: "6296d13fb263c0630e920031",
          tank: "62ef8e9da0b3eafa898cabd3",
          team: 1,
          isWin: true,
          kill: 0,
          dead: 0,
        },
      ],
      time: Date.now(),
    });
    expect(history.teamWin).toBe(1);
  });

  test("Insert match history fail thieu field", async () => {
    try {
      const history = await HistoryService.insertMatchHistory({
        teamWin: 1,
        team1Kill: 5,
        team2Kill: 3,
        members: [
          {
            userId: "6296d13fb263c0630e920031",
            tank: "62ef8e9da0b3eafa898cabd3",
            team: 1,
            isWin: true,
            kill: 0,
            dead: 0,
          },
        ],
        time: Date.now(),
      });
    } catch (error) {
      console.log("zzzzzzz", error.message);
      expect(error).not.toBe(null);
    }
  });

  test("Insert match history fail wrong team", async () => {
    try {
      const history = await HistoryService.insertMatchHistory({
        teamWin: 3,
        team1Kill: 5,
        team2Kill: 3,
        gameMode: "CountKill",
        members: [
          {
            userId: "6296d13fb263c0630e920031",
            tank: "62ef8e9da0b3eafa898cabd3",
            team: 1,
            isWin: true,
            kill: 0,
            dead: 0,
          },
        ],
        time: Date.now(),
      });
    } catch (error) {
      expect(error.message).toBe("Wrong team");
    }
  });

  test("Insert match history fail wrong team win 1", async () => {
    try {
      const history = await HistoryService.insertMatchHistory({
        teamWin: 2,
        team1Kill: 5,
        team2Kill: 3,
        gameMode: "CountKill",
        members: [
          {
            userId: "6296d13fb263c0630e920031",
            tank: "62ef8e9da0b3eafa898cabd3",
            team: 1,
            isWin: true,
            kill: 0,
            dead: 0,
          },
        ],
        time: Date.now(),
      });
    } catch (error) {
      expect(error.message).toBe("Wrong team win");
    }
  });

  test("Insert match history fail wrong team win 2", async () => {
    try {
      const history = await HistoryService.insertMatchHistory({
        teamWin: 1,
        team1Kill: 1,
        team2Kill: 3,
        gameMode: "CountKill",
        members: [
          {
            userId: "6296d13fb263c0630e920031",
            tank: "62ef8e9da0b3eafa898cabd3",
            team: 1,
            isWin: true,
            kill: 0,
            dead: 0,
          },
        ],
        time: Date.now(),
      });
    } catch (error) {
      expect(error.message).toBe("Wrong team win");
    }
  });
  test("Get user history length <= total", async () => {
    const history = await HistoryService.getUserHistory(
      "6296d13fb263c0630e920031",
      1
    );
    expect(history.length).toBe(1);
  });
  test("Get user history length > total match", async () => {
    const history = await HistoryService.getUserHistory(
      "6296d13fb263c0630e920031",
      5
    );
    expect(history.length).toBe(2);
  });

  test("Get user history > 2 match sort", async () => {
    const history = await HistoryService.getUserHistory(
      "6296d13fb263c0630e920031",
      5
    );
    expect(history[0].time >= history[1].time).toBe(true);
  });

  test("Get user history null", async () => {
    const history = await HistoryService.getUserHistory(
      "62ef8b9359f656820c803040",
      5
    );
    expect(history.length).toBe(0);
  });

  test("Get user history error id", async () => {
    try {
      const history = await HistoryService.getUserHistory("aaaa", 5);
    } catch (error) {
      expect(error).not.toBe(null);
    }
  });
  test("Get user summary success", async () => {
    const summary = await HistoryService.getUserSummary(
      "6296d13fb263c0630e920031"
    );
    expect(summary[0].win).toBe(1);
    expect(summary[0].lose).toBe(1);
  });
  test("Get user summary fail", async () => {
    const summary = await HistoryService.getUserSummary(
      "6296d13fb263c0630e920039"
    );
    expect(summary.length).toBe(0);
  });
  test("Get user summary fail 1", async () => {
    try {
      const summary = await HistoryService.getUserSummary("aaaaa");
    } catch (error) {
      expect(error).not.toBe(null);
    }
  });
  afterEach(async () => {
    await Tank.deleteMany({});
    await User.deleteMany({});
    await History.deleteMany({});
    await TankUser.deleteMany({});
  });
});
