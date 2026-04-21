const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { success, failure } = require('../utils/apiResponse');
const userModel = require('../models/userModel');

const signToken = (user) => jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
});

const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return failure(res, 'Email already registered.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({ fullName, email, passwordHash, role: 'user' });
    const token = signToken(user);

    return success(res, { user, token }, 'Registration successful', 201);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user || !user.is_active) {
      return failure(res, 'Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return failure(res, 'Invalid credentials', 401);
    }

    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      points_balance: user.points_balance,
    };

    const token = signToken(safeUser);
    return success(res, { user: safeUser, token }, 'Login successful');
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    return success(res, user, 'Current user profile');
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login, me };
