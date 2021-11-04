const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.replace('Bearer ', '');
  }

  // Use jwt from cookie
  /* if (req.cookies.token) {
    token = req.cookies.token;
  } */

  if (!token) {
    return next(
      new ErrorResponse(`You are not authorized to access this route`, 401)
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);

    return next();
  } catch (error) {
    return next(
      new ErrorResponse(`You are not authorized to access this route`, 401)
    );
  }
});

const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User with role of '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }

    return next();
  });

module.exports = { protect, authorize };
