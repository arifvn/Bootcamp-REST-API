const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const {
  register,
  confirmEmail,
  signin,
  resendConfirm,
  forgotPassword,
  resetPassword,
  getMe,
  updatePassword,
  updateDetails,
  logout,
} = require('../controllers/auth');

router.post('/register', register);
router.get('/confirmemail/:confirmEmailToken', confirmEmail);
router.post('/signin', signin);
router.post('/resendconfirm', resendConfirm);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword/:resetPasswordToken', resetPassword);
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);
router.put('/updatedetails', protect, updateDetails);
router.get('/logout', protect, logout);

module.exports = router;
