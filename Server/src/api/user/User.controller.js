const emailValidator = require("email-validator");

const UserService = require("./User.service");
const ApiResponse = require("../../utility/ApiResponse");
const Jwt = require("../../helper/Jwt.helper");
const { registerNotify } = require("../../helper/RabbitMq.helper");
const Redis = require("../../helper/Redis.helper");

class UserController {
  async login(req, res) {
    try {
      const userinfor = req.body;
      const user = await UserService.getUser(userinfor);
      const gameServer = res.locals.gameServer;

      if (user) {
        if (!user.active) {
          return ApiResponse.serverErrorResponse(
            res,
            "Please confirm email to active your account"
          );
        }
        if (!userinfor?.inWeb) {
          if (gameServer.connections[user._id]) {
            gameServer.connections[user._id].socket.emit(
              "someoneLoginYourAccount",
              { id: user._id }
            );
            // leave gameserver
            gameServer.onDisconnected(gameServer.connections[user._id]);
          }
        }
        const tokenData = await Jwt.signData(
          { _id: user?._id },
          +process.env.AccessToken_Time
        );
        await Redis.saveWithTtl(
          tokenData,
          user?._id.toString(),
          +process.env.AccessToken_Time
        );
        return ApiResponse.successResponseWithData(res, "Success", {
          // tra ve token ms dung
          token: tokenData,
          username: user?.username,
        });
      }
      return ApiResponse.badRequestResponse(res, "Email or password incorrect");
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async loginMarket(req, res) {
    try {
      const userinfor = req.body;
      const user = await UserService.getUser(userinfor);

      if (user) {
        if (!user.active) {
          return ApiResponse.serverErrorResponse(
            res,
            "Please confirm email to active your account"
          );
        }
        const tokenData = await Jwt.signData({ _id: user?._id });
        console.log("lala", tokenData);
        return ApiResponse.successResponseWithData(res, "Success", {
          // tra ve token ms dung
          token: tokenData,
          username: user?.username,
        });
      }
      return ApiResponse.serverErrorResponse(
        res,
        "Email or password incorrect"
      );
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }

  async connectWalletAddress(req, res) {
    try {
      const userId = res.locals.user._id.toString();
      const { walletAddress } = req.query;
      const userA = await UserService.getByWalletAddress(walletAddress);
      const user1 = await UserService.getById(userId);
      if (!user1) {
        return ApiResponse.unauthorizeResponse(res, "wrong id");
      }
      if (user1 && user1?.walletAddress) {
        return ApiResponse.badRequestResponse(
          res,
          "You already linked to Metamask"
        );
      }
      if (userA)
        return ApiResponse.badRequestResponse(res, "wallet has been used");

      if (!walletAddress) {
        return ApiResponse.serverErrorResponse(res, "WalletAddress invalid");
      }

      const isSuccess = await UserService.linkWallet(userId, walletAddress);
      if (!isSuccess) {
        return ApiResponse.badRequestResponse(
          res,
          "Connect to Wallet failed when call to blockchain"
        );
      }

      const user = await UserService.connectWallet(walletAddress, userId);
      if (!user) {
        return ApiResponse.badRequestResponse(
          res,
          "Connect to Wallet failed when save data to Database"
        );
      }
      return ApiResponse.successResponseWithData(res, "success", user);
    } catch (error) {
      console.log(error);
      return ApiResponse.serverErrorResponse(res, "Connect to Wallet failed");
    }
  }

  async logout(req, res) {
    try {
      let token = req.header("x-access-token");
      await Redis.saveWithTtl(token, "", 0);
      return ApiResponse.successResponse(res, "Logout success");
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async register(req, res) {
    try {
      let userinfor = req.body;
      const user = await UserService.insertUser(userinfor);

      if (user) {
        await registerNotify({
          email: user?.email,
          username: user?.username,
          url: `https://www.thedeathkingdom.tk/verify/${user?.activeCode}`,
        });
        return ApiResponse.successResponse(
          res,
          "Register success ,check email to active account"
        );
      }
      return ApiResponse.badRequestResponse(res, "Email has already been");
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }

  async getUserInfor(req, res) {
    console.log("xx");
    try {
      let _id = res.locals?.user?._id.toString();

      if (req.query?.userId) {
        _id = req.query.userId;
      }
      const userInfor = await UserService.getUserInfor(_id);
      if (userInfor?.walletAddress) {
        userInfor.balance = await UserService.getDKCBalance(
          userInfor?.walletAddress
        );
      }
      return ApiResponse.successResponseWithData(res, "Success", userInfor);
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }

  async getTopRank(req, res) {
    try {
      let { top } = req.query;
      if (!Number.isInteger(top)) {
        top = 20;
      } else if (top < 1) {
        top = 20;
      }
      const topRank = await UserService.getTopRank(top);
      return ApiResponse.successResponseWithData(res, "Success", topRank);
    } catch (error) {
      console.log(error.message);
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async verifyUser(req, res) {
    const { activeCode } = req.params;
    try {
      const success = await UserService.verifyUser(activeCode);
      if (success) {
        return ApiResponse.successResponse(res, "active success");
      }
      return ApiResponse.badRequestResponse(res, "cannot active account");
    } catch (error) {
      console.log(error.message);
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async changePassword(req, res) {
    try {
      const { newPassword, password } = req.body;
      const email = res.locals.user.email;
      if (newPassword.length > 30 || newPassword.length < 8) {
        return ApiResponse.badRequestResponse(
          res,
          "newPassword must >= 8 and <=30"
        );
      }
      if (password.length > 30 || password.length < 8) {
        return ApiResponse.badRequestResponse(
          res,
          "Password must >= 8 and <=30"
        );
      }
      const user = await UserService.changePassword(
        { password, newPassword },
        email
      );
      if (!user)
        return ApiResponse.serverErrorResponse(res, "can not change password");
      return ApiResponse.successResponse(res, "Change password success");
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!emailValidator.validate(email)) {
        return ApiResponse.badRequestResponse(res, "Wrong email");
      }
      await UserService.forgotPassword(email);
      return ApiResponse.successResponse(
        res,
        "Send resetPassword to email success"
      );
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async changePasswordToken(req, res) {
    try {
      const { token, newPassword } = req.body;
      if (newPassword.length > 30 || newPassword.length < 8) {
        return ApiResponse.badRequestResponse(
          res,
          "Password must >= 8 and <=30"
        );
      }
      await UserService.changePasswordToken(token, newPassword);
      return ApiResponse.successResponse(res, "Change password success");
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
}
module.exports = new UserController();
