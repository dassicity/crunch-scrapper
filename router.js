const router = require('express').Router();

const controller = require('./controller');

router.post('/scrap', controller.getRouterController);

module.exports = router;