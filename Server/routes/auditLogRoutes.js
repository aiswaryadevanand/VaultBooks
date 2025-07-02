const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkWalletRole } = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, checkWalletRole(['owner', 'accountant']), getAuditLogs);

module.exports = router;
