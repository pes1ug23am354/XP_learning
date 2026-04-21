const { failure } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error(err);
  return failure(res, err.message || 'Internal server error', err.statusCode || 500);
};

module.exports = errorHandler;
