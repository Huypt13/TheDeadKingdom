const express = require("express");
const UserController = require("./User.controller");

const router = express.Router();
router.post("/", UserController.login);
router.post("/create", UserController.register);

module.exports = router;
