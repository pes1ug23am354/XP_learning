const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { signToken } = require('../utils/jwt');
const { ok, fail } = require('../utils/response');
const { pool } = require('../services/sqlHelpers');

const registerValidators = [body('fullName').isLength({ min: 2 }), body('email').isEmail(), body('password').isLength({ min: 8 })];
const loginValidators = [body('email').isEmail(), body('password').notEmpty()];

const sanitizeUser = (u) => ({
  id: u.id,
  fullName: u.full_name,
  email: u.email,
  role: u.role,
  totalXP: u.total_xp,
  level: u.level,
  streak: {
    current: u.streak_current,
    longest: u.streak_longest,
    lastActiveDate: u.streak_last_active,
  },
});

const register = async (req, res) => {
  const { fullName, email, password } = req.body;
  const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
  if (exists.rows[0]) return fail(res, 'Email already in use', 409);

  const hash = await bcrypt.hash(password, 10);
  const created = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1,$2,$3,\'learner\') RETURNING *',
    [fullName, email.toLowerCase(), hash]
  );

  const user = created.rows[0];
  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return ok(res, { token, user: sanitizeUser(user) }, 'Registered', 201);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const found = await pool.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()]);
  const user = found.rows[0];
  if (!user) return fail(res, 'Invalid credentials', 401);

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return fail(res, 'Invalid credentials', 401);

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return ok(res, { token, user: sanitizeUser(user) }, 'Logged in');
};

const me = async (req, res) => {
  const found = await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id]);
  return ok(res, sanitizeUser(found.rows[0]));
};

module.exports = { registerValidators, loginValidators, register, login, me };
