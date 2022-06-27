const express = require("express");
const Tank = require("./Tank.controller");

const router = express.Router();
router.get("/", Tank.getTankList);

module.exports = router;
