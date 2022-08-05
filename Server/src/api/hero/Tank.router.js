const express = require("express");
const Tank = require("./Tank.controller");

const router = express.Router();
router.get("/", Tank.getTankList);
router.get("/infor", Tank.getTankByTankUser);
module.exports = router;
