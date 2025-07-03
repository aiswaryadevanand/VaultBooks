const AuditLog = require('../models/AuditLog');

// ✅ GET /api/audit-logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { userId, walletId, action, date } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (walletId) filter.walletId = walletId;
    if (action) filter.action = action;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0); // Start of the day
      const end = new Date(date);
      end.setHours(23, 59, 59, 999); // End of the day
      filter.timestamp = { $gte: start, $lte: end };
    }

    const logs = await AuditLog.find(filter)
      .populate('userId', 'username email')
      .populate('walletId', 'name')
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (err) {
    console.error('💥 Fetch Audit Logs Error:', err);
    res.status(500).json({ message: 'Failed to fetch audit logs', error: err.message });
  }
};
