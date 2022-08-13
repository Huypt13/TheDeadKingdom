const _ = require("lodash");

const UserService = require("../user/User.service");
const ApiResponse = require("../../utility/ApiResponse");
const Jwt = require("../../helper/Jwt.helper");
const Redis = require("../../helper/Redis.helper");

module.exports = async (req, res, next) => {
  try {
    let token = req.header("x-access-token");
    if (token == undefined || token == null) {
      ApiResponse.unauthorizeResponse(res, "unauthorizeResponse");
      return;
    }
    //  let _id = jwthelper.veryfyData(token)._id;
    // giai ma token cac kieu. lam sau
    const { _id } = Jwt.veryfyData(token);
    const loginID = await Redis.get(token);
    if (loginID != _id) {
      ApiResponse.unauthorizeResponse(res, "unauthorizeResponse 1");
      return;
    }
    const user = await UserService.getById(_id);
    if (_.isEmpty(user)) {
      res.locals.user = null;
      ApiResponse.unauthorizeResponse(res, "unauthorizeResponse 2");
      return;
    } else {
      res.locals.user = user;
      res.locals.user.password = undefined;
    }
    next();
  } catch (error) {
    ApiResponse.unauthorizeResponse(res, "unauthorizeResponse 3");
  }
};
