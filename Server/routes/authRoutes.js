
const express = require('express');
const router = express.Router();
const { register, login, getLatestUser,resetPassword,forgotPassword,resetPasswordViaToken } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const {checkWalletRole} = require('../middlewares/roleMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, (req, res) => {
  res.json({ message: 'Authenticated', user: req.user });
});

router.get('/latest-user', authMiddleware, getLatestUser);

// Owner-only route
router.get('/owner-section', authMiddleware, checkWalletRole(['owner']), (req, res) => {
  res.json({ message: 'Owner access confirmed' });
});

router.post('/reset-password', authMiddleware, resetPassword);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPasswordViaToken);


module.exports = router;
