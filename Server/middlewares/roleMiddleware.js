// middlewares/roleMiddleware.js
const Wallet = require('../models/Wallet');

exports.checkWalletRole = (allowedRoles) => {
  return async (req, res, next) => {
    const { walletId } = req.params;
    const userId = req.user.userId;

    try {
      const wallet = await Wallet.findById(walletId);

      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      // If the logged-in user is the owner
      if (wallet.createdBy.toString() === userId) {
        req.userRole = 'owner';
        return next();
      }

      // Check if the user is in the members array
      const member = wallet.members.find(
        (m) => m.userId.toString() === userId
      );

      if (!member) {
        return res.status(403).json({ error: 'Not a wallet member' });
      }

      // Check if the member's role is in the allowedRoles
      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({ error: 'Access denied: insufficient role' });
      }

      req.userRole = member.role; // Attach role for later use
      next();
    } catch (err) {
      res.status(500).json({ error: 'Server error', message: err.message });
    }
  };
};
