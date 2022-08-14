const express = require("express");
const Tank = require("./Tank.controller");

const router = express.Router();
router.get("/", Tank.getTankList);
router.get("/infor", Tank.getTankByTankUser);
router.get("/topTank/:number", Tank.getTopTankListedLasted)
router.get("/soldTankPaging", Tank.getTankSoldLastedAndPaging)
router.get("/tankUnsoldDetails/:id", Tank.getTankunSoldDetailsById)
router.get("/tankSoldDetails/:id", Tank.getTankSoldDetailsById)
router.post("/tankTopTank/filter", Tank.getTopListedLastedWithFilter)
router.post("/totalTankOwner/status", Tank.getTotalTankOwnerWithStatusAndPaging)
router.get("/totalTankOwner", Tank.getTotalTankOwnerPaging)
module.exports = router;
