const { fail } = require('../utils/response');

const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  return fail(res, err.message || 'Internal server error', err.statusCode || 500);
};

module.exports = errorMiddleware;
