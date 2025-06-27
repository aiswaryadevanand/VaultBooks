
const express = require('express');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// /api/transactions
router.route('/')
  .get(authMiddleware, getTransactions)
  .post(authMiddleware, upload.single('file'), createTransaction);

// /api/transactions/:id
router.route('/:id')
  .put(authMiddleware, upload.single('file'), updateTransaction)
  .delete(authMiddleware, deleteTransaction);

module.exports = router;
