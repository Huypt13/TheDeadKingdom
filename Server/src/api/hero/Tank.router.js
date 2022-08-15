const express = require("express");

const Authentication = require("../middlewares/Authentication.midleware");

const Tank = require("./Tank.controller");

const router = express.Router();
router.get("/", Authentication, Tank.getTankList);
router.get("/infor", Authentication, Tank.getTankByTankUser);
router.get("/topTank/:number", Tank.getTopTankListedLasted)
router.get("/soldTankPaging", Tank.getTankSoldLastedAndPaging)
router.get("/tankUnsoldDetails/:id", Tank.getTankunSoldDetailsById)
router.get("/tankSoldDetails/:id", Tank.getTankSoldDetailsById)
router.post("/tankTopTank/filter", Tank.getTopListedLastedWithFilter)
router.post("/totalTankOwner/status", Authentication, Tank.getTotalTankOwnerWithStatusAndPaging)
router.get("/totalTankOwner", Authentication, Tank.getTotalTankOwnerPaging)
module.exports = router;
