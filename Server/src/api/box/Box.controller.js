const BoxService = require("./Box.service");
const ApiResponse = require("../../utility/ApiResponse");
const TankUserService = require("../hero/TankUser.service");
const TankService = require("../hero/Tank.service");

class BoxController {
  async unbox(req, res) {
    try {
      const { tankUserId } = req.params;
      const { _id } = res.locals.user;
      const tankUser = await TankService.getByTankUserById(
        tankUserId,
        _id.toString()
      );
      if (!tankUser || tankUser.tankId) {
        throw new Error("Unbox Fail!");
      }
      const boxId = await TankUserService.getBoxId(tankUserId);
      const tankId = await BoxService.unbox(boxId);
      await TankUserService.updateData(
        { _id: tankUserId },
        { tankId, remaining: 100 }
      );
      const tank = await TankService.getByTankId(tankId);
      return ApiResponse.successResponseWithData(res, "Unbox Success", tank);
    } catch (err) {
      console.log(err);
      ApiResponse.serverErrorResponse(res, "Unbox Fail!");
    }
  }

  async getAllBoxes(req, res) {
    try {
      const allBox = await BoxService.getAllBoxes();
      return ApiResponse.successResponseWithData(res, "Ok", allBox);
    } catch (err) {
      ApiResponse.serverErrorResponse(res, err.message);
    }
  }
  async getBoxDetails(req, res) {
    try {
      const { id } = req.params;
      const allBox = await BoxService.getByBoxId(id);
      return ApiResponse.successResponseWithData(res, "Ok", allBox);
    } catch (err) {
      console.log(err);
      ApiResponse.serverErrorResponse(res, err.message);
    }
  }
  async getAllBoxOwner(req, res) {
    try {
      const { _id } = res.locals.user;
      const allBox = await BoxService.getAllBoxOwner(_id.toStirng());
      return ApiResponse.successResponseWithData(res, "Ok", allBox);
    } catch (err) {
      console.log(err);
      ApiResponse.serverErrorResponse(res, err.message);
    }
  }
}

module.exports = new BoxController();
