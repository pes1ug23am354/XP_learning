const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('fullName').trim().isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 }),
  ],
  validate,
  authController.register
);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
