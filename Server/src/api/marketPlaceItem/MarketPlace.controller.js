const MarketPlaceItemService = require("./MarketPlaceItem.Service");
const ApiResponse = require("../../utility/ApiResponse");

class MarketPlaceItemController {
  async getTotalTransactionsByDay(req, res) {
    try {
      let { day } = req.params;
      day = parseInt(day);
      if (!Number.isInteger(day) || day <= 0) {
        return ApiResponse.badRequestResponse(
          res,
          "Day must be integer number greater than zero"
        );
      }
      const statisticalTransaction =
        await MarketPlaceItemService.getTotalTransactionsByDay(day);
      return ApiResponse.successResponseWithData(
        res,
        "Ok",
        statisticalTransaction
      );
    } catch (e) {
      ApiResponse.serverErrorResponse(res, e.message);
    }
  }
  async getSucceedTransaction(req, res) {
    try {
      const { _id } = res.locals.user;
      let { day } = req.params;
      let filter = req.query;
      day = parseInt(day);
      if (!Number.isInteger(day) || day <= 0) {
        return ApiResponse.badRequestResponse(
          res,
          "Day must be integer number greater than zero"
        );
      }
      const Transaction =
        await MarketPlaceItemService.getSucceedTransactionAndPaging(
          _id.toString(),
          day,
          filter
        );
      return ApiResponse.successResponseWithData(res, "Ok", Transaction);
    } catch (e) {
      console.log(e);
      ApiResponse.serverErrorResponse(res, e.message);
    }
  }

  async checkInMarket(req, res) {
    try {
      const { tankUserId } = req.params;
      return ApiResponse.successResponseWithData(
        res,
        "suceess",
        await MarketPlaceItemService.checkInMarket(tankUserId)
      );
    } catch (error) {
      ApiResponse.serverErrorResponse(res, error.message);
    }
  }
}

module.exports = new MarketPlaceItemController();
