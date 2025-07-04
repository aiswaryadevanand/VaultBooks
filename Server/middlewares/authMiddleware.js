const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log(" authMiddleware hit");
  const authHeader = req.headers.authorization;

  // Check if token exists and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(" No Authorization header");
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(" Token decoded:", decoded);
    req.user = decoded; // attach user data to request
     req.walletRole = 'owner';

    next(); // move to next middleware or controller
  } catch (err) {
    console.error(" Invalid token:", err.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = authMiddleware;
