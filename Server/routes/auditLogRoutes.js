const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getAuditLogs);

module.exports = router;
