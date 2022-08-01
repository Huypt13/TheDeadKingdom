const UserService = require("./User.service");
const ApiResponse = require("../../utility/ApiResponse");
const Jwt = require("../../helper/Jwt.helper");

class UserController {
  async login(req, res) {
    try {
      const userinfor = req.body;
      const user = await UserService.getUser(userinfor);
      const gameServer = res.locals.gameServer;

      if (user) {
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
        return ApiResponse.successResponse(
          res,
          "Register success ,Login to play"
        );
      }
      return ApiResponse.badRequestResponse(res, "Username has already been");
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
}
module.exports = new UserController();
