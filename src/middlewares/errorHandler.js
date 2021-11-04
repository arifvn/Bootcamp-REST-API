const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Cast Error
  if (
    err.name === 'CastError' &&
    err.message.toString().startsWith('Cast to ObjectId failed')
  ) {
    error = new ErrorResponse(`Resource not found`, 400);
  }

  if (
    err.name === 'CastError' &&
    err.message.toString().startsWith('Cast to Number failed')
  ) {
    error = new ErrorResponse(`Field must be type of Number`, 400);
  }

  // Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(item => item.message);
    error = new ErrorResponse(message, 400);
  }

  // Duplicate Key Error
  if (err.code === 11000) {
    error = new ErrorResponse(
      `Property ${Object.keys(err.keyValue)} ${Object.values(
        err.keyValue
      )} is already exist`,
      400
    );
  }

  return res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || 'Server Error' });
};

module.exports = errorHandler;
