const User = require("./User.Schema");
const bcrypt = require("bcrypt");

class UserService {
  constructor() {
    this.SaltRounds = 10;
  }
  async getById(_id) {
    return await User.findOne({ _id });
  }
  async getUser({ username, password }) {
    try {
      const user = await this.getByUsername(username);
      const passCheck = await bcrypt.compare(password, user.password);
      if (passCheck) return user;
    } catch (error) {
      console.log("error", error.message);
      throw new Error(error.message);
    }
  }
  async getByUsername(username) {
    try {
      return await User.findOne({ username });
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async insertUser({ username, password }) {
    try {
      const user1 = await this.getByUsername(username);
      if (user1) {
        return null;
      }
      password = await bcrypt.hash(password, this.SaltRounds);
      const user = await new User({ username, password }).save();
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async aa() {
    return await User.updateMany({}, { numOfStars: 1 });
  }
}

module.exports = new UserService();
