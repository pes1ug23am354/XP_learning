const crypto = require('crypto');
const { body } = require('express-validator');
const { ok, fail } = require('../utils/response');
const { pool, getEnrollment, updateStreak, grantXP, calculateTopicXP } = require('../services/sqlHelpers');

const submitQuizValidators = [
  body('sessionToken').isString().isLength({ min: 10 }),
  body('answers').isArray({ min: 1 }),
  body('answers.*.questionId').isString(),
  body('answers.*.selectedIndex').isInt({ min: 0, max: 3 }),
  body('durationSec').optional().isInt({ min: 0 }),
];
const chapterChallengeValidators = [
  body('answers').isArray({ min: 1 }),
  body('answers.*').isInt({ min: 0, max: 3 }),
  body('durationSec').optional().isInt({ min: 0 }),
];

const getTopicAndEnrollment = async (userId, topicId) => {
  const topic = (await pool.query(
    `SELECT t.*, c.subject_id, c.id AS chapter_id
     FROM topics t JOIN chapters c ON t.chapter_id=c.id WHERE t.id=$1`,
    [topicId]
  )).rows[0];
  if (!topic) return { error: 'Topic not found', status: 404 };

  const enrollment = await getEnrollment(userId, topic.subject_id);
  if (!enrollment) return { error: 'Enroll in subject first', status: 400 };

  const progress = (await pool.query('SELECT * FROM topic_progress WHERE enrollment_id=$1 AND topic_id=$2', [enrollment.id, topic.id])).rows[0];
  if (!progress) return { error: 'Progress row missing', status: 400 };

  return { topic, enrollment, progress };
};

const getTopic = async (req, res) => {
  const result = await getTopicAndEnrollment(req.user.id, Number(req.params.topicId));
  if (result.error) return fail(res, result.error, result.status);
  const { topic, progress } = result;

  if (!progress.unlocked) return fail(res, 'Topic is locked', 403);

  await pool.query('UPDATE users SET last_topic_id=$2, updated_at=NOW() WHERE id=$1', [req.user.id, topic.id]);

  return ok(res, {
    id: topic.id,
    subjectId: topic.subject_id,
    chapterId: topic.chapter_id,
    title: topic.title,
    order: topic.topic_order,
    estimatedMinutes: topic.estimated_minutes,
    content: topic.content,
    quizMeta: {
      questionBankSize: topic.quiz_questions.length,
      quizQuestionsPerAttempt: 15,
      passScore: topic.quiz_pass_score,
      xpBase: topic.quiz_xp_base,
    },
    read: progress.is_read,
  });
};

const markRead = async (req, res) => {
  const result = await getTopicAndEnrollment(req.user.id, Number(req.params.topicId));
  if (result.error) return fail(res, result.error, result.status);

  if (!result.progress.unlocked) return fail(res, 'Topic is locked', 403);

  await pool.query('UPDATE topic_progress SET is_read=TRUE WHERE id=$1', [result.progress.id]);
  return ok(res, { read: true }, 'Topic marked as read');
};

const sampleQuestions = (bank, count = 15) => {
  const arr = [...bank];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
};

const startQuiz = async (req, res) => {
  const topicId = Number(req.params.topicId);
  const result = await getTopicAndEnrollment(req.user.id, topicId);
  if (result.error) return fail(res, result.error, result.status);

  const { topic, progress } = result;
  if (!progress.unlocked) return fail(res, 'Topic is locked', 403);
  if (!progress.is_read) return fail(res, 'Read content before quiz', 400);

  const bank = topic.quiz_questions || [];
  if (bank.length < 15) return fail(res, 'Question bank must contain at least 15 questions', 500);

  const selected = sampleQuestions(bank, 15);
  const sessionToken = crypto.randomUUID();

  await pool.query(
    `INSERT INTO quiz_sessions (session_token, user_id, topic_id, question_set, consumed, expires_at)
     VALUES ($1,$2,$3,$4::jsonb,FALSE,NOW() + INTERVAL '45 minutes')`,
    [sessionToken, req.user.id, topicId, JSON.stringify(selected)]
  );

  return ok(res, {
    sessionToken,
    questions: selected.map((q) => ({ questionId: q.id, prompt: q.prompt, options: q.options })),
    passScore: topic.quiz_pass_score,
  }, 'Quiz session created');
};

const unlockProgression = async (enrollmentId, topic) => {
  const chapterTopics = (await pool.query('SELECT id, topic_order FROM topics WHERE chapter_id=$1 ORDER BY topic_order', [topic.chapter_id])).rows;
  const idx = chapterTopics.findIndex((t) => t.id === topic.id);

  if (idx >= 0 && idx < chapterTopics.length - 1) {
    await pool.query('UPDATE topic_progress SET unlocked=TRUE WHERE enrollment_id=$1 AND topic_id=$2', [enrollmentId, chapterTopics[idx + 1].id]);
    return;
  }

  const allDone = (await pool.query(
    `SELECT COUNT(*)::int AS total,
            COALESCE(SUM(CASE WHEN completed THEN 1 ELSE 0 END),0)::int AS done
     FROM topic_progress tp JOIN topics t ON tp.topic_id=t.id
     WHERE tp.enrollment_id=$1 AND t.chapter_id=$2`,
    [enrollmentId, topic.chapter_id]
  )).rows[0];

  if (allDone.total === allDone.done) {
    await pool.query('UPDATE chapter_progress SET completed=TRUE WHERE enrollment_id=$1 AND chapter_id=$2', [enrollmentId, topic.chapter_id]);

    const nextChapter = (await pool.query(
      `SELECT c2.id
       FROM chapters c1 JOIN chapters c2 ON c2.subject_id=c1.subject_id
       WHERE c1.id=$1 AND c2.chapter_order=c1.chapter_order+1`,
      [topic.chapter_id]
    )).rows[0];

    if (nextChapter) {
      const firstTopic = (await pool.query('SELECT id FROM topics WHERE chapter_id=$1 ORDER BY topic_order LIMIT 1', [nextChapter.id])).rows[0];
      if (firstTopic) {
        await pool.query('UPDATE topic_progress SET unlocked=TRUE WHERE enrollment_id=$1 AND topic_id=$2', [enrollmentId, firstTopic.id]);
      }
    }
  }
};

const submitQuiz = async (req, res) => {
  const topicId = Number(req.params.topicId);
  const { sessionToken, answers, durationSec = 0 } = req.body;

  const result = await getTopicAndEnrollment(req.user.id, topicId);
  if (result.error) return fail(res, result.error, result.status);
  const { topic, enrollment, progress } = result;

  if (!progress.unlocked) return fail(res, 'Topic is locked', 403);
  if (!progress.is_read) return fail(res, 'Read content before quiz', 400);

  const session = (await pool.query(
    `SELECT * FROM quiz_sessions
     WHERE session_token=$1 AND user_id=$2 AND topic_id=$3 AND consumed=FALSE AND expires_at > NOW()`,
    [sessionToken, req.user.id, topicId]
  )).rows[0];

  if (!session) return fail(res, 'Quiz session expired or invalid. Start a new quiz.', 400);

  const questionSet = session.question_set || [];
  if (answers.length !== questionSet.length) return fail(res, `Submit exactly ${questionSet.length} answers`, 400);

  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedIndex]));
  let correct = 0;

  for (const q of questionSet) {
    if (!answerMap.has(q.id)) return fail(res, 'Answer set does not match quiz session questions', 400);
    if (answerMap.get(q.id) === q.answerIndex) correct += 1;
  }

  const totalQuestions = questionSet.length;
  const accuracy = Number(((correct / totalQuestions) * 100).toFixed(2));
  const passed = accuracy >= topic.quiz_pass_score;

  const streak = await updateStreak(req.user.id);

  let xp = { xp: 0, speedBonus: 0, perfectBonus: 0, streakBonus: 0 };
  if (passed) {
    xp = calculateTopicXP({
      baseXP: topic.quiz_xp_base,
      accuracy,
      durationSec,
      currentStreak: streak.current,
    });

    await grantXP({
      userId: req.user.id,
      sourceType: 'topic_quiz',
      sourceId: topic.id,
      xp: xp.xp,
      details: `Topic cleared: ${topic.title}`,
    });

    await pool.query('UPDATE topic_progress SET completed=TRUE WHERE id=$1', [progress.id]);
    await unlockProgression(enrollment.id, topic);
  }

  await pool.query('UPDATE quiz_sessions SET consumed=TRUE WHERE id=$1', [session.id]);

  await pool.query(
    `UPDATE enrollments
     SET attempted_questions=attempted_questions+$2,
         correct_questions=correct_questions+$3,
         accuracy=ROUND(((correct_questions+$3)::numeric / GREATEST(1,attempted_questions+$2)) * 100, 2)
     WHERE id=$1`,
    [enrollment.id, totalQuestions, correct]
  );

  await pool.query(
    `INSERT INTO quiz_attempts (user_id, topic_id, answers, correct_count, total_questions, accuracy, passed, xp_awarded, speed_bonus, streak_bonus, perfect_bonus, duration_sec)
     VALUES ($1,$2,$3::jsonb,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [req.user.id, topic.id, JSON.stringify(answers), correct, totalQuestions, accuracy, passed, xp.xp, xp.speedBonus, xp.streakBonus, xp.perfectBonus, durationSec]
  );

  const user = (await pool.query(
    'SELECT total_xp, level, streak_current, streak_longest, streak_last_active FROM users WHERE id=$1',
    [req.user.id]
  )).rows[0];

  return ok(res, {
    passed,
    accuracy,
    correct,
    totalQuestions,
    passScore: topic.quiz_pass_score,
    xpAwarded: xp.xp,
    bonuses: {
      speedBonus: xp.speedBonus,
      streakBonus: xp.streakBonus,
      perfectBonus: xp.perfectBonus,
    },
    totalXP: user.total_xp,
    level: user.level,
    streak: {
      current: user.streak_current,
      longest: user.streak_longest,
      lastActiveDate: user.streak_last_active,
    },
  }, passed ? 'Topic cleared and next level unlocked' : 'Failed. Retry to continue progression');
};

const submitChapterChallenge = async (req, res) => {
  const chapterId = Number(req.params.chapterId);
  const { answers, durationSec = 0 } = req.body;

  const chapter = (await pool.query('SELECT * FROM chapters WHERE id=$1', [chapterId])).rows[0];
  if (!chapter) return fail(res, 'Chapter not found', 404);

  const enrollment = await getEnrollment(req.user.id, chapter.subject_id);
  if (!enrollment) return fail(res, 'Enroll in subject first', 400);

  const topicCheck = (await pool.query(
    `SELECT COUNT(*)::int AS total,
            COALESCE(SUM(CASE WHEN tp.completed THEN 1 ELSE 0 END),0)::int AS done
     FROM topics t JOIN topic_progress tp ON tp.topic_id=t.id
     WHERE t.chapter_id=$1 AND tp.enrollment_id=$2`,
    [chapterId, enrollment.id]
  )).rows[0];

  if (topicCheck.total !== topicCheck.done) return fail(res, 'Complete all topics to unlock chapter challenge', 403);

  const questions = chapter.challenge_questions;
  if (answers.length !== questions.length) return fail(res, `Submit exactly ${questions.length} answers`, 400);

  let correct = 0;
  questions.forEach((q, i) => { if (answers[i] === q.answerIndex) correct += 1; });

  const accuracy = Number(((correct / questions.length) * 100).toFixed(2));
  const passed = accuracy >= chapter.challenge_pass_score;

  const cp = (await pool.query('SELECT challenge_cleared FROM chapter_progress WHERE enrollment_id=$1 AND chapter_id=$2', [enrollment.id, chapterId])).rows[0];

  let xpAwarded = 0;
  if (passed && !cp.challenge_cleared) {
    xpAwarded = chapter.challenge_xp_reward;
    await grantXP({
      userId: req.user.id,
      sourceType: 'chapter_challenge',
      sourceId: chapterId,
      xp: xpAwarded,
      details: `Chapter challenge cleared: ${chapter.title}`,
    });
    await pool.query('UPDATE chapter_progress SET challenge_cleared=TRUE WHERE enrollment_id=$1 AND chapter_id=$2', [enrollment.id, chapterId]);
  }

  await pool.query(
    `INSERT INTO quiz_attempts (user_id, chapter_id, answers, correct_count, total_questions, accuracy, passed, xp_awarded, duration_sec)
     VALUES ($1,$2,$3::jsonb,$4,$5,$6,$7,$8,$9)`,
    [req.user.id, chapterId, JSON.stringify(answers), correct, questions.length, accuracy, passed, xpAwarded, durationSec]
  );

  const user = (await pool.query('SELECT total_xp, level FROM users WHERE id=$1', [req.user.id])).rows[0];
  return ok(res, { passed, accuracy, xpAwarded, totalXP: user.total_xp, level: user.level }, passed ? 'Chapter challenge cleared' : 'Challenge failed, retry available');
};

module.exports = {
  submitQuizValidators,
  chapterChallengeValidators,
  getTopic,
  markRead,
  startQuiz,
  submitQuiz,
  submitChapterChallenge,
};
