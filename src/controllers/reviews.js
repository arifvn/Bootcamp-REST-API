const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const Bootcamp = require('../models/Bootcamp');
const Review = require('../models/Review');

/*
 * @desc    Get all Reivew
 * @route   GET /api/v1/reviews
 *          GET /api/v1/bootcamps/:id/reviews
 * @access  Public
 */
const getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.id) {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404)
      );
    }

    const reviews = await Review.find({ bootcamp: req.params.id }).populate(
      'bootcamp',
      'name description'
    );

    return res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  }

  return res.status(200).json(req.advanceResult);
});

/*
 * @desc    Get single Review
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
const getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review with id of ${req.params.id} not found`, 404)
    );
  }

  return res.status(200).json({ success: true, data: review });
});

/*
 * @desc    Create new Review
 * @route   POST /api/v1/bootcamps/:id/reviews
 * @access  Private
 */
const createReview = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404)
    );
  }

  req.body.bootcamp = req.params.id;
  req.body.user = req.user._id.toString();
  const review = await Review.create(req.body);

  return res.status(201).json({ success: true, data: review });
});

/*
 * @desc    Update single Review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
 */
const updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review with id of ${req.params.id} not found`, 404)
    );
  }

  const userID = req.user._id.toString();

  if (review.user.toString() !== userID && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id of ${userID} is not autorized to update this Review`,
        403
      )
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await review.save();

  return res.status(200).json({ success: true, data: review });
});

/*
 * @desc    Delete single Review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review with id of ${req.params.id} not found`, 404)
    );
  }

  const userID = req.user._id.toString();

  if (review.user.toString() !== userID && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id of ${userID} is not autorized to delete this Review`,
        403
      )
    );
  }

  await review.remove();

  return res.status(200).json({ success: true, data: {} });
});

module.exports = {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
};
