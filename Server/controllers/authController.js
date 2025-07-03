
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {sendResetEmail} = require('../utils/mailer')
// ✅ Register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 🔎 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    // 🔐 Don't hash the password manually — pre-save hook will handle it
    const newUser = new User({
      username,
      email,
      password,
      role:'user' // role will default to 'owner' from schema
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔎 Find user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    // 🔐 Compare input password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    // 🪪 Generate token with role info
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
// latest user
exports.getLatestUser = async (req, res) => {
  try {
    const latestUser = await User.findOne().sort({ createdAt: -1 });
    res.status(200).json(latestUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch latest user', error: error.message });
  }
};

// controllers/authController.js

// ... existing code
exports.resetPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ error: "Old password is incorrect" });

    user.password = newPassword; // 🔐 Pre-save hook will hash it
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
     console.error("❌ Password reset error:", err.message);
    res.status(500).json({ error: "Password reset failed", details: err.message });
  }
};
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("📧 Forgot password request for:", email); // ✅ Add this
  const user = await User.findOne({ email });
  if (!user) 
    {
      console.log("❌ User not found for:", email); // ✅ Add this
      return res.status(400).json({ error: "User not found" });
    }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

  await sendResetEmail(user.email, token);

  res.json({ message: "Password reset link sent to your email" });
};

exports.resetPasswordViaToken = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password has been reset" });
  } catch (err) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
};
