const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

/*
 * @desc    Get all registered User
 * @route   GET /api/v1/auth/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res, _) => {
  res.status(200).json(req.advanceResult);
});

/*
 * @desc    Create new User
 * @route   POST /api/v1/auth/users
 * @access  Private/Admin
 */
const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  return res.status(201).json({ success: true, data: user });
});

/*
 * @desc    Get single User by ID
 * @route   GET /api/v1/auth/users/:id
 * @access  Private/Admin
 */
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User with id of ${req.params.id} is not found`, 404)
    );
  }

  return res.status(200).json({ success: true, data: user });
});

/*
 * @desc    Update single User by ID
 * @route   PUT /api/v1/auth/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res, next) => {
  const { name, role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User with id of ${req.params.id} is not found`, 404)
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { name, role },
    { new: true, runValidators: true }
  );

  return res.status(200).json({ success: true, data: updatedUser });
});

/*
 * @desc    Delete single User by ID
 * @route   DELETE /api/v1/auth/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User with id of ${req.params.id} is not found`, 404)
    );
  }

  await user.remove();

  return res.status(200).json({ success: true, data: {} });
});

module.exports = {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
};
