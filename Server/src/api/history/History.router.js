const express = require("express");
const Authentication = require("../middlewares/Authentication.midleware");
const HistoryController = require("./History.controler");

const router = express.Router();
router.get("/", HistoryController.getHistory);
router.get("/summary", HistoryController.getUserSummary);

module.exports = router;
