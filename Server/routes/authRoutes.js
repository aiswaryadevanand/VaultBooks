
const express = require('express');
const router = express.Router();
const { register, login, getLatestUser } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// ✅ Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/latest-user', getLatestUser); // ✅ New route

// ✅ Protected route example (to test token auth)
router.get('/me', authMiddleware, (req, res) => {
  res.json({ message: 'Authenticated', user: req.user });
});

module.exports = router;
