const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/course/:courseId', authenticate, controller.listTasks);
router.get('/my-attempts', authenticate, controller.myAttempts);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('courseId').isInt(),
    body('title').notEmpty(),
    body('prompt').notEmpty(),
    body('questionType').isIn(['mcq', 'true_false', 'short_answer']),
    body('options').isArray(),
    body('answerKey').isObject(),
    body('passingScore').isInt({ min: 0, max: 100 }),
    body('maxPoints').isInt({ min: 1 }),
  ],
  validate,
  controller.createTask
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [
    body('title').notEmpty(),
    body('prompt').notEmpty(),
    body('questionType').isIn(['mcq', 'true_false', 'short_answer']),
    body('options').isArray(),
    body('answerKey').isObject(),
    body('passingScore').isInt({ min: 0, max: 100 }),
    body('maxPoints').isInt({ min: 1 }),
  ],
  validate,
  controller.updateTask
);

router.delete('/:id', authenticate, authorize('admin'), controller.deleteTask);

router.post(
  '/:id/attempt',
  authenticate,
  [body('submittedAnswers').isObject(), body('submittedAnswers.selectedOption').notEmpty()],
  validate,
  controller.attemptTask
);

module.exports = router;
