const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkWalletRole } = require('../middlewares/roleMiddleware');

// ✅ Fetch audit logs – only for owner and accountant
router.get('/', authMiddleware, checkWalletRole(['owner', 'accountant']), getAuditLogs);

module.exports = router;
