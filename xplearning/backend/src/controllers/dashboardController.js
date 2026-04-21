const { ok } = require('../utils/response');
const { pool } = require('../services/sqlHelpers');

const getDashboard = async (req, res) => {
  const user = (await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id])).rows[0];

  const enrolled = (await pool.query(
    `SELECT e.id, e.subject_id, e.attempted_questions, e.correct_questions, e.accuracy, s.title, s.board, s.class_level,
            (SELECT COUNT(*)::int FROM topic_progress tp WHERE tp.enrollment_id=e.id AND tp.completed=TRUE) AS completed_topics,
            (SELECT COUNT(*)::int FROM chapter_progress cp WHERE cp.enrollment_id=e.id AND cp.completed=TRUE) AS completed_chapters,
            (SELECT COUNT(*)::int FROM topic_progress tp WHERE tp.enrollment_id=e.id AND tp.unlocked=TRUE) AS unlocked_topics
     FROM enrollments e JOIN subjects s ON e.subject_id=s.id WHERE e.user_id=$1`,
    [req.user.id]
  )).rows;

  const recentXP = (await pool.query('SELECT * FROM xp_logs WHERE user_id=$1 ORDER BY created_at DESC LIMIT 8', [req.user.id])).rows;

  const recentAttempts = (await pool.query(
    `SELECT qa.*, t.title AS topic_title
     FROM quiz_attempts qa LEFT JOIN topics t ON qa.topic_id=t.id
     WHERE qa.user_id=$1 AND qa.topic_id IS NOT NULL ORDER BY qa.created_at DESC LIMIT 8`,
    [req.user.id]
  )).rows;

  const weakAreas = [];
  for (const e of enrolled) {
    if (Number(e.accuracy) < 70) {
      const firstUnlocked = (await pool.query(
        `SELECT t.title FROM topic_progress tp JOIN topics t ON tp.topic_id=t.id
         WHERE tp.enrollment_id=$1 AND tp.unlocked=TRUE ORDER BY t.id LIMIT 1`,
        [e.id]
      )).rows[0];
      if (firstUnlocked) weakAreas.push({ subjectId: e.subject_id, suggestion: `Revisit ${firstUnlocked.title}` });
    }
  }

  let resumeTopic = null;
  if (user.last_topic_id) {
    const t = (await pool.query('SELECT id AS _id, title, topic_order AS "order" FROM topics WHERE id=$1', [user.last_topic_id])).rows[0];
    resumeTopic = t || null;
  }

  return ok(res, {
    profile: {
      fullName: user.full_name,
      email: user.email,
      totalXP: user.total_xp,
      level: user.level,
      streak: {
        current: user.streak_current,
        longest: user.streak_longest,
        lastActiveDate: user.streak_last_active,
      },
      resumeTopic,
    },
    enrolled: enrolled.map((e) => ({
      subjectId: e.subject_id,
      title: e.title,
      board: e.board,
      classLevel: e.class_level,
      completedTopics: e.completed_topics,
      completedChapters: e.completed_chapters,
      accuracy: Number(e.accuracy),
      attemptedQuestions: e.attempted_questions,
      unlockedTopics: e.unlocked_topics,
    })),
    recentXP,
    recentAttempts: recentAttempts.map((a) => ({
      _id: a.id,
      accuracy: Number(a.accuracy),
      passed: a.passed,
      topic: a.topic_id ? { title: a.topic_title } : null,
    })),
    performanceInsights: {
      strong: enrolled.filter((x) => Number(x.accuracy) >= 80).map((x) => x.title),
      weakAreas,
    },
  });
};

module.exports = { getDashboard };
