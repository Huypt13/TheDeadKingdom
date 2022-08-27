const validator = require("validator");
const ApiResponse = require("../../utility/ApiResponse");

module.exports.validateReqQuery = async (req, res, next) => {
  try {
    convertStringToObject(req);
    // console.log("object",req.query);
    const {
      levels,
      classTypes,
      typeIds,
      limit,
      pageNumbers,
      sortBy,
      status,
      remaining,
      maxPrice,
      minPrice,
      number,
    } = req.query;
    if (limit >= 100 || limit <= 0 || !limit) {
      req.query.limit = 1;
    }
    if (pageNumbers >= 100 || pageNumbers <= 0 || !pageNumbers) {
      req.query.pageNumbers = 1;
    }
    if (!levels || typeof levels != "object") {
      req.query.levels = [1, 2, 3];
    }
    if (!classTypes || typeof classTypes != "object") {
      req.query.classTypes = [1, 2, 3];
    }
    if (!typeIds || typeof typeIds != "object") {
      req.query.typeIds = ["001", "002", "003"];
    }
    if (!sortBy || typeof sortBy != "object") {
      req.query.sortBy = { name: -1 };
    }
    if (!status || typeof status != "string") {
      req.query.status = "Owned";
    }
    if (
      !remaining ||
      remaining < 0 ||
      !Number.isInteger(remaining) ||
      remaining > 200
    ) {
      req.query.remaining = 100;
    }
    if (
      !maxPrice ||
      maxPrice < 0 ||
      !validator.isFloat(maxPrice + "")
    ) {
      req.query.maxPrice = Number.MAX_VALUE;
    }
    if (
      !minPrice ||
      minPrice < 0 ||
      !validator.isFloat(minPrice + "")
    ) {
      req.query.minPrice = 1;
    }
    if (req.query.maxPrice < req.query.minPrice) {
      req.query.maxPrice = Number.MAX_VALUE;
      req.query.minPrice = 10;
    }
    if (!number || !Number.isInteger(number) || number < 0 || number > 200) {
      req.query.number = 100;
    }

    next();
  } catch (error) {
    console.log(error);
    ApiResponse.serverErrorResponse(res, error.message);
  }
  // console.log("object2",req.query);
};

function convertStringToObject(req) {
  for (property in req.query) {
    req.query[property] = JSON.parse(req.query[property]);
  }
}
