const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Course');

/*
 * @desc    Get all Courses
 * @route   GET /api/v1/courses
 *          GET /api/v1/bootcamps/:id/courses
 * @access  Public
 */
const getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.id) {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404)
      );
    }

    const courses = await Course.find({ bootcamp: req.params.id }).populate(
      'bootcamp',
      'name description'
    );

    return res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  }

  return res.status(200).json(req.advanceResult);
});

/*
 * @desc    Create single Course
 * @route   POST /api/v1/bootcamps/:id/courses
 * @access  Private
 */
const createCourse = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404)
    );
  }

  const userID = req.user._id.toString();

  if (bootcamp.user.toString() !== userID && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id of ${userID} is not autorized to create Course in this Bootcamp`,
        403
      )
    );
  }

  req.body.bootcamp = req.params.id;
  req.body.user = userID;
  const course = await Course.create(req.body);

  return res.status(201).json({ success: true, data: course });
});

/*
 * @desc    Get single Course
 * @route   GET /api/v1/courses/:id
 * @access  Public
 */
const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course with id of ${req.params.id} not found`, 404)
    );
  }

  return res.status(200).json({ success: true, data: course });
});

/*
 * @desc    Update single Course
 * @route   PUT /api/v1/courses/:id
 * @access  Private
 */
const updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course with id of ${req.params.id} not found`, 404)
    );
  }

  const userID = req.user._id.toString();

  if (course.user.toString() !== userID && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id of ${userID} is not autorized to update this Course`,
        403
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  course.save();

  return res.status(200).json({ success: true, data: course });
});

/*
 * @desc    Delete single Course
 * @route   DELETE /api/v1/courses/:id
 * @access  Private
 */
const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course with id of ${req.params.id} not found`, 404)
    );
  }

  const userID = req.user._id.toString();

  if (course.user.toString() !== userID && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id of ${userID} is not autorized to delete this Course`,
        403
      )
    );
  }

  await course.remove();

  return res.status(200).json({ success: true, data: {} });
});

module.exports = {
  getCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
};
