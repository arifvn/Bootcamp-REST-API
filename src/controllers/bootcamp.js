const path = require('path');
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const Bootcamp = require('../models/Bootcamp');
const getLocation = require('../utils/getLocation');

/*
 * @desc    Get all Bootcamp
 * @route   GET /api/v1/bootcamps
 * @access  Public
 */
const getBootcamps = asyncHandler(async (req, res, _) => {
  res.status(200).json(req.advanceResult);
});

/*
 * @desc    Get Bootcamps within specific radius
 * @route   DELETE /api/v1/bootcamps/radius/:zipcode/:distance
 * @access  Public
 */
const getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  const location = await getLocation(zipcode);
  const lat = location.latitude;
  const lng = location.longitude;
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  return res
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
  const bootcamp = await Bootcamp.findById(req.params.id).populate(
    'courses',
    'title tuition'
  );

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

/*
 * @desc    Upload Image to Bootcamp
 * @route   UPDATE /api/v1/bootcamps/:id/upload
 * @access  Private
 */
const uploadImageToBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please add an Image`, 400));
  }

  if (!req.files.files.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please add an valid Image file`, 400));
  }

  if (req.files.files.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Image can not be more than ${process.env.MAX_FILE_UPLOAD} bytes`,
        400
      )
    );
  }

  const filename = `photo_${req.params.id}${path.extname(
    req.files.files.name
  )}`;

  await req.files.files.mv(`${process.env.FILE_UPLOAD_PATH}/${filename}`);

  const updatedBootcamp = await Bootcamp.findByIdAndUpdate(
    req.params.id,
    { photo: filename },
    { new: true, runValidators: true }
  );

  return res.status(200).json({ success: true, data: updatedBootcamp });
});

module.exports = {
  getBootcamps,
  getBootcampsInRadius,
  createBootcamp,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  uploadImageToBootcamp,
};
