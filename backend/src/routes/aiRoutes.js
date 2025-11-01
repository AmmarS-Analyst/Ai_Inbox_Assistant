const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/extract', aiController.extractTicket);

module.exports = router;

