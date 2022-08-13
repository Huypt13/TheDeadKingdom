const EmailValidator = require("email-validator");

const ApiResponse = require("../../utility/ApiResponse");

module.exports = async (req, res, next) => {
  // email
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return ApiResponse.badRequestResponse(res, "Enter all field");
  }
  // username
  if (!EmailValidator.validate(email)) {
    return ApiResponse.badRequestResponse(res, "Email error");
  }
  if (username.length > 30 || username.length < 5) {
    return ApiResponse.badRequestResponse(res, "Username must >= 5 and <=30");
  }
  if (password.length > 30 || password.length < 8) {
    return ApiResponse.badRequestResponse(res, "Password must >= 8 and <=30");
  }
  // password
  next();
};
