const crypto = require('crypto');
const bcrypt = require('bcrypt');
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const sendJwtToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  return res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({ success: true, data: token });
};

const sendConfirmToken = async (email, user, req, res) => {
  const confirmEmailToken = user.getConfirmEmailToken();
  await user.save();

  const url = `${req.protocol}://${req.headers.host}/api/v1/auth/confirmemail/${confirmEmailToken}`;
  const options = {
    to: email,
    subject: 'DevCamper Confirm Email',
    text: `Confirm your email account to start using DevCamper account. ${url}`,
  };

  if (process.env.NODE_ENV === 'production') {
    await sendEmail(options);
  }

  const responses = {
    success: true,
    data: `Check your email account to complete your regisration.`,
  };

  if (process.env.NODE_ENV === 'development') {
    responses.url = url;
  }

  return res.status(200).json(responses);
};

/*
 * @desc    Register new User
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  sendConfirmToken(email, user, req, res);
});

/*
 * @desc    Register new User
 * @route   GET /api/v1/auth/confirmemail/:confirmEmailToken
 * @access  Public
 */
const confirmEmail = asyncHandler(async (req, res, next) => {
  const { confirmEmailToken } = req.params;

  if (!confirmEmailToken) {
    return next(new ErrorResponse(`Invalid Token`, 400));
  }

  const confirmEmailTokenDB = crypto
    .createHash('sha256')
    .update(confirmEmailToken.split('.')[0])
    .digest()
    .toString('hex');

  const user = await User.findOne({
    confirmEmailToken: confirmEmailTokenDB,
    isEmailConfirmed: false,
  });

  if (!user) {
    return next(new ErrorResponse(`Invalid Token`, 400));
  }

  user.isEmailConfirmed = true;
  user.confirmEmailToken = undefined;
  await user.save({ validateBeforeSave: false });

  return sendJwtToken(user, 200, res);
});

/*
 * @desc    Signin User
 * @route   POST /api/v1/auth/signin
 * @access  Public
 */
const signin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse(`Invalid credentials`, 400));
  }

  if (!user.isEmailConfirmed) {
    return next(
      new ErrorResponse(
        `Please confirm your registration. Check your Inbox`,
        400
      )
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorResponse(`Invalid credentials`, 400));
  }

  return sendJwtToken(user, 200, res);
});

/*
 * @desc    Resend confirmation email
 * @route   POST /api/v1/auth/resendConfirm
 * @access  Public
 */
const resendConfirm = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse(`Email ${email} is not registered`, 400));
  }

  if (!user.isEmailConfirmed) {
    return sendConfirmToken(email, user, req, res);
  }

  return res.status(200).json({
    success: true,
    data: 'Email has been verified. You can now login',
  });
});

/*
 * @desc    Send email reset password
 * @route   POST /api/v1/auth/forgotpassword
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse(`Email ${email} is not registered`, 400));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save();

  const url = `${req.protocol}://${req.headers.host}/api/v1/auth/resetpassword/${resetToken}`;
  const options = {
    to: email,
    subject: 'DevCamper Reset Password',
    text:
      `You or somebody else recently requested to reset ` +
      `the password for your DevCamper account. Click link below to proceed. ${url}`,
  };

  if (process.env.NODE_ENV === 'production') {
    await sendEmail(options);
  }

  const responses = {
    success: true,
    data: `Reset password token has been sent to ${email}`,
  };

  if (process.env.NODE_ENV === 'development') {
    responses.url = url;
  }

  return res.status(200).json(responses);
});

/*
 * @desc    Send new password
 * @route   POST /api/v1/auth/resetpassword/:resetPasswordToken
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetPasswordToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    return next(new ErrorResponse(`Token expired`, 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return sendJwtToken(user, 200, res);
});

/*
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res, _) => {
  res.status(200).json({ success: true, data: req.user });
});

/*
 * @desc    Update password User
 * @route   POST /api/v1/auth/updatepassword
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(
      new ErrorResponse(`Password and newPassword are required`, 400)
    );
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    return next(new ErrorResponse(`oldPassword is incorrect`, 400));
  }

  user.password = newPassword;
  await user.save();

  return sendJwtToken(user, 200, res);
});

/*
 * @desc    Update details users
 * @route   POST /api/v1/auth/updatedetails
 * @access  Private
 */
const updateDetails = asyncHandler(async (req, res, _) => {
  const { name, email } = req.body;
  const { user } = req;

  // send confirm email if email change
  if (email && email !== user.email) {
    user.name = name;
    user.email = email;
    user.isEmailConfirmed = false;
    return sendConfirmToken(email, user, req, res);
  }

  user.name = name;
  await user.save();

  return res.status(200).json({ success: true, data: user });
});

/*
 * @desc    Log User out
 * @route   GET /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res, _) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: false,
  };

  res
    .status(200)
    .cookie('token', 'none', cookieOptions)
    .json({ success: true, data: {} });
});

module.exports = {
  register,
  confirmEmail,
  signin,
  resendConfirm,
  forgotPassword,
  resetPassword,
  getMe,
  updatePassword,
  updateDetails,
  logout,
};
