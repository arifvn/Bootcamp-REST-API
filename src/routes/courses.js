const router = require('express').Router({ mergeParams: true });
const Course = require('../models/Course');
const advanceResult = require('../middlewares/advanceResult')(Course, {
  path: 'bootcamp',
  select: 'name description',
});
const {
  getCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');

router.get('/', advanceResult, getCourses);
router.post('/', createCourse);

router.get('/:id', getCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
