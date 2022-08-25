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

  async getTankByTankUser1(req, res) {
    try {
      const { _id } = req.query;
      const tank = await TankService.getByTankUserId(_id);
      return ApiResponse.successResponseWithData(res, "Ok", tank);
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }

  async getTopTankListedLastedAndPaging(req, res) {
    try {
      const { pageNumbers, limit, number } = req.query;
      const listTopTank = await TankService.getTopTankListedLastedAndPaging(
        pageNumbers,
        limit,
        number
      );
      return ApiResponse.successResponseWithData(res, "Ok", listTopTank);
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async getTankSoldLastedAndPaging(req, res) {
    try {
      const { pageNumbers, limit } = req.query;
      const listTank = await TankService.getTankSoldLastedAndPaging(
        pageNumbers,
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
  async getTopListedLastedWithFilterAndPaging(req, res) {
    try {
      const filter = req.query;
      // { "levels": [1, 2, 3], "classTypes": [1, 2, 3], "typeIds": ["001", "002", "003"],
      // "sortBy": { "createdAt": -1 }, "pageNumbers": 1, "limit" : 2, "remaining":100, "minPrice":120, "maxPrice":190 }
      const details = await TankService.getTopListedLastedWithFilterAndPaging(
        filter
      );
      return ApiResponse.successResponseWithData(res, "Ok", details);
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
  async getTotalTankOwnerWithStatusAndPaging(req, res) {
    try {
      const { _id } = res.locals.user;
      const filter = req.query;
      const totalTankOwner =
        await TankService.getTotalTankOwnerWithStatusAndPaging(
          filter,
          _id.toString()
        );
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
