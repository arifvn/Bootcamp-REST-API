const router = require('express').Router();
const courseRoute = require('./courses');
const {
  getBootcamps,
  createBootcamp,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
} = require('../controllers/bootcamp');

router.get('/', getBootcamps);
router.post('/', createBootcamp);

router.get('/:id', getBootcamp);
router.put('/:id', updateBootcamp);
router.delete('/:id', deleteBootcamp);
// Re-route to courses
router.use('/:id/courses', courseRoute);

module.exports = router;
