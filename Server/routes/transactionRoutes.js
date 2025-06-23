const express = require('express');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

// const { protect } = require('../middleware/authMiddleware'); // Dev 1 responsibility

const router = express.Router();

// /api/transactions
router.route('/')
//   .get(protect, getTransactions)
//   .post(protect, createTransaction);
  .get( getTransactions)
  .post( createTransaction);

// /api/transactions/:id
router.route('/:id')
//   .put(protect, updateTransaction)
//   .delete(protect, deleteTransaction);
.put( updateTransaction)
  .delete( deleteTransaction);

  
module.exports = router;
