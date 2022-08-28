const User = require("./User.schema");
const RabbitMq = require("../../helper/RabbitMq.helper");
const bcrypt = require("bcrypt");
const Ranking = require("../../helper/Ranking.helper");
const Jwt = require("../../helper/Jwt.helper");
const Redis = require("../../helper/Redis.helper");

const Web3 = require("web3");

const DeathKingdomCoin = require("../../../../Contract/demo-client/contracts/DeathKingdomCoin.json");
const TankNFT = require("../../../../Contract/demo-client/contracts/TankNFT.json");
const Marketplace = require("../../../../Contract/demo-client/contracts/Marketplace.json");
const LinkWallet = require("../../../../Contract/demo-client/contracts/LinkWallet.json");

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
      return await User.findByIdAndUpdate(
        userId,
        { walletAddress: walletAddress },
        { new: true }
      );
    } catch (e) {
      console.log(e);
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
        numOfStars: 1,
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
  async changePassword({ password, newPassword }, email) {
    try {
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
      Redis.delAllByValue(user._id.toString());
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
        url: "https://www.thedeathkingdom.tk/reset-password/" + resetToken,
      });
      return user;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }
  async changePasswordToken(token, newPassword) {
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

  async setWeb3Value() {
    try {
      const web3 = new Web3(
        "https://rinkeby.infura.io/v3/fe3e4b587cc84ddb8f281f9bfdf3df6c"
      );
      const networkId = await web3.eth.net.getId();
      const deathKingdomCoinContract = new web3.eth.Contract(
        DeathKingdomCoin.abi,
        DeathKingdomCoin.networks[networkId].address
      );
      const tankNFTContract = new web3.eth.Contract(
        TankNFT.abi,
        TankNFT.networks[networkId].address
      );
      const marketplaceContract = new web3.eth.Contract(
        Marketplace.abi,
        Marketplace.networks[networkId].address
      );
      const linkWalletContract = new web3.eth.Contract(
        LinkWallet.abi,
        LinkWallet.networks[networkId].address
      );

      return {
        web3,
        networkId,
        deathKingdomCoinContract,
        tankNFTContract,
        marketplaceContract,
        linkWalletContract,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async linkWallet(userId, walletAddress) {
    try {
      let { web3, linkWalletContract } = await this.setWeb3Value();

      const address = "0xA338b617517AFF6ca572B0D5Be5A64b64DabCA2d";
      const privateKey =
        "c5da068700edd9097b7a4ad79db5bd61021b9ecef75f112c01e3e1d9272dee92";

      web3.eth.accounts.wallet.add(privateKey);

      const tx = linkWalletContract.methods.linkWallet(walletAddress, userId);
      const gas = await tx.estimateGas({ from: address });
      const gasPrice = await web3.eth.getGasPrice();
      const data = tx.encodeABI();
      const nonce = await web3.eth.getTransactionCount(address);
      const txData = {
        from: address,
        to: linkWalletContract.options.address,
        data: data,
        gas,
        gasPrice,
        nonce,
      };

      await web3.eth.sendTransaction(txData);

      // console.log(
      //   await linkWalletContract.methods
      //     .getUserIdByWalletAddress(walletAddress)
      //     .call()
      // );
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async getDKCBalance(walletAddress) {
    try {
      let { web3, deathKingdomCoinContract } = await this.setWeb3Value();
      const balance = await deathKingdomCoinContract.methods
        .balanceOf(walletAddress)
        .call();
      let bl = Web3.utils.fromWei(balance, "ether");
      if (bl) return bl;
      return null;
    } catch (error) {}
  }

  async rewardAfterMatch(userId, isWin) {
    try {
      let { web3, deathKingdomCoinContract } = await this.setWeb3Value();

      let player = await this.getById(userId);
      let reward = 0;
      if (isWin) {
        reward = 3 + 0.5 * Ranking.getRankIndex(player.numOfStars);
      } else {
        reward = 1 + 0.2 * Ranking.getRankIndex(player.numOfStars);
      }

      if (player.walletAddress) {
        const address = "0xA338b617517AFF6ca572B0D5Be5A64b64DabCA2d";
        const privateKey =
          "c5da068700edd9097b7a4ad79db5bd61021b9ecef75f112c01e3e1d9272dee92";

        web3.eth.accounts.wallet.add(privateKey);

        const tx = deathKingdomCoinContract.methods.transfer(
          player.walletAddress,
          Web3.utils.toWei(reward.toString(), "ether")
        );
        const gas = await tx.estimateGas({ from: address });
        const gasPrice = await web3.eth.getGasPrice();
        const data = tx.encodeABI();
        const nonce = await web3.eth.getTransactionCount(address);
        const txData = {
          from: address,
          to: deathKingdomCoinContract.options.address,
          data: data,
          gas,
          gasPrice,
          nonce,
        };

        await web3.eth.sendTransaction(txData);
      }

      return reward;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }
}

module.exports = new UserService();
