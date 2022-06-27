const _ = require("lodash");

const UserService = require("../user/User.service");
const ApiResponse = require("../../utility/ApiResponse");

module.exports = async (req, res, next) => {
  try {
    let token = req.header("x-access-token");
    if (token == undefined || token == null) {
      ApiResponse.unauthorizeResponse(res, "unauthorizeResponse");
      return;
    }
    //  let _id = jwthelper.veryfyData(token)._id;
    // giai ma token cac kieu. lam sau
    const _id = token;
    const user = await UserService.getById(_id);
    if (_.isEmpty(user)) {
      res.locals.user = null;
      ApiResponse.unauthorizeResponse(res, "unauthorizeResponse");
      return;
    } else {
      res.locals.user = user;
      res.locals.user.password = undefined;
    }
    next();
  } catch (error) {
    ApiResponse.unauthorizeResponse(res, "unauthorizeResponse");
  }
};
