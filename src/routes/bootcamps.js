const router = require('express').Router();
const courseRoute = require('./courses');
const Bootcamp = require('../models/Bootcamp');
const advanceResult = require('../middlewares/advanceResult')(
  Bootcamp,
  'courses'
);
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
router.post('/', createBootcamp);

router.get('/:id', getBootcamp);
router.put('/:id', updateBootcamp);
router.delete('/:id', deleteBootcamp);
router.delete('/:id/upload', uploadImageToBootcamp);
// Re-route to courses
router.use('/:id/courses', courseRoute);

module.exports = router;
