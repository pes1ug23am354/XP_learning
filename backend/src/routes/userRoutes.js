const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/me/progress', authenticate, controller.myProgress);
router.get('/', authenticate, authorize('admin'), controller.getUsers);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [body('role').isIn(['admin', 'user']), body('isActive').isBoolean()],
  validate,
  controller.updateUser
);

module.exports = router;
