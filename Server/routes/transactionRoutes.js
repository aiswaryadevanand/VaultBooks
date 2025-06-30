
const express = require('express');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { checkWalletRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

// /api/transactions
// Get all transactions - all roles allowed
router.route('/')
  .get(authMiddleware, checkWalletRole(['owner', 'accountant', 'viewer']), getTransactions)
  .post(authMiddleware, upload.single('file'), checkWalletRole(['owner', 'accountant']),  createTransaction);

// Only owner/accountant can update/delete
router.route('/:id')
  .put(authMiddleware, checkWalletRole(['owner', 'accountant']), upload.single('file'), updateTransaction)
  .delete(authMiddleware, checkWalletRole(['owner']), deleteTransaction);


module.exports = router;
