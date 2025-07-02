
const express = require('express');
const {
  getIncomeVsExpense,
  getExpenseByCategory,
  getWalletPerformance,
  getDistinctCategories,
} = require('../controllers/reportController');

const authMiddleware = require('../middlewares/authMiddleware');
const { checkWalletRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

// These routes require a walletId → ✅ apply role check
router.get(
  '/income-vs-expense',
  authMiddleware,
  checkWalletRole(['owner', 'accountant', 'viewer']),
  getIncomeVsExpense
);

router.get(
  '/expense-by-category',
  authMiddleware,
  checkWalletRole(['owner', 'accountant', 'viewer']),
  getExpenseByCategory
);

// This route does NOT use walletId → ❌ do NOT apply checkWalletRole
router.get(
  '/wallet-performance',
  authMiddleware,
  getWalletPerformance // Role check must be handled inside this controller
);


router.get(
  '/distinct-categories',
  authMiddleware,
  checkWalletRole(['owner', 'accountant', 'viewer']),
  getDistinctCategories
);

module.exports = router;
