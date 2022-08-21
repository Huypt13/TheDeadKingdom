const express = require("express");

const ValidateFilter = require("../middlewares/ValidateFilter.middlewares");


const Authentication = require("../middlewares/Authentication.midleware");

const Tank = require("./Tank.controller");

const router = express.Router();
router.get("/", Authentication, Tank.getTankList);
router.get("/infor", Authentication, Tank.getTankByTankUser);
router.get("/topTankUnsold", Tank.getTopTankListedLastedAndPaging)//* k can phan trang
router.get("/soldTankPaging", Tank.getTankSoldLastedAndPaging)
router.get("/tankUnsoldDetails/:id", Tank.getTankunSoldDetailsById)
router.get("/tankSoldDetails/:id", Tank.getTankSoldDetailsById)
router.post("/tankTopTank/filter", Tank.getTopListedLastedWithFilterAndPaging)//*remaing, price range , truyen qua request
router.post("/totalTankOwner/status", Authentication, ValidateFilter.validateReqBody, Tank.getTotalTankOwnerWithStatusAndPaging)
router.get("/totalTankOwner", Authentication, ValidateFilter.validateReqQuery, Tank.getTotalTankOwnerPaging)
module.exports = router;
