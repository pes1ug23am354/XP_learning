const express = require('express');
const { requireAuth, requireLearner } = require('../middleware/auth');
const controller = require('../controllers/dashboardController');

const router = express.Router();

router.get('/me', requireAuth, requireLearner, controller.getDashboard);

module.exports = router;
