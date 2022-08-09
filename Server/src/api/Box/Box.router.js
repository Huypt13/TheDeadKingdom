const router = require('express').Router();
const BoxController = require('./Box.controller');

router.post('/unbox', BoxController.unbox);

module.exports = router;