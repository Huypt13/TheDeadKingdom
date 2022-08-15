const router = require('express').Router();
const BoxController = require('./Box.controller');
const Authentication = require('../middlewares/Authentication.midleware');


router.get('/unbox/:tankUserId', Authentication, BoxController.unbox);
router.get('/allBox', BoxController.getAllBoxes)
router.get('/boxDetails/:id', BoxController.getBoxDetails)
router.get("/allBoxOwner", Authentication, BoxController.getAllBoxOwner)
module.exports = router;