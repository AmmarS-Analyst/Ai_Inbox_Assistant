const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');

router.get('/summary', metricsController.summary);

module.exports = router;
