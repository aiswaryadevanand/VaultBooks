
const express = require('express');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

// const { protect } = require('../middlewares/authMiddleware'); // Dev 1 responsibility
const upload = require('../middlewares/uploadMiddleware'); // ✅ required for file upload

const router = express.Router();

// /api/transactions
router.route('/')
  // .get(protect, getTransactions)
  // .post(protect, upload.single('file'), createTransaction);
  .get(getTransactions)
  .post(upload.single('file'), createTransaction); // ✅ Add upload middleware

// /api/transactions/:id
router.route('/:id')
  // .put(protect, updateTransaction)
  // .delete(protect, deleteTransaction);
  .put(upload.single('file'), updateTransaction) // ✅ also handle file upload on update
  .delete(deleteTransaction);

module.exports = router;
