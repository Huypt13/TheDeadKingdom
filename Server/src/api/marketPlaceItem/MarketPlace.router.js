const MarketPlaceController = require('./MarketPlace.controller')
const router = require("express").Router();


router.get("/transaction/:day", MarketPlaceController.getTotalTransactionsByDay)
router.post("/SucceedTransaction", MarketPlaceController.getSucceedTransaction)


























module.exports = router;