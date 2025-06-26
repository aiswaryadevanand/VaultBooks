
const Transaction = require('../models/Transaction');

// TEMP user ID for local testing
const TEST_USER_ID = '665f8d3a1fcf84c66e65e91a';

// @desc Get all transactions for test user
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: TEST_USER_ID }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc Create new transaction
const createTransaction = async (req, res) => {
  const {
    category,
    amount,
    type,
    note,
    date,
    tags,
    walletId
  } = req.body;

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
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc Update transaction

const updateTransaction = async (req, res) => {
  try {
    const {
      category,
      amount,
      type,
      note,
      date,
      tags,
      walletId
    } = req.body;

    const updatedFields = {
      category,
      amount,
      type,
      note,
      date,
      walletId,
      tags,
    };

    if (req.file) {
      updatedFields.fileUrl = `uploads/${req.file.filename}`;
    }

    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: TEST_USER_ID },
      updatedFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(updated);
  } catch (error) {
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

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
