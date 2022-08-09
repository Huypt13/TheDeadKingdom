const User = require("./User.schema");
const bcrypt = require("bcrypt");
const Ranking = require("../../helper/Ranking.helper");

class UserService {
  constructor() {
    this.SaltRounds = 10;
  }
  async getById(_id) {
    return await User.findOne({ _id }).lean();
  }
  async getByWalletAddress(walletAddress) {
    return await User.findOne({ walletAddress }).lean();
  }
  async connectWallet(walletAddress, userId) {
    try {
      const user = await this.getByWalletAddress(walletAddress);
      if (!user) return null
      return User.findByIdAndUpdate(userId, { walletAddress: walletAddress }, { new: true });
    } catch (e) {
      throw new Error(error.message);
    }
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
}

module.exports = new UserService();
