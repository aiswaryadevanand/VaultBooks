
const express = require('express');
const router = express.Router();
const { getAuditLogs, logReportExport } = require('../controllers/auditController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkWalletRole } = require('../middlewares/roleMiddleware');

// Fetch audit logs (only for owner and accountant)
router.get('/', authMiddleware, checkWalletRole(['owner', 'accountant']), getAuditLogs);

// ✅ Log export actions (PDF / Excel) - no role check needed here, just auth
router.post('/export', authMiddleware, logReportExport);

module.exports = router;

