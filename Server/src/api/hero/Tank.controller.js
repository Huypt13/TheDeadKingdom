const ApiResponse = require("../../utility/ApiResponse");
const TankService = require("./Tank.service");

class TankController {
  async getTankList(req, res) {
    const { user } = res.locals;
    console.log(user._id);
    const tankList = await TankService.getTankByUserId(user._id.toString());
    return ApiResponse.successResponseWithData(res, "Ok", {
      tankList: tankList[0]?.tankList ? tankList[0]?.tankList : [],
    });
  }
}
module.exports = new TankController();
