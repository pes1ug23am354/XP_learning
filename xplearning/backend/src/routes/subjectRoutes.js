const express = require('express');
const controller = require('../controllers/subjectController');
const { requireAuth, requireLearner } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, requireLearner, controller.listSubjects);
router.post('/:subjectId/enroll', requireAuth, requireLearner, controller.enrollSubject);
router.get('/:subjectId/map', requireAuth, requireLearner, controller.getMap);

module.exports = router;
