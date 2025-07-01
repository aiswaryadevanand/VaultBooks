
const AuditLog = require('../models/AuditLog');

const logAudit = async ({ userId, walletId, action, details }) => {
  try {
    await AuditLog.create({ userId, walletId, action, details });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

module.exports = logAudit;
