const router = require('express').Router();
const BoxController = require('./Box.controller');

router.get('/unbox/:tankUserId', BoxController.unbox);
router.get('/allBox', BoxController.getAllBoxes)
router.get('/boxDetails/:id', BoxController.getBoxDetails)
module.exports = router;