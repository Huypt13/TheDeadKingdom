const Jwt = require("../helper/Jwt.helper");

process.env.NODE_ENV = "test";

const bcrypt = require("bcrypt");
const testInsert = require("./testInsert");
const Tank = require("../api/hero/Tank.schema");

const UserService = require("../api/user/User.service");
const Database = require("../api/database/Database");
const User = require("../api/user/User.schema");
const mongoose = require("mongoose");

// npm i -g jest  // global

describe("Test User Service", () => {
  jest.setTimeout(30000);
  beforeAll(() => {
    Database.connect();
  });
  beforeEach(async () => {
    await testInsert.insertUserData();
  });
  test("Test get user by id success", async () => {
    const user = await UserService.getById("62fb177b81bd0dd14ece61d0");
    expect(user.email).toBe("huy");
  });
  test("Test get user by id fail", async () => {
    const user = await UserService.getById("62fb177b81bd0dd14ece61d1");
    expect(user).toBe(null);
  });
  test("Test get user by id Error", async () => {
    try {
      const user = await UserService.getById("aaaaa");
    } catch (e) {
      expect(e).not.toBe(null);
    }
  });
  test("Test get user by addreess success", async () => {
    const user = await UserService.getByWalletAddress(
      "0x0c3DFD77D632BebC1E27927FD39a6579CDa54f03"
    );
    expect(user.email).toBe("huy");
  });
  test("Test get user by vallet addreess fail", async () => {
    const user = await UserService.getByWalletAddress(
      "0x0c3DFD77D632BebC1E27927FD39a6579CDa54f0"
    );
    expect(user).toBe(null);
  });
  test("Test get user by vallet addreess fail null", async () => {
    const user = await UserService.getByWalletAddress(null);
    expect(user).toBe(null);
  });

  test("Test connect wallet success", async () => {
    const user = await UserService.connectWallet(
      "0x0c3DFD77D632BebC1E27927FD39a6579CDa54f031",
      "6296d13fb263c0630e920031"
    );
    expect(user._id.toString()).toBe("6296d13fb263c0630e920031");
    expect(user.walletAddress).toBe(
      "0x0c3DFD77D632BebC1E27927FD39a6579CDa54f031"
    );
  });
  test("Test connect wallet fail user has been connected", async () => {
    const user = await UserService.connectWallet(
      "0x0c3DFD77D632BebC1E27927FD39a6579CDa54f035",
      "62fb177b81bd0dd14ece61d0"
    );
    expect(user).not.toBe(null);
  });
  test("Test connect wallet fail wrong userid", async () => {
    const user = await UserService.connectWallet(
      "0x0c3DFD77D632BebC1E27927FD39a6579CDa54f035",
      "6296d13fb263c0630e920032"
    );
    expect(user).toBe(null);
  });
  test("Test connect wallet fail wallest adress null", async () => {
    const user = await UserService.connectWallet(
      null,
      "6296d13fb263c0630e920032"
    );
    expect(user).toBe(null);
  });
  test("Test connect wallet fail address has already been used", async () => {
    const user = await UserService.connectWallet(
      "0x54a2998Bd96eEEEBc218aB5AAC4fBE357A2e9714",
      "6296d13fb263c0630e920031"
    );
    expect(user).not.toBe(null);
  });
  test("Test connect wallet fail error not convert _id", async () => {
    try {
      const user = await UserService.connectWallet(
        "0x0c3DFD77D632BebC1E27927FD39a6579CDa54f035",
        "aaaa"
      );
    } catch (e) {
      // Cast to ObjectId failed for value
      expect(e).not.toBe(null);
    }
  });
  test("Test get user by email password success", async () => {
    const user = await UserService.getUser({ email: "huy", password: "123" });
    expect(user.email).toBe("huy");
    expect(user.username).toBe("huydtr");
  });
  test("Test get user by email password success 2", async () => {
    const user = await UserService.getUser({ email: "huypt", password: "123" });
    expect(user.email).toBe("huypt");
    expect(user.username).toBe("huy");
  });
  test("Test get user by email password fail", async () => {
    try {
      const user = await UserService.getUser({
        email: "huy1",
        password: "123",
      });
    } catch (e) {
      // Wrong email or password
      expect(e).not.toBe(null);
    }
  });

  test("Test get user by email success", async () => {
    const user = await UserService.getByEmail("huy");
    expect(user.email).toBe("huy");
    expect(user.username).toBe("huydtr");
  });
  test("Test get user by email success 2", async () => {
    const user = await UserService.getByEmail("huypt");
    expect(user.email).toBe("huypt");
    expect(user.username).toBe("huy");
  });
  test("Test get user by email fail", async () => {
    const user = await UserService.getByEmail("huy123");
    expect(user).toBe(null);
  });
  test("Test insert user success", async () => {
    await UserService.insertUser({
      email: "huy123",
      password: "123",
      username: "acongfminh",
    });

    const user = await UserService.getByEmail("huy123");
    expect(user.email).toBe("huy123");
    expect(user.username).toBe("acongfminh");
  });

  test("Test insert user fail email exist", async () => {
    const userAdd = await UserService.insertUser({
      email: "huy",
      password: "123",
      username: "acongfminh",
    });

    expect(userAdd).toBe(null);
  });

  test("Test increase star success", async () => {
    const user = await UserService.updateStar(1, "62fb177b81bd0dd14ece61d0");
    expect(user.numOfStars).toBe(2);
  });
  test("Test decrease star < 20 success", async () => {
    const user = await UserService.updateStar(-1, "62fb177b81bd0dd14ece61d0");
    expect(user).toBe(null);
  });
  test("Test type != +-1", async () => {
    const user = await UserService.updateStar(-3, "62fb177b81bd0dd14ece61d0");
    expect(user).toBe(null);
  });
  test("Test type = null", async () => {
    const user = await UserService.updateStar(null, "62fb177b81bd0dd14ece61d0");
    expect(user).toBe(null);
  });

  test("Test decrease star > 20 success", async () => {
    const user = await UserService.updateStar(-1, "6296d13fb263c0630e920031");
    expect(user.numOfStars).toBe(99);
  });
  test("Test update star wrong _id error", async () => {
    try {
      const user = await UserService.updateStar(
        -1,
        "62fb177b81bd0dd14ece61d09"
      );
    } catch (error) {
      expect(error).not.toBe(null);
    }
  });
  test("Test update star wrong _id ", async () => {
    const user = await UserService.updateStar(-1, "62fb177b81bd0dd14ece61d9");
    expect(user).toBe(null);
  });
  test("Test get user infor by id", async () => {
    const user = await UserService.getUserInfor("62fb177b81bd0dd14ece61d0");
    expect(user.email).toBe("huy");
    expect(user.username).toBe("huydtr");
    expect(user.numOfStars).toBe(1);

    expect(user.ranking.rank).toBe("Bronze 4");
    expect(user.ranking.star).toBe(1);
  });
  test("Test get user infor by id 100 star", async () => {
    const user = await UserService.getUserInfor("6296d13fb263c0630e920031");
    expect(user.email).toBe("huypt");
    expect(user.username).toBe("huy");
    expect(user.numOfStars).toBe(100);

    expect(user.ranking.rank).toBe("Diamond 1");
    expect(user.ranking.star).toBe(5);
  });
  test("Test get user infor by id fail", async () => {
    const user = await UserService.getUserInfor("62fb177b81bd0dd14ece61d9");
    expect(user).toBe(undefined);
  });
  test("Test get user infor by id fail 2", async () => {
    try {
      const user = await UserService.getUserInfor("62fb177b81bd0dd14e");
    } catch (error) {
      expect(error).not.toBe(null);
    }
  });

  test("Test get get top rank", async () => {
    const topRank = await UserService.getTopRank(2);
    expect(topRank.listTop.length).toBe(2);
  });
  test("Test get get top rank > user length", async () => {
    const topRank = await UserService.getTopRank(5);
    expect(topRank.listTop.length).toBe(3);
  });
  test("Test get get top rank fail", async () => {
    try {
      const topRank = await UserService.getTopRank("a");
    } catch (error) {
      expect(error).not.toBe(null);
    }
  });
  test("Test verify user", async () => {
    const user = await UserService.verifyUser("hahaha");
    expect(user.active).toBe(true);
  });
  test("Test verify user fail", async () => {
    const user = await UserService.verifyUser("hahahaha");
    expect(user).toBe(null);
  });
  test("Test verify user fail activecode null", async () => {
    const user = await UserService.verifyUser(null);
    expect(user).toBe(null);
  });
  test("Test change password success", async () => {
    const user = await UserService.changePassword(
      { password: "123", newPassword: "321" },
      "huy"
    );
    const cp = await bcrypt.compare("321", user.password);
    expect(cp).toBe(true);
  });
  test("Test change password fail wrong email", async () => {
    try {
      const user = await UserService.changePassword(
        { password: "123", newPassword: "321" },
        "huy123"
      );
    } catch (error) {
      expect(error.message).toBe("Invalid email");
    }
  });
  test("Test change password fail wrong password", async () => {
    try {
      const user = await UserService.changePassword(
        { password: "321", newPassword: "1234" },
        "huy"
      );
    } catch (error) {
      expect(error.message).toBe("Invalid password");
    }
  });
  test("Test change password fail same pass", async () => {
    try {
      const user = await UserService.changePassword(
        { password: "123", newPassword: "123" },
        "huy"
      );
    } catch (error) {
      expect(error.message).toBe("New password must be different old password");
    }
  });

  test("Test forgot password success", async () => {
    await UserService.forgotPassword("huy");
    const user = await UserService.getByEmail("huy");
    expect(user.resetCode).not.toBe(null);
  });
  test("Test forgot password wrong email", async () => {
    try {
      const user = await UserService.forgotPassword("huyaaa");
      expect(user).toBe(null);
    } catch (error) {
      expect(error.message).toBe("New password must be different old password");
    }
  });
  test("Test change password token success", async () => {
    await UserService.changePasswordToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaHV5ZHRyIiwiaWF0IjoxNjYwODM3MTY0LCJleHAiOjE2NjM0MjkxNjR9.gb4ZvdES2PTdh72KOAgBDSMZj9Evy1yifl96oy1CJ38",
      "321" 
    );
    const user = await UserService.getUser({ email: "huy", password: "321" });
    expect(user).not.toBe(null);
    expect(user.resetCode).toBe(null);
  });
  test("Test change password jwt expired", async () => {
    try {
      await UserService.changePasswordToken(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiaHV5ZHRyIiwiaWF0IjoxNjYwODM3MjQzLCJleHAiOjE2NjA4MzcyNDR9.pLIvPffNN9I16qVlOVtPl50Yf27om_DfKJ-NF4Ji-_g",
        { newPassword: "321" }
      );
    } catch (error) {
      expect(error.message).toBe("jwt expired");
      const user = await UserService.getUser({
        email: "huypt",
        password: "123",
      });
      expect(user).not.toBe(null);
      expect(user.resetCode).toBe(null);
    }
  });

  test("Test change password jwt wrong", async () => {
    try {
      await UserService.changePasswordToken("aaaa", { newPassword: "321" });
    } catch (error) {
      expect(error.message).toBe("jwt malformed");
    }
  });
  test("Test change password jwt invalid signal", async () => {
    try {
      await UserService.changePasswordToken(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.5z8n2p8YaCj4gJ3Na55WzJ4iBepanc-O1IMrcRnpVC0",
        { newPassword: "321" }
      );
    } catch (error) {
      expect(error.message).toBe("invalid signature");
    }
  });
  test("Test change password fail not found active code", async () => {
    try {
      await UserService.changePasswordToken(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.Nu-yHQHn020hXXfTNvx4F4dbTt2CHAOihSXCepbtetg",
        { newPassword: "321" }
      );
    } catch (error) {
      expect(error.message).toBe("Change password failed");
    }
  });
  afterEach(async () => {
    await User.deleteMany({});
  });
  afterAll(() => {
    mongoose.disconnect();
  });
});