const express= require('express');
const router= express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { checkWalletRole } = require('../middlewares/roleMiddleware');
const {
    createBudget,
    getBudgets,
    updateBudget,
    deleteBudget
} = require('../controllers/budgetController');

router.use(authMiddleware);   

// ✅ Create budget - owner or accountant
router.post(
  '/',
  checkWalletRole(['owner', 'accountant']),
  createBudget
);

// ✅ Get budgets - any role
router.get(
  '/:walletId',
  checkWalletRole(['owner', 'accountant', 'viewer']),
  getBudgets
);

// ✅ Update budget - owner or accountant (walletId in body)
router.put(
  '/:id',
  checkWalletRole(['owner', 'accountant']),
  updateBudget
);

// ✅ Delete budget - owner only (walletId in body)
router.delete(
  '/:id',
  checkWalletRole(['owner']),
  deleteBudget
);

module.exports = router;
