const { body } = require('express-validator');
const { ok, fail } = require('../utils/response');
const { pool } = require('../services/sqlHelpers');

const subjectValidators = [
  body('title').notEmpty(),
  body('board').notEmpty(),
  body('classLevel').notEmpty(),
  body('description').isLength({ min: 10 }),
];

const chapterValidators = [
  body('subjectId').isInt(),
  body('title').notEmpty(),
  body('order').isInt({ min: 1 }),
  body('summary').isLength({ min: 10 }),
];

const questionValidator = {
  options: {
    custom: (q) => {
      if (!q || typeof q !== 'object') throw new Error('Question must be an object');
      if (!q.id || typeof q.id !== 'string') throw new Error('Each question needs a unique id');
      if (!q.prompt || typeof q.prompt !== 'string' || q.prompt.length < 12) throw new Error('Question prompt too short');
      if (!Array.isArray(q.options) || q.options.length !== 4) throw new Error('Each question must have exactly 4 options');
      if (new Set(q.options).size !== 4) throw new Error('Options must be unique');
      if (typeof q.answerIndex !== 'number' || q.answerIndex < 0 || q.answerIndex > 3) throw new Error('answerIndex must be 0..3');
      return true;
    },
  },
};

const topicValidators = [
  body('chapterId').isInt(),
  body('title').notEmpty(),
  body('order').isInt({ min: 1 }),
  body('content').isObject(),
  body('quiz').isObject(),
  body('quiz.questions').isArray({ min: 15 }),
  body('quiz.questions.*').custom(questionValidator.options.custom),
];

const createSubject = async (req, res) => {
  const { title, board, classLevel, description, coverGradient = 'from-orange-500 via-orange-400 to-blue-900' } = req.body;
  const created = (await pool.query(
    `INSERT INTO subjects (title, board, class_level, description, cover_gradient, is_published)
     VALUES ($1,$2,$3,$4,$5,TRUE) RETURNING *`,
    [title, board, classLevel, description, coverGradient]
  )).rows[0];
  return ok(res, created, 'Subject created', 201);
};

const createChapter = async (req, res) => {
  const { subjectId, title, order, summary } = req.body;
  const created = (await pool.query(
    `INSERT INTO chapters (subject_id, title, chapter_order, summary, challenge_questions, challenge_pass_score, challenge_xp_reward)
     VALUES ($1,$2,$3,$4,$5::jsonb,70,300) RETURNING *`,
    [subjectId, title, order, summary, JSON.stringify([])]
  )).rows[0];
  return ok(res, created, 'Chapter created', 201);
};

const createTopic = async (req, res) => {
  const { chapterId, title, order, content, quiz } = req.body;
  const created = (await pool.query(
    `INSERT INTO topics (chapter_id, title, topic_order, estimated_minutes, content, quiz_questions, quiz_pass_score, quiz_xp_base)
     VALUES ($1,$2,$3,20,$4::jsonb,$5::jsonb,$6,$7) RETURNING *`,
    [chapterId, title, order, JSON.stringify(content), JSON.stringify(quiz.questions), quiz.passScore || 60, quiz.xpBase || 120]
  )).rows[0];
  return ok(res, created, 'Topic created with question bank', 201);
};


const listUsers = async (req, res) => {
  const rows = (await pool.query(
    `SELECT u.id AS _id, u.full_name AS "fullName", u.email, u.role,
            u.total_xp AS "totalXP", u.level,
            u.streak_current AS "streakCurrent", u.streak_longest AS "streakLongest",
            COALESCE(SUM(e.attempted_questions),0)::int AS "attemptedQuestions",
            COALESCE(SUM(e.correct_questions),0)::int AS "correctQuestions",
            COALESCE(ROUND(AVG(e.accuracy),2),0)::numeric AS "avgAccuracy"
     FROM users u
     LEFT JOIN enrollments e ON e.user_id=u.id
     GROUP BY u.id
     ORDER BY u.id`
  )).rows;
  return ok(res, rows);
};

const updateUserRole = async (req, res) => {
  const found = (await pool.query('SELECT id FROM users WHERE id=$1', [req.params.userId])).rows[0];
  if (!found) return fail(res, 'User not found', 404);

  const updated = (await pool.query('UPDATE users SET role=$2, updated_at=NOW() WHERE id=$1 RETURNING id, role', [req.params.userId, req.body.role])).rows[0];
  return ok(res, updated, 'Role updated');
};

const getAdminAnalytics = async (req, res) => {
  const totalUsers = Number((await pool.query('SELECT COUNT(*)::int AS c FROM users')).rows[0].c);
  const learners = Number((await pool.query("SELECT COUNT(*)::int AS c FROM users WHERE role='learner'")).rows[0].c);
  const subjects = Number((await pool.query('SELECT COUNT(*)::int AS c FROM subjects')).rows[0].c);
  const chapters = Number((await pool.query('SELECT COUNT(*)::int AS c FROM chapters')).rows[0].c);
  const topics = Number((await pool.query('SELECT COUNT(*)::int AS c FROM topics')).rows[0].c);

  const completion = (await pool.query(
    `SELECT COALESCE(ROUND((SUM(CASE WHEN completed THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*),0)) * 100, 2),0) AS completion_rate
     FROM topic_progress`
  )).rows[0];

  const openTickets = Number((await pool.query("SELECT COUNT(*)::int AS c FROM tickets WHERE status <> 'resolved'")).rows[0].c);

  return ok(res, {
    totalUsers,
    learners,
    subjects,
    chapters,
    topics,
    topicCompletionRate: Number(completion.completion_rate),
    openTickets,
  });
};

const getContentTree = async (req, res) => {
  const subjects = (await pool.query('SELECT * FROM subjects ORDER BY id')).rows;
  const tree = [];

  for (const s of subjects) {
    const chapters = (await pool.query('SELECT * FROM chapters WHERE subject_id=$1 ORDER BY chapter_order', [s.id])).rows;
    const mappedChapters = [];

    for (const c of chapters) {
      const topics = (await pool.query(
        `SELECT id, title, topic_order,
                jsonb_array_length(quiz_questions) AS bank_size,
                quiz_pass_score, quiz_xp_base
         FROM topics WHERE chapter_id=$1 ORDER BY topic_order`,
        [c.id]
      )).rows;

      mappedChapters.push({
        id: c.id,
        title: c.title,
        order: c.chapter_order,
        summary: c.summary,
        topics,
      });
    }

    tree.push({
      id: s.id,
      title: s.title,
      board: s.board,
      classLevel: s.class_level,
      description: s.description,
      chapters: mappedChapters,
    });
  }

  return ok(res, tree);
};

module.exports = {
  subjectValidators,
  chapterValidators,
  topicValidators,
  createSubject,
  createChapter,
  createTopic,
  listUsers,
  updateUserRole,
  getAdminAnalytics,
  getContentTree,
};
