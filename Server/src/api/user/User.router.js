const express = require("express");
const UserController = require("./User.controller");
const Authentication = require("../middlewares/Authentication.midleware");
const Validate = require("../middlewares/Validate.middlewares");

const router = express.Router();
router.post("/", UserController.login);
router.post("/logout", UserController.logout);
router.post("/create", Validate, UserController.register);
router.get("/infor", Authentication, UserController.getUserInfor);
router.get("/rank", UserController.getTopRank);
router.get("/verify/:activeCode", UserController.verifyUser);

module.exports = router;
