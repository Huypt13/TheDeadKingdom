const MarketPlaceController = require('./MarketPlace.controller')
const router = require("express").Router();
const Authentication = require('../middlewares/Authentication.midleware');



router.get("/transaction/:day", MarketPlaceController.getTotalTransactionsByDay)
router.post("/SucceedTransaction", Authentication,MarketPlaceController.getSucceedTransaction)


























module.exports = router;