const mongoose = require("mongoose");
const UserService = require("../api/user/User.service");

process.env.NODE_ENV = "test";

const testInsert = require("./testInsert");
const TankUser = require("../api/hero/TankUser.schema");
const History = require("../api/history/History.schema");

const Tank = require("../api/hero/Tank.schema");

const Database = require("../api/database/Database");
const User = require("../api/user/User.schema");

// npm i -g jest  // global

describe("Test tank Service", () => {
  beforeAll(() => {
    Database.connect();
  });
  jest.setTimeout(30000);
  beforeEach(async () => {
    await testInsert.insertTankData();
    await testInsert.insertUserData();
  });
  test("test 1", async () => {
    const users = await User.find({});
  });
  afterEach(async () => {
    await Tank.deleteMany({});
    await User.deleteMany({});
  });
  afterAll(() => {
    mongoose.disconnect();
  });
});
