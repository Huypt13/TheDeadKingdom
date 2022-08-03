const ApiResponse = require("../../utility/ApiResponse");
const TankService = require("./Tank.service");

class TankController {
  async getTankList(req, res) {
    try {
      const { user } = res.locals;
      const tankList = await TankService.getTankByUserId(user._id.toString());
      return ApiResponse.successResponseWithData(res, "Ok", {
        tankList: tankList[0]?.tankList ? tankList[0]?.tankList : [],
      });
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async getTankByTankUser(req, res) {
    try {
      const { user } = res.locals;
      const { _id } = req.query;
      const tank = await TankService.getByTankId(_id, user._id.toString());
      return ApiResponse.successResponseWithData(res, "Ok", tank);
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
}
module.exports = new TankController();
