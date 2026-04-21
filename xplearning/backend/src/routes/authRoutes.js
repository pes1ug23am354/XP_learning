const express = require('express');
const controller = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', controller.registerValidators, validate, controller.register);
router.post('/login', controller.loginValidators, validate, controller.login);
router.get('/me', requireAuth, controller.me);

module.exports = router;
