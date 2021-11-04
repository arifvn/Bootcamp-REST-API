const router = require('express').Router();
const User = require('../models/User');
const advanceResult = require('../middlewares/advanceResult')(User, {
  path: 'bootcamps',
  select: 'name description',
});
const { protect, authorize } = require('../middlewares/auth');
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/users');

router.use(protect, authorize('admin'));

router.get('/', advanceResult, getUsers);
router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
