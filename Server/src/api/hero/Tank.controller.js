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
  async getTopTankListedLasted(req, res) {
    try {
      const { number } = req.params;
      const listTopTank = await TankService.getTopTankListedLasted(number);
      return ApiResponse.successResponseWithData(res, "Ok", listTopTank);
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async getTankSoldLastedAndPaging(req, res) {
    try {
      const { pageNumber, limit } = req.query;
      const listTank = await TankService.getTankSoldLastedAndPaging(
        pageNumber,
        limit
      );
      return ApiResponse.successResponseWithData(res, "Ok", listTank);
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async getTankunSoldDetailsById(req, res) {
    try {
      const { id } = req.params;
      const details = await TankService.getTankUnsoldDetailsById(id);
      return ApiResponse.successResponseWithData(res, "Ok", details);
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async getTankSoldDetailsById(req, res) {
    try {
      const { id } = req.params;
      const details = await TankService.getTankSoldDetailsById(id);
      return ApiResponse.successResponseWithData(res, "Ok", details);
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async getTopListedLastedWithFilter(req, res) {
    try {
      const { filter } = req.body;
      // { levels: [1, 2, 3], classTypes: [1, 2, 3], typeIds: ["001", "002", "003"],
      //  sortBy: { name: -1 } }
      const details = await TankService.getTopListedLastedWithFilter(filter);
      return ApiResponse.successResponseWithData(res, "Ok", details);
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async getTotalTankOwnerWithStatusAndPaging(req, res) {
    try {
      const { _id } = res.locals.user;
      const {filter} = req.body;
      const totalTankOwner = await TankService.getTotalTankOwnerWithStatusAndPaging(filter, _id.toString());
      return ApiResponse.successResponseWithData(res, "Ok", totalTankOwner);
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async getTotalTankOwnerPaging(req, res) {
    try {
      const { _id } = res.locals.user;
      const paging = req.query;
      const totalTankOwner = await TankService.getTotalTankOwnerPaging(
        _id.toString(),
        paging
      );
      return ApiResponse.successResponseWithData(res, "Ok", totalTankOwner);
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
}

module.exports = new TankController();
