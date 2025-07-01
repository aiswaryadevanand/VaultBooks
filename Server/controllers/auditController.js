const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const { userId, walletId, action, startDate, endDate } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (walletId) filter.walletId = walletId;
    if (action) filter.action = action;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .populate('userId', 'username email')
      .populate('walletId', 'name')
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch audit logs', error: err.message });
  }
};
