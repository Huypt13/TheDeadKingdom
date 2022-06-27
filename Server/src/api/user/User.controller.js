const UserService = require("./User.service");
const ApiResponse = require("../../utility/ApiResponse");

class UserController {
  async login(req, res) {
    const userinfor = req.body;
    const user = await UserService.getUser(userinfor);
    if (user) {
      return ApiResponse.successResponseWithData(res, "Success", {
        // tra ve token ms dung
        id: user?._id,
        username: user?.username,
      });
    }
    return ApiResponse.serverErrorResponse(res, "Invalid username or password");
  }

  async register(req, res) {
    console.log(req.body);
    const userinfor = req.body;
    const user = await UserService.insertUser(userinfor);
    if (user) {
      return ApiResponse.successResponse(
        res,
        "Register success ,Login to play"
      );
    }
    return ApiResponse.badRequestResponse(res, "Username has already been");
  }
}
module.exports = new UserController();
