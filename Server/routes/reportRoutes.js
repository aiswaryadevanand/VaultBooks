

const express = require('express');
const router = express.Router();

const {
  getIncomeVsExpense,
  getExpenseByCategory,
  getWalletPerformance,
  getDistinctCategories,
  logExportAction
} = require('../controllers/reportController');

const authMiddleware = require('../middlewares/authMiddleware');
const { checkWalletRole } = require('../middlewares/roleMiddleware');

// ✅ These routes require walletId → Role check
router.get('/income-vs-expense', authMiddleware, checkWalletRole(['owner', 'accountant', 'viewer']), getIncomeVsExpense);
router.get('/expense-by-category', authMiddleware, checkWalletRole(['owner', 'accountant', 'viewer']), getExpenseByCategory);
router.get('/distinct-categories', authMiddleware, checkWalletRole(['owner', 'accountant', 'viewer']), getDistinctCategories);

// ❌ Wallet ID not used — no role check
router.get('/wallet-performance', authMiddleware, getWalletPerformance);

// ✅ Export logging
router.post('/export', authMiddleware, logExportAction);

module.exports = router;
