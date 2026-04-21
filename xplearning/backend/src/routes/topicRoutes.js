const express = require('express');
const controller = require('../controllers/topicController');
const { requireAuth, requireLearner } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/:topicId', requireAuth, requireLearner, controller.getTopic);
router.post('/:topicId/read', requireAuth, requireLearner, controller.markRead);
router.post('/:topicId/quiz/start', requireAuth, requireLearner, controller.startQuiz);
router.post('/:topicId/quiz', requireAuth, requireLearner, controller.submitQuizValidators, validate, controller.submitQuiz);
router.post('/chapter-challenge/:chapterId', requireAuth, requireLearner, controller.chapterChallengeValidators, validate, controller.submitChapterChallenge);

module.exports = router;
