const MarketPlaceController = require('./MarketPlace.controller')
const router = require("express").Router();
const Authentication = require('../middlewares/Authentication.midleware');



router.get("/transaction/:day", MarketPlaceController.getTotalTransactionsByDay)
router.get("/succeedTransaction", Authentication,MarketPlaceController.getSucceedTransaction) //* soft by date


module.exports = router;