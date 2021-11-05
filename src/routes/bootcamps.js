const router = require('express').Router();
const courseRoute = require('./courses');
const reviewRoute = require('./reviews');
const Bootcamp = require('../models/Bootcamp');
const advanceResult = require('../middlewares/advanceResult')(
  Bootcamp,
  'courses',
  { path: 'reviews', select: '-_id -__v -createdAt' }
);
const { protect, authorize } = require('../middlewares/auth');
const {
  getBootcamps,
  getBootcampsInRadius,
  createBootcamp,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  uploadImageToBootcamp,
} = require('../controllers/bootcamp');

router.get('/', advanceResult, getBootcamps);
router.get('/radius/:zipcode/:distance', getBootcampsInRadius);
router.get('/:id', getBootcamp);
router.use('/:id/courses', courseRoute); // Re-route to courses
router.use('/:id/reviews', reviewRoute); // Re-route to reviews

router.use(protect, authorize('publisher', 'admin'));

router.post('/', createBootcamp);
router.put('/:id', updateBootcamp);
router.delete('/:id', deleteBootcamp);
router.put('/:id/upload', uploadImageToBootcamp);

module.exports = router;
