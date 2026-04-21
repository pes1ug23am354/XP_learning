const express = require('express');
const { requireAuth, requireLearner } = require('../middleware/auth');
const controller = require('../controllers/leaderboardController');

const router = express.Router();

router.get('/', requireAuth, requireLearner, controller.getLeaderboard);

module.exports = router;
