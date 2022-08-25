const express = require("express");

const ValidateFilter = require("../middlewares/ValidateFilter.middlewares");

const Authentication = require("../middlewares/Authentication.midleware");

const Tank = require("./Tank.controller");

const router = express.Router();
router.get("/", Authentication, Tank.getTankList);
router.get("/infor", Authentication, Tank.getTankByTankUser);
router.get("/infor1", Tank.getTankByTankUser1);
router.get(
  "/topTankUnsold",
  ValidateFilter.validateReqQuery,
  Tank.getTopTankListedLastedAndPaging
); //* k can phan trang
router.get(
  "/soldTankPaging",
  ValidateFilter.validateReqQuery,
  Tank.getTankSoldLastedAndPaging
);
router.get("/tankUnsoldDetails/:id", Tank.getTankunSoldDetailsById);
router.get("/tankSoldDetails/:id", Tank.getTankSoldDetailsById);
router.get(
  "/tankTopTank/filter",
  ValidateFilter.validateReqQuery,
  Tank.getTopListedLastedWithFilterAndPaging
); //*remaing, price range , truyen qua request
router.get(
  "/totalTankOwner/status",
  Authentication,
  ValidateFilter.validateReqQuery,
  Tank.getTotalTankOwnerWithStatusAndPaging
);
router.get(
  "/totalTankOwner",
  Authentication,
  ValidateFilter.validateReqQuery,
  Tank.getTotalTankOwnerPaging
);

module.exports = router;
