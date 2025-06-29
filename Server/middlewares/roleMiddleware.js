
// roleMiddleware.js
const Wallet = require('../models/Wallet');

exports.checkWalletRole = (allowedRoles) => {
  return async (req, res, next) => {
    const { walletId } = req.params;
    const userId = req.user.userId;

    try {
      const wallet = await Wallet.findById(walletId);
      if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

      if (wallet.createdBy.toString() === userId) {
        req.userRole = 'owner';
        return next();
      }

      const member = wallet.members.find((m) => m.userId.toString() === userId);
      if (!member) return res.status(403).json({ error: 'Not a wallet member' });

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      req.userRole = member.role;
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};
