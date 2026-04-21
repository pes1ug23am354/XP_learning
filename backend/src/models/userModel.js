const db = require('../config/db');

const createUser = async ({ fullName, email, passwordHash, role = 'user' }) => {
  const query = `
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, full_name, email, role, points_balance, created_at
  `;
  const values = [fullName, email.toLowerCase(), passwordHash, role];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const findByEmail = async (email) => {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return rows[0];
};

const findById = async (id) => {
  const query = 'SELECT id, full_name, email, role, points_balance, is_active, created_at FROM users WHERE id = $1';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const listUsers = async () => {
  const { rows } = await db.query('SELECT id, full_name, email, role, points_balance, is_active, created_at FROM users ORDER BY id');
  return rows;
};

const updateUserRole = async (id, role, isActive) => {
  const query = `
    UPDATE users
    SET role = $2, is_active = $3, updated_at = NOW()
    WHERE id = $1
    RETURNING id, full_name, email, role, points_balance, is_active
  `;
  const { rows } = await db.query(query, [id, role, isActive]);
  return rows[0];
};

const addPoints = async (id, points) => {
  const query = `
    UPDATE users
    SET points_balance = points_balance + $2,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, points_balance
  `;
  const { rows } = await db.query(query, [id, points]);
  return rows[0];
};

const deductPoints = async (id, points) => {
  const query = `
    UPDATE users
    SET points_balance = points_balance - $2,
        updated_at = NOW()
    WHERE id = $1 AND points_balance >= $2
    RETURNING id, points_balance
  `;
  const { rows } = await db.query(query, [id, points]);
  return rows[0];
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  listUsers,
  updateUserRole,
  addPoints,
  deductPoints,
};
