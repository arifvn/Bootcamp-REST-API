const router = require('express').Router({ mergeParams: true });
const Course = require('../models/Course');
const advanceResult = require('../middlewares/advanceResult')(Course, {
  path: 'bootcamp',
  select: 'name description',
});
const { protect, authorize } = require('../middlewares/auth');
const {
  getCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');

router.get('/', advanceResult, getCourses);
router.get('/:id', getCourse);

router.use(protect, authorize('publisher', 'admin'));

router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
