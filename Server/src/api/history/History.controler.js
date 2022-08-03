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
}
module.exports = new HistoryrController();
