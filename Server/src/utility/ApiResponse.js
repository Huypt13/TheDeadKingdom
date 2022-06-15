const statusCode = require("./Status.helper");

function successResponse(res, msg) {
  return res.status(statusCode.OK).json({ status: 1, message: msg });
}
function successResponseWithData(res, msg, data) {
  return res.status(statusCode.OK).json({ status: 1, message: msg, data });
}
function serverErrorResponse(res, msg) {
  return res
    .status(statusCode.INTERNAL_SERVER_ERROR)
    .json({ status: 0, message: msg });
}

function notFoundResponse(res, msg) {
  return res.status(statusCode.NOT_FOUND).json({ status: 0, message: msg });
}

function unauthorizeResponse(res, msg) {
  return res.status(statusCode.UNAUTHORIZED).json({ status: 0, message: msg });
}
function badRequestResponse(res, msg) {
  return res.status(statusCode.BAD_REQUEST).json({ status: 0, message: msg });
}
module.exports = {
  successResponse,
  successResponseWithData,
  serverErrorResponse,
  notFoundResponse,
  unauthorizeResponse,
  badRequestResponse,
};
