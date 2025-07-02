
const express = require('express');
const router = express.Router();
const { register, login, getLatestUser,resetPassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const {checkWalletRole} = require('../middlewares/roleMiddleware'); // ✅ Correct import

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

module.exports = router;
