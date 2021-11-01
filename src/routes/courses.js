const router = require('express').Router({ mergeParams: true });
const {
  getCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');

router.get('/', getCourses);
router.post('/', createCourse);

router.get('/:id', getCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
