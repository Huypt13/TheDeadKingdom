const ApiResponse = require("../../utility/ApiResponse");
const Jwt = require("../../helper/Jwt.helper");
const HistoryServices = require("./History.service");

class HistoryrController {
  async getHistory(req, res) {
    const { user } = res.locals;
    const top = req.query.top || 20;
    console.log(user._id);
    const history = await HistoryServices.getUserHistory(
      user._id.toString(),
      top
    );
    return ApiResponse.successResponseWithData(res, "Ok", history);
  }
  async getUserSummary(req, res) {
    try {
      const { user } = res.locals;
      const history = await HistoryServices.getUserSummary(user._id.toString());
      if (history && history.length > 0)
        return ApiResponse.successResponseWithData(res, "Ok", history[0]);
      return ApiResponse.successResponse(res, "No data");
    } catch (error) {
      return ApiResponse.serverErrorResponse(res, error.message);
    }
  }
}
module.exports = new HistoryrController();
