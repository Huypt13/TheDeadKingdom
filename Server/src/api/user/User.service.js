const User = require("./User.schema");
const RabbitMq = require("../../helper/RabbitMq.helper");
const bcrypt = require("bcrypt");
const Ranking = require("../../helper/Ranking.helper");
const Jwt = require("../../helper/Jwt.helper");
const Redis = require("../../helper/Redis.helper");

class UserService {
  constructor() {
    this.SaltRounds = 10;
  }
  async getById(_id) {
    try {
      return await User.findOne({ _id }).lean();
    } catch (error) {
      throw new Error(e.message);
    }
  }
  async getByWalletAddress(walletAddress) {
    if (!walletAddress) {
      return null;
    }
    return await User.findOne({ walletAddress }).lean();
  }
  async connectWallet(walletAddress, userId) {
    try {
      const user = await this.getByWalletAddress(walletAddress);
      const user1 = await this.getById(userId);
      if (!user1) {
        return null;
      }
      if (user1 && user1?.walletAddress) {
        return null;
      }
      if (user) return null;
      return User.findByIdAndUpdate(
        userId,
        { walletAddress: walletAddress },
        { new: true }
      );
    } catch (e) {
      throw new Error(e.message);
    }
  }
  async getUser({ email, password }) {
    try {
      const user = await this.getByEmail(email);
      const passCheck = await bcrypt.compare(password, user?.password);
      if (passCheck) return user;
    } catch (error) {
      console.log("error", error);
      throw new Error("Wrong email or password");
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
      const activeCode = await Jwt.signData(
        {
          email,
        },
        process.env.AccessToken_Time || 3600
      );

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
    if (type != 1 && type != -1) return null;
    if (user && user?.numOfStars <= 20 && type == -1) return null;
    return await User.findByIdAndUpdate(
      _id,
      { $inc: { numOfStars: type } },
      { new: true }
    );
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
    try {
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
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }
  async verifyUser(activeCode) {
    let user = await User.findOne({ activeCode });
    if (!activeCode) return null;
    if (user) {
      return await User.findByIdAndUpdate(
        user._id,
        {
          $set: { active: true },
        },
        { new: true }
      );
    }
    return null;
  }
  async changePassword(infor, email) {
    try {
      const { password, newPassword } = infor;
      const user = await this.getByEmail(email);
      if (!user) {
        throw new Error(`Invalid email`);
      }
      const passCheck = await bcrypt.compare(password, user.password);
      if (!passCheck) {
        throw new Error(`Invalid password`);
      }
      if (password == newPassword) {
        throw new Error(`New password must be different old password`);
      }
      const bcryptPassword = await bcrypt.hash(newPassword, this.SaltRounds);
      await Redis.delAllByValue(user._id.toString());
      return await User.findOneAndUpdate(
        { email: email },
        { password: bcryptPassword },
        { new: true }
      );
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }
  async forgotPassword(email) {
    try {
      const EXPIRES_IN = 30;
      const resetCode = Date.now() + Math.random();
      const resetToken = await Jwt.signDataWithExpiration(
        { resetCode },
        60 * EXPIRES_IN
      );
      console.log("token rs", resetToken);
      const user = await User.findOneAndUpdate(
        { email: email },
        { resetCode: resetToken },
        { new: true }
      );
      await RabbitMq.resetPasswordNotify({
        email: email,
        url: "https://www.thedeathkingdom.tk/login/" + resetToken,
      });
      return user;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }
  async changePasswordToken(token, infor) {
    const { newPassword } = infor;
    try {
      let passCheck;
      try {
        passCheck = Jwt.veryfyData(token);
      } catch (error) {
        if (error.message == "jwt expired") {
          await User.findOneAndUpdate(
            { resetCode: token },
            { resetCode: null },
            { new: true }
          );
        }
        throw new Error(error.message);
      }
      const user = await User.findOne({ resetCode: token });
      if (!user) {
        throw new Error("Change password failed");
      }
      const bcryptPassword = await bcrypt.hash(newPassword, this.SaltRounds);
      await User.findOneAndUpdate(
        { resetCode: token },
        { password: bcryptPassword, resetCode: null }
      );
      //
      await Redis.delAllByValue(user._id.toString());
      //await User.findOneAndUpdate({ resetCode: token }, { resetCode: null })
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }
}

module.exports = new UserService();
