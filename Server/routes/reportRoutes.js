const express = require('express');
const { getIncomeVsExpense } = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkWalletRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

// /api/reports/income-vs-expense?walletId=...
router.get('/income-vs-expense',
  authMiddleware,
  checkWalletRole(['owner', 'accountant', 'viewer']),
  getIncomeVsExpense
);

module.exports = router;
