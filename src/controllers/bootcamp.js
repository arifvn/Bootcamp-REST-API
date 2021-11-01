const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const Bootcamp = require('../models/Bootcamp');

/*
 * @desc    Get all Bootcamp
 * @route   GET /api/v1/bootcamps
 * @access  Public
 */
const getBootcamps = asyncHandler(async (req, res, _) => {
  const bootcamps = await Bootcamp.find().populate('courses');

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

/*
 * @desc    Create single Bootcamp
 * @route   POST /api/v1/bootcamps
 * @access  Private
 */
const createBootcamp = asyncHandler(async (req, res, _) => {
  const bootcamp = await Bootcamp.create(req.body);

  return res.status(200).json({ success: true, data: bootcamp });
});

/*
 * @desc    Get single Bootcamp
 * @route   GET /api/v1/bootcamps/:id
 * @access  Public
 */
const getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404)
    );
  }

  return res.status(200).json({ success: true, data: bootcamp });
});

/*
 * @desc    Update single Bootcamp
 * @route   PUT /api/v1/bootcamps/:id
 * @access  Private
 */
const updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404)
    );
  }

  const newBootcamp = await Bootcamp.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  return res.status(200).json({ success: true, data: newBootcamp });
});

/*
 * @desc    Delete single Bootcamp
 * @route   DELETE /api/v1/bootcamps/:id
 * @access  Private
 */
const deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404)
    );
  }

  bootcamp.remove();

  return res.status(200).json({ success: true, data: {} });
});

module.exports = {
  getBootcamps,
  createBootcamp,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
};
