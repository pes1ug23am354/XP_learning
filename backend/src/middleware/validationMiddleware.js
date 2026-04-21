const { validationResult } = require('express-validator');
const { failure } = require('../utils/apiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return failure(res, 'Validation failed', 422, errors.array());
  }

  return next();
};

module.exports = { validate };
