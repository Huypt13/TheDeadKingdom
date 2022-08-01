const _ = require("lodash");

const UserService = require("../user/User.service");
const Jwt = require("../../helper/Jwt.helper");

module.exports.getUserId = async (token) => {
  try {
    if (token == undefined || token == null) {
      // ApiResponse.unauthorizeResponse(res, "unauthorizeResponse");
      return null;
    }
    //  let _id = jwthelper.veryfyData(token)._id;
    // giai ma token cac kieu. lam sau
    const data = await Jwt.veryfyData(token);
    console.log(data);
    const user = await UserService.getById(data._id);
    if (_.isEmpty(user)) {
      return null;
    } else {
      return data._id;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
