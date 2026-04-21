const { validationResult } = require('express-validator');
const { fail } = require('../utils/response');

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return fail(res, 'Validation failed', 422, result.array());
  }
  return next();
};

module.exports = { validate };
