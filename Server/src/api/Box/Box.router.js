const router = require("express").Router();
const BoxController = require("./Box.controller");
const Authentication = require("../middlewares/Authentication.midleware");
const ValidateFilter = require("../middlewares/ValidateFilter.middlewares");

router.get("/unbox/:tankUserId", Authentication, BoxController.unbox);
router.get("/allBox", BoxController.getAllBoxes);
router.get("/boxDetails/:id", BoxController.getBoxDetails2);
router.get("/boxOwnerDetails/:id",Authentication, BoxController.getBoxOwnerDetail)
router.get(
  "/allBoxOwner",
  Authentication,
  ValidateFilter.validateReqQuery,
  BoxController.getAllBoxOwnerAndPaging
);
module.exports = router;
