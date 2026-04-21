const { pool } = require('../config/db');

const computeLevel = (xp) => Math.floor(xp / 500) + 1;

const calculateTopicXP = ({ baseXP, accuracy, durationSec, currentStreak }) => {
  let xp = Math.round(baseXP * (accuracy / 100));
  const speedBonus = durationSec > 0 && durationSec <= 180 ? 20 : durationSec <= 300 ? 10 : 0;
  const perfectBonus = accuracy === 100 ? 35 : 0;
  const streakBonus = currentStreak >= 3 ? 15 : 0;
  xp += speedBonus + perfectBonus + streakBonus;
  return { xp: Math.max(0, xp), speedBonus, perfectBonus, streakBonus };
};

const getEnrollment = async (userId, subjectId) => {
  const res = await pool.query('SELECT * FROM enrollments WHERE user_id=$1 AND subject_id=$2', [userId, subjectId]);
  return res.rows[0] || null;
};

const ensureEnrollment = async (userId, subjectId) => {
  let enrollment = await getEnrollment(userId, subjectId);
  if (enrollment) return enrollment;

  const created = await pool.query('INSERT INTO enrollments (user_id, subject_id) VALUES ($1,$2) RETURNING *', [userId, subjectId]);
  enrollment = created.rows[0];

  const chapters = (await pool.query('SELECT id FROM chapters WHERE subject_id=$1 ORDER BY chapter_order', [subjectId])).rows;
  for (const ch of chapters) {
    await pool.query('INSERT INTO chapter_progress (enrollment_id, chapter_id, completed, challenge_cleared) VALUES ($1,$2,FALSE,FALSE)', [enrollment.id, ch.id]);
  }

  const topics = (await pool.query(`SELECT t.id,c.chapter_order,t.topic_order FROM topics t JOIN chapters c ON t.chapter_id=c.id WHERE c.subject_id=$1 ORDER BY c.chapter_order,t.topic_order`, [subjectId])).rows;
  for (const t of topics) {
    const unlocked = t.chapter_order === 1 && t.topic_order === 1;
    await pool.query('INSERT INTO topic_progress (enrollment_id, topic_id, unlocked, is_read, completed) VALUES ($1,$2,$3,FALSE,FALSE)', [enrollment.id, t.id, unlocked]);
  }

  return enrollment;
};

const updateStreak = async (userId) => {
  const user = (await pool.query('SELECT streak_current, streak_longest, streak_last_active FROM users WHERE id=$1', [userId])).rows[0];
  const today = new Date();
  const td = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let current = user.streak_current || 0;
  let longest = user.streak_longest || 0;

  if (!user.streak_last_active) {
    current = 1;
    longest = Math.max(longest, current);
  } else {
    const ld = new Date(user.streak_last_active);
    const last = new Date(ld.getFullYear(), ld.getMonth(), ld.getDate());
    const diff = Math.round((td - last) / (1000 * 60 * 60 * 24));
    if (diff === 1) current += 1;
    else if (diff > 1) current = 1;
    longest = Math.max(longest, current);
  }

  await pool.query('UPDATE users SET streak_current=$2, streak_longest=$3, streak_last_active=$4, updated_at=NOW() WHERE id=$1', [userId, current, longest, td]);
  return { current, longest };
};

const grantXP = async ({ userId, sourceType, sourceId, xp, details }) => {
  const current = (await pool.query('SELECT total_xp FROM users WHERE id=$1', [userId])).rows[0];
  const totalXP = current.total_xp + xp;
  const level = computeLevel(totalXP);
  await pool.query('UPDATE users SET total_xp=$2, level=$3, updated_at=NOW() WHERE id=$1', [userId, totalXP, level]);
  await pool.query('INSERT INTO xp_logs (user_id, source_type, source_id, xp, details) VALUES ($1,$2,$3,$4,$5)', [userId, sourceType, sourceId || null, xp, details || '']);
  return { totalXP, level };
};

module.exports = { pool, computeLevel, calculateTopicXP, getEnrollment, ensureEnrollment, updateStreak, grantXP };
