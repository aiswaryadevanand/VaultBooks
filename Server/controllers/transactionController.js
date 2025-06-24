// const Transaction = require('../models/Transaction');

// // @desc Get all transactions for logged-in user
// const getTransactions = async (req, res) => {
//   try {
//     const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
//     res.json(transactions);
//   } catch (error) {
//     res.status(500).json({ error: 'Server Error' });
//   }
// };

// // @desc Create a new transaction
// const createTransaction = async (req, res) => {
//   const { title, amount, type, category, walletId, date, notes } = req.body;
//   try {
//     const transaction = new Transaction({
//       userId: req.user._id,
//       title,
//       amount,
//       type,
//       category,
//       walletId,
//       date,
//       notes,
//     });
//     const saved = await transaction.save();
//     res.status(201).json(saved);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // @desc Update an existing transaction
// const updateTransaction = async (req, res) => {
//   try {
//     const transaction = await Transaction.findOneAndUpdate(
//       { _id: req.params.id, userId: req.user._id },
//       req.body,
//       { new: true }
//     );
//     if (!transaction) {
//       return res.status(404).json({ message: 'Transaction not found' });
//     }
//     res.json(transaction);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // @desc Delete a transaction
// const deleteTransaction = async (req, res) => {
//   try {
//     const transaction = await Transaction.findOneAndDelete({
//       _id: req.params.id,
//       userId: req.user._id
//     });
//     if (!transaction) {
//       return res.status(404).json({ message: 'Transaction not found' });
//     }
//     res.json({ message: 'Transaction deleted' });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// module.exports = {
//   getTransactions,
//   createTransaction,
//   updateTransaction,
//   deleteTransaction,
// };


const Transaction = require('../models/Transaction');

// ✅ TEMP USER ID FOR LOCAL TESTING
const TEST_USER_ID = '665f8d3a1fcf84c66e65e91a'; // ⚠️ Make sure this ID exists in your MongoDB Users collection

// @desc Get all transactions for test user
const getTransactions = async (req, res) => {
  try {
    console.log('📥 [GET] Fetching transactions for user:', TEST_USER_ID);
    const transactions = await Transaction.find({ userId: TEST_USER_ID }).sort({ createdAt: -1 });
    console.log('✅ [GET] Found transactions:', transactions.length);
    res.json(transactions);
  } catch (error) {
    console.error('❌ [GET] Server error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc Create new transaction
const createTransaction = async (req, res) => {
  const { title, amount, type, category, walletId, date, notes } = req.body;
  try {
    console.log('📥 [POST] Creating transaction:', req.body);
    const transaction = new Transaction({
      userId: TEST_USER_ID,
      title,
      amount,
      type,
      category,
      walletId,
      date,
      notes,
    });

    const saved = await transaction.save();
    console.log('✅ [POST] Transaction created with ID:', saved._id);
    res.status(201).json(saved);
  } catch (error) {
    console.error('❌ [POST] Error creating transaction:', error.message);
    res.status(400).json({ error: error.message });
  }
};

// @desc Update transaction
const updateTransaction = async (req, res) => {
  try {
    console.log('📥 [PUT] Updating transaction ID:', req.params.id);
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: TEST_USER_ID },
      req.body,
      { new: true }
    );

    if (!transaction) {
      console.log('⚠️ [PUT] Transaction not found');
      return res.status(404).json({ message: 'Transaction not found' });
    }

    console.log('✅ [PUT] Transaction updated:', transaction);
    res.json(transaction);
  } catch (error) {
    console.error('❌ [PUT] Error updating transaction:', error.message);
    res.status(400).json({ error: error.message });
  }
};

// @desc Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    console.log('📥 [DELETE] Deleting transaction ID:', req.params.id);
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: TEST_USER_ID
    });

    if (!transaction) {
      console.log('⚠️ [DELETE] Transaction not found');
      return res.status(404).json({ message: 'Transaction not found' });
    }

    console.log('✅ [DELETE] Transaction deleted');
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('❌ [DELETE] Error deleting transaction:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
