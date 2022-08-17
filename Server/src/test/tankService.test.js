const testInsert = require("./testInsert");

process.env.NODE_ENV = "test";

const bcrypt = require("bcrypt");
const Tank = require("../api/hero/Tank.schema");

const Database = require("../api/database/Database");
const User = require("../api/user/User.schema");
const UserService = require("../api/user/User.service");
const mongoose = require("mongoose");

// npm i -g jest  // global
Database.connect();

describe("Test Tank Service", () => {
  jest.setTimeout(30000);
  beforeEach(async () => {
    await testInsert.insertTankData();
    await testInsert.insertUserData();
  });
  test("test 1", async () => {
    const users = await User.find({});
    console.log(
      "huhu",
      await User.find({ email: "huy" }),
      await UserService.getByEmail("huy")
    );
  });
  afterEach(async () => {
    await Tank.deleteMany({});
    await User.deleteMany({});
  });
});
