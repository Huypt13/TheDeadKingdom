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
        { tankId, remaining: 100, openedDate: new Date() }
      );
      const tank = await TankService.getTankInfo(tankId);
      if (!tank) return ApiResponse.serverErrorResponse(res, "Unbox Fail!");
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
  async getBoxDetails2(req, res) {
    try {
      const { id } = req.params;
      const allBox = await BoxService.getByBoxId(id);
      allBox.rate = [
        { level: 1, ratio: 60 },
        { level: 2, ratio: 30 },
        { level: 3, ratio: 10 },
      ];
      return ApiResponse.successResponseWithData(res, "Ok", { ...allBox });
    } catch (err) {
      console.log(err);
      ApiResponse.serverErrorResponse(res, err.message);
    }
  }
  async getBoxDetails(req, res) {
    try {
      const { id } = req.params;
      return ApiResponse.successResponseWithData(res, "Ok", [{ level: 1, ratio: 60 }, { level: 2, ratio: 30 }, { level: 3, ratio: 10 }]);
    } catch (err) {
      console.log(err);
      ApiResponse.serverErrorResponse(res, err.message);
    }
  }
  async getAllBoxOwnerAndPaging(req, res) {
    try {
      const { _id } = res.locals.user;
      const { pageNumbers, limit } = req.query;
      const allBox = await BoxService.getAllBoxOwnerAndPaging(
        { pageNumbers, limit },
        _id.toString()
      );
      return ApiResponse.successResponseWithData(res, "Ok", allBox);
    } catch (err) {
      console.log(err);
      ApiResponse.serverErrorResponse(res, err.message);
    }
  }
  async getBoxOwnerDetail(req, res) {
    try {
      const { id } = req.params;
      const box = await TankUserService.getBoxOwnerDetail(id);
      return ApiResponse.successResponseWithData(res, "Ok",box);
    } catch (err) {
      console.log(err);
      ApiResponse.serverErrorResponse(res, err.message);
    }
  }
}

module.exports = new BoxController();
