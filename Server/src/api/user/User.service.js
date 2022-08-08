const User = require("./User.schema");
const bcrypt = require("bcrypt");
const Ranking = require("../../helper/Ranking.helper");
const Jwt = require("../../helper/Jwt.helper");

class UserService {
  constructor() {
    this.SaltRounds = 10;
  }
  async getById(_id) {
    return await User.findOne({ _id }).lean();
  }
  async getUser({ email, password }) {
    try {
      const user = await this.getByEmail(email);
      const passCheck = await bcrypt.compare(password, user?.password);
      if (passCheck) return user;
    } catch (error) {
      console.log("error", error.message);
      throw new Error(error.message);
    }
  }
  async getByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async insertUser({ email, username, password }) {
    try {
      const user1 = await this.getByEmail(email);
      if (user1) {
        return null;
      }
      password = await bcrypt.hash(password, this.SaltRounds);
      const activeCode = await Jwt.signData({ email });

      const user = await new User({
        email,
        username,
        password,
        numOfStars: 0,
        walletAdress: null,
        balances: 0,
        activeCode,
        active: false,
      }).save();
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateStar(type, _id) {
    const user = await this.getById(_id);
    if (user && user?.numOfStars <= 20 && type == -1) return;
    return await User.findByIdAndUpdate(_id, { $inc: { numOfStars: type } });
  }
  async getUserInfor(_id) {
    try {
      const user = await this.getById(_id);
      if (user) {
        const { numOfStars, password, __v, ...userInfor } = user;
        return {
          ...userInfor,
          numOfStars,
          ranking: {
            rank: Ranking.getRank(numOfStars),
            star: Ranking.getStar(numOfStars),
          },
        };
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getTopRank(num) {
    const listTop = await User.find({})
      .sort({ numOfStars: -1 })
      .limit(num)
      .lean();
    return {
      top: num,
      listTop: listTop.map(({ password, __v, ...e }) => {
        return {
          ...e,
          ranking: {
            rank: Ranking.getRank(e.numOfStars),
            star: Ranking.getStar(e.numOfStars),
          },
        };
      }),
    };
  }
  async verifyUser(activeCode) {
    let user = await User.findOne({ activeCode });

    if (user) {
      return await User.findByIdAndUpdate(user._id, {
        $set: { active: true },
      });
    }
  }
}

module.exports = new UserService();
