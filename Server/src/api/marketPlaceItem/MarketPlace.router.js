const MarketPlaceController = require("./MarketPlace.controller");
const router = require("express").Router();
const Authentication = require("../middlewares/Authentication.midleware");

router.get(
  "/transaction/:day",
  MarketPlaceController.getTotalTransactionsByDay
);
router.get(
  "/succeedTransaction/:day",
  Authentication,
  MarketPlaceController.getSucceedTransaction
);

router.get("/check/:tankUserId", MarketPlaceController.checkInMarket);
module.exports = router;
