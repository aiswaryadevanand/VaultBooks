
// const express = require('express');
// const {
//   getIncomeVsExpense,
//   getExpenseByCategory,
//   getWalletPerformance,
//   getDistinctCategories,
//   logExportAction, 
// } = require('../controllers/reportController');

// const authMiddleware = require('../middlewares/authMiddleware');
// const { checkWalletRole } = require('../middlewares/roleMiddleware');

// const router = express.Router();

// // These routes require a walletId → ✅ apply role check
// router.get(
//   '/income-vs-expense',
//   authMiddleware,
//   checkWalletRole(['owner', 'accountant', 'viewer']),
//   getIncomeVsExpense
// );

// router.get(
//   '/expense-by-category',
//   authMiddleware,
//   checkWalletRole(['owner', 'accountant', 'viewer']),
//   getExpenseByCategory
// );

// // This route does NOT use walletId → ❌ do NOT apply checkWalletRole
// router.get(
//   '/wallet-performance',
//   authMiddleware,
//   getWalletPerformance // Role check must be handled inside this controller
// );


// router.get(
//   '/distinct-categories',
//   authMiddleware,
//   checkWalletRole(['owner', 'accountant', 'viewer']),
//   getDistinctCategories
// );
// // Add this route to log export actions
// router.post(
//   '/export',
//   authMiddleware,
//   logExportAction
// );


// module.exports = router;
// reportRoutes.js

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
