const db = require('../config/db');

const getActiveRule = async () => {
  const { rows } = await db.query('SELECT * FROM reward_rules WHERE is_active = TRUE ORDER BY id DESC LIMIT 1');
  return rows[0];
};

const updateRule = async ({ pointsPerPass, bonusForPerfectScore, streakBonusThreshold, streakBonusPoints, updatedBy }) => {
  const query = `
    INSERT INTO reward_rules
    (rule_name, points_per_pass, bonus_for_perfect_score, streak_bonus_threshold, streak_bonus_points, is_active, updated_by)
    VALUES ('Updated Rule', $1, $2, $3, $4, TRUE, $5)
    RETURNING *
  `;
  const values = [pointsPerPass, bonusForPerfectScore, streakBonusThreshold, streakBonusPoints, updatedBy];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const listCatalog = async () => {
  const { rows } = await db.query('SELECT * FROM rewards_catalog WHERE is_active = TRUE ORDER BY id');
  return rows;
};

const getCatalogItemById = async (id) => {
  const { rows } = await db.query('SELECT * FROM rewards_catalog WHERE id = $1', [id]);
  return rows[0];
};

const redeemReward = async ({ userId, rewardId, pointsSpent }) => {
  const query = `
    INSERT INTO reward_redemptions (user_id, reward_id, points_spent, status)
    VALUES ($1, $2, $3, 'approved')
    RETURNING *
  `;
  const { rows } = await db.query(query, [userId, rewardId, pointsSpent]);
  return rows[0];
};

const reduceCatalogStock = async (id) => {
  const query = `
    UPDATE rewards_catalog
    SET stock = stock - 1
    WHERE id = $1 AND stock > 0
    RETURNING *
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const listUserRedemptions = async (userId) => {
  const query = `
    SELECT rr.id, rc.title AS reward_title, rr.points_spent, rr.status, rr.redeemed_at
    FROM reward_redemptions rr
    JOIN rewards_catalog rc ON rr.reward_id = rc.id
    WHERE rr.user_id = $1
    ORDER BY rr.redeemed_at DESC
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
};

module.exports = {
  getActiveRule,
  updateRule,
  listCatalog,
  getCatalogItemById,
  redeemReward,
  reduceCatalogStock,
  listUserRedemptions,
};
