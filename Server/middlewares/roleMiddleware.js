const Wallet = require('../models/Wallet');

exports.checkWalletRole = (allowedRoles) => {
  return async (req, res, next) => {
    console.log('🛡️ Checking role:', req.walletRole);
    const walletId =
      (req.params && req.params.walletId) ||
      (req.body && req.body.walletId) ||
      (req.query && req.query.walletId);

    const userId = req.user.userId;

    if (!walletId) {
      return res.status(400).json({ error: 'Missing walletId for role check' });
    }

    try {
      const wallet = await Wallet.findById(walletId);

      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      if (wallet.createdBy.toString() === userId) {
        req.userRole = 'owner';
        return next();
      }

      const member = wallet.members.find(
        (m) => m.userId.toString() === userId
      );

      if (!member) {
        return res.status(403).json({ error: 'Not a wallet member' });
      }

      if (!allowedRoles.includes(member.role)) {
        console.log('❌ Role not allowed for this action');
        return res.status(403).json({ error: 'Access denied: insufficient role' });
      }

      req.userRole = member.role;
      next();
    } catch (err) {
      res.status(500).json({ error: 'Server error', message: err.message });
    }
  };
};
