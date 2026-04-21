const success = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

const failure = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  res.status(statusCode).json({ success: false, message, errors });
};

module.exports = { success, failure };
