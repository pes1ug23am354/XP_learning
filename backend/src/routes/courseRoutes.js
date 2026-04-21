const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', authenticate, controller.getCourses);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  [body('title').notEmpty(), body('description').optional(), body('difficulty').isIn(['beginner', 'intermediate', 'advanced'])],
  validate,
  controller.createCourse
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [body('title').notEmpty(), body('difficulty').isIn(['beginner', 'intermediate', 'advanced']), body('isPublished').isBoolean()],
  validate,
  controller.updateCourse
);

router.delete('/:id', authenticate, authorize('admin'), controller.deleteCourse);

module.exports = router;
