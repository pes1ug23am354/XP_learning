const express = require('express');
const { body } = require('express-validator');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const controller = require('../controllers/adminController');

const router = express.Router();

router.post('/subjects', requireAuth, requireAdmin, controller.subjectValidators, validate, controller.createSubject);
router.post('/chapters', requireAuth, requireAdmin, controller.chapterValidators, validate, controller.createChapter);
router.post('/topics', requireAuth, requireAdmin, controller.topicValidators, validate, controller.createTopic);
router.get('/users', requireAuth, requireAdmin, controller.listUsers);
router.get('/analytics', requireAuth, requireAdmin, controller.getAdminAnalytics);
router.get('/content-tree', requireAuth, requireAdmin, controller.getContentTree);
router.patch('/users/:userId/role', requireAuth, requireAdmin, [body('role').isIn(['learner', 'admin'])], validate, controller.updateUserRole);

module.exports = router;
