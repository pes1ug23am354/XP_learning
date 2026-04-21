const { ok } = require('../utils/response');
const { pool } = require('../services/sqlHelpers');

const getLeaderboard = async (req, res) => {
  const rows = (await pool.query(
    `SELECT id, full_name, total_xp, level, streak_current
     FROM users WHERE role='learner' ORDER BY total_xp DESC LIMIT 50`
  )).rows;

  const payload = rows.map((r, idx) => ({
    rank: idx + 1,
    id: r.id,
    fullName: r.full_name,
    totalXP: r.total_xp,
    level: r.level,
    streak: r.streak_current,
  }));

  return ok(res, payload);
};

module.exports = { getLeaderboard };
