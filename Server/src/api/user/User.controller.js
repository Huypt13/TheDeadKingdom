const UserService = require("./User.service");
const ApiResponse = require("../../utility/ApiResponse");
const Jwt = require("../../helper/Jwt.helper");
const { registerNotify } = require("../../helper/RabbitMq.helper");

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
        if (gameServer.connections[user._id]) {
          gameServer.connections[user._id].socket.emit(
            "someoneLoginYourAccount",
            { id: user._id }
          );
          // leave gameserver
          gameServer.onDisconnected(gameServer.connections[user._id]);
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
        "Invalid username or password"
      );
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
          url: `${process.env.WEB_URL}/user/verify/${user?.activeCode}`,
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
    try {
      let _id = res.locals?.user?._id.toString();
      if (req.query?.userId) {
        _id = req.query.userId;
      }
      const userInfor = await UserService.getUserInfor(_id);
      return ApiResponse.successResponseWithData(res, "Success", userInfor);
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async getTopRank(req, res) {
    try {
      const { top } = req.query;
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
}
module.exports = new UserController();
