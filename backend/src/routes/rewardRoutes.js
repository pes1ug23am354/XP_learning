const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/rewardController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/catalog', authenticate, controller.getCatalog);
router.get('/my-redemptions', authenticate, controller.myRedemptions);
router.post('/redeem/:rewardId', authenticate, controller.redeem);

router.get('/config', authenticate, authorize('admin'), controller.getRewardConfig);
router.put(
  '/config',
  authenticate,
  authorize('admin'),
  [
    body('pointsPerPass').isInt({ min: 0 }),
    body('bonusForPerfectScore').isInt({ min: 0 }),
    body('streakBonusThreshold').isInt({ min: 1 }),
    body('streakBonusPoints').isInt({ min: 0 }),
  ],
  validate,
  controller.updateRewardConfig
);

module.exports = router;
