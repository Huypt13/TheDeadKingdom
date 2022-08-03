const express = require("express");
const UserController = require("./User.controller");
const Authentication = require("../middlewares/Authentication.midleware");

const router = express.Router();
router.post("/", UserController.login);
router.post("/create", UserController.register);
router.get("/infor", Authentication, UserController.getUserInfor);
router.get("/rank", UserController.getTopRank);

module.exports = router;
