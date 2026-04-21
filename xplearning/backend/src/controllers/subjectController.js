const { ok, fail } = require('../utils/response');
const { pool, getEnrollment, ensureEnrollment } = require('../services/sqlHelpers');

const listSubjects = async (req, res) => {
  const subjects = (await pool.query('SELECT * FROM subjects WHERE is_published=TRUE ORDER BY id')).rows;
  const payload = [];

  for (const s of subjects) {
    const enrollment = await getEnrollment(req.user.id, s.id);
    let completedTopics = 0;
    let completedChapters = 0;
    if (enrollment) {
      completedTopics = Number((await pool.query('SELECT COUNT(*)::int AS c FROM topic_progress WHERE enrollment_id=$1 AND completed=TRUE', [enrollment.id])).rows[0].c);
      completedChapters = Number((await pool.query('SELECT COUNT(*)::int AS c FROM chapter_progress WHERE enrollment_id=$1 AND completed=TRUE', [enrollment.id])).rows[0].c);
    }

    payload.push({
      id: s.id,
      title: s.title,
      board: s.board,
      classLevel: s.class_level,
      description: s.description,
      coverGradient: s.cover_gradient,
      chapterCount: Number((await pool.query('SELECT COUNT(*)::int AS c FROM chapters WHERE subject_id=$1', [s.id])).rows[0].c),
      enrolled: Boolean(enrollment),
      completedTopics,
      completedChapters,
    });
  }

  return ok(res, payload);
};

const enrollSubject = async (req, res) => {
  const { subjectId } = req.params;
  const subject = (await pool.query('SELECT id FROM subjects WHERE id=$1', [subjectId])).rows[0];
  if (!subject) return fail(res, 'Subject not found', 404);
  const enrollment = await ensureEnrollment(req.user.id, subjectId);
  return ok(res, enrollment, 'Enrolled successfully');
};

const getMap = async (req, res) => {
  const { subjectId } = req.params;
  const subject = (await pool.query('SELECT * FROM subjects WHERE id=$1', [subjectId])).rows[0];
  if (!subject) return fail(res, 'Subject not found', 404);

  const enrollment = await getEnrollment(req.user.id, subjectId);
  if (!enrollment) return fail(res, 'Enroll first', 400);

  const chapters = (await pool.query('SELECT * FROM chapters WHERE subject_id=$1 ORDER BY chapter_order', [subjectId])).rows;
  const data = [];

  for (const ch of chapters) {
    const topics = (await pool.query(
      `SELECT t.id, t.title, t.topic_order, t.estimated_minutes, tp.unlocked, tp.is_read, tp.completed
       FROM topics t JOIN topic_progress tp ON t.id=tp.topic_id
       WHERE t.chapter_id=$1 AND tp.enrollment_id=$2 ORDER BY t.topic_order`,
      [ch.id, enrollment.id]
    )).rows;

    const cp = (await pool.query('SELECT completed, challenge_cleared FROM chapter_progress WHERE enrollment_id=$1 AND chapter_id=$2', [enrollment.id, ch.id])).rows[0];

    data.push({
      id: ch.id,
      title: ch.title,
      order: ch.chapter_order,
      summary: ch.summary,
      chapterChallengeUnlocked: topics.every((t) => t.completed),
      chapterChallengeCleared: cp?.challenge_cleared || false,
      topics: topics.map((t) => ({
        id: t.id,
        title: t.title,
        order: t.topic_order,
        estimatedMinutes: t.estimated_minutes,
        unlocked: t.unlocked,
        read: t.is_read,
        completed: t.completed,
      })),
    });
  }

  return ok(res, {
    subject: {
      id: subject.id,
      title: subject.title,
      description: subject.description,
      board: subject.board,
      classLevel: subject.class_level,
      coverGradient: subject.cover_gradient,
    },
    chapters: data,
  });
};

module.exports = { listSubjects, enrollSubject, getMap };
