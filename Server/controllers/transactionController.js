
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// TEMP user ID for local testing
const TEST_USER_ID = '665f8d3a1fcf84c66e65e91a';

// @desc Get all transactions for test user with wallet info
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: TEST_USER_ID })
      .populate({
        path: 'walletId',
        select: 'name type' // include wallet name and type
      })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc Create new transaction
const createTransaction = async (req, res) => {
  const { category, amount, type, note, date, tags, walletId } = req.body;
  const fileUrl = req.file ? `uploads/${req.file.filename}` : null;

  try {
    const transaction = new Transaction({
      userId: TEST_USER_ID,
      walletId,
      type,
      category,
      amount,
      note,
      date,
      tags,
      fileUrl
    });

    const saved = await transaction.save();

    // Update budget if it's an expense
    if (type === 'expense') {
      const budget = await Budget.findOne({ walletId, category });
      if (budget) {
        budget.spent += amount;
        await budget.save();
      }
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// @desc Update transaction
const updateTransaction = async (req, res) => {
  const transactionId = req.params.id;
  const { category, amount, type, note, date, tags, walletId } = req.body;
  const fileUrl = req.file ? `uploads/${req.file.filename}` : null;

  try {
    const existing = await Transaction.findOne({ _id: transactionId, userId: TEST_USER_ID });

    if (!existing) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Rollback old budget if old type was expense
    if (existing.type === 'expense') {
      const oldBudget = await Budget.findOne({ walletId: existing.walletId, category: existing.category });
      if (oldBudget) {
        oldBudget.spent = Math.max(0, oldBudget.spent - existing.amount);
        await oldBudget.save();
      }
    }

    // Prepare updated fields
    const updatedFields = {
      category,
      amount,
      type,
      note,
      date,
      tags,
      walletId
    };

    if (fileUrl) {
      updatedFields.fileUrl = fileUrl;
    }

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId: TEST_USER_ID },
      updatedFields,
      { new: true }
    );

    // Update new budget if new type is expense
    if (updatedTransaction.type === 'expense') {
      const newBudget = await Budget.findOne({ walletId: updatedTransaction.walletId, category: updatedTransaction.category });
      if (newBudget) {
        newBudget.spent += updatedTransaction.amount;
        await newBudget.save();
      }
    }

    res.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// @desc Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: TEST_USER_ID
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update budget if deleted transaction was an expense
    if (deleted.type === 'expense') {
      const budget = await Budget.findOne({ walletId: deleted.walletId, category: deleted.category });
      if (budget) {
        budget.spent = Math.max(0, budget.spent - deleted.amount);
        await budget.save();
      }
    }

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
