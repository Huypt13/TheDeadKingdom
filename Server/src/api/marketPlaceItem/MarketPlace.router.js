const MarketPlaceController = require("./MarketPlace.controller");
const router = require("express").Router();
const Authentication = require("../middlewares/Authentication.midleware");
const ValidateFilter = require("../middlewares/ValidateFilter.middlewares");

router.get(
  "/transaction/:day",
  MarketPlaceController.getTotalTransactionsByDay
);
router.get(
  "/succeedTransaction/:day",
  Authentication,
  ValidateFilter.validateReqQuery,
  MarketPlaceController.getSucceedTransaction
);

router.get("/check/:tankUserId", MarketPlaceController.checkInMarket);
module.exports = router;
