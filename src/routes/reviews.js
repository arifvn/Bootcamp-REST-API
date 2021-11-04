const router = require('express').Router({ mergeParams: true });
const Review = require('../models/Review');
const advanceResult = require('../middlewares/advanceResult')(Review, {
  path: 'bootcamp',
  select: 'name description',
});
const { protect, authorize } = require('../middlewares/auth');
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');

router.get('/', advanceResult, getReviews);
router.get('/:id', getReview);

router.use(protect, authorize('user', 'admin'));

router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
