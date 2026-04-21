const { verifyToken } = require('../utils/jwt');
const { fail } = require('../utils/response');

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 'Unauthorized', 401);
  }

  try {
    const token = header.split(' ')[1];
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return fail(res, 'Invalid or expired token', 401);
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return fail(res, 'Admin access required', 403);
  }
  return next();
};

const requireLearner = (req, res, next) => {
  if (req.user.role !== 'learner') {
    return fail(res, 'Learner access required', 403);
  }
  return next();
};

module.exports = { requireAuth, requireAdmin, requireLearner };
