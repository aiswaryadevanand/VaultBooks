
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const logAudit = require('../utils/logAudit');
const { models } = require('mongoose');
const Wallet=require('../models/Wallet');
const mongoose=require('mongoose')

const calculateNextDate = (date, frequency) => {
  const next = new Date(date);
  switch (frequency) {
    case 'daily': next.setDate(next.getDate() + 1); break;
    case 'weekly': next.setDate(next.getDate() + 7); break;
    case 'monthly': next.setMonth(next.getMonth() + 1); break;
    case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
};

const getTransactions = async (req, res) => {
  try {
    const { walletId } = req.query;

    if (!walletId || !mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ message: 'Invalid or missing walletId' });
    }

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const transactions = await Transaction.find({ walletId });
    res.status(200).json(transactions);
  } catch (err) {
    console.error('Error in getTransactions:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const createTransaction = async (req, res) => {
  const userId = req.user.userId;
  const {
    category, amount, type, note, date, tags,
    walletId, toWalletId, recurring, frequency
  } = req.body;

  const fileUrl = req.file ? `uploads/${req.file.filename}` : null;
  const nextDate = recurring && frequency ? calculateNextDate(date, frequency) : null;

  try {
    const numericAmount = parseFloat(amount);

    if (type === 'transfer') {
      if (!walletId || !toWalletId || walletId === toWalletId) {
        return res.status(400).json({ error: 'Invalid transfer wallets' });
      }

      const fromTx = new Transaction({
        userId, type, category, amount: numericAmount, note, date, tags,
        walletId, toWalletId, fileUrl, recurring, frequency,
        nextDate, isMirror: false,
      });

      const toTx = new Transaction({
        userId, type, category, amount: numericAmount, note, date, tags,
        walletId: toWalletId, toWalletId: walletId, fileUrl,
        recurring, frequency, nextDate, isMirror: true,
      });

      await fromTx.save();
      await toTx.save();

      await logAudit({
        userId,
        walletId,
        action: 'create-transaction-transfer',
        details: {
          fromWallet: walletId,
          toWallet: toWalletId,
          amount,
          category,
          note
        }
      });

      return res.status(201).json({ from: fromTx, to: toTx });
    }

    const transaction = new Transaction({
      userId, type, category, amount: numericAmount, note, date, tags,
      walletId, fileUrl, recurring, frequency, nextDate, isMirror: false,
    });

    const saved = await transaction.save();

    if (type === 'expense') {
      const budget = await Budget.findOne({
        walletId,
        userId,
        category: { $regex: new RegExp(`^${category}$`, 'i') },
      });
      if (budget) {
        budget.spent = parseFloat(budget.spent || 0) + numericAmount;
        await budget.save();
      }
    }

    await logAudit({
      userId,
      walletId,
      action: 'create-transaction',
      details: { category, amount, type, note }
    });

    res.status(201).json(saved);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(400).json({ error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  const userId = req.user.userId;
  const transactionId = req.params.id;
  const {
    category, amount, type, note, date, tags,
    walletId, toWalletId, recurring, frequency
  } = req.body;

  const fileUrl = req.file ? `uploads/${req.file.filename}` : null;
  const nextDate = recurring && frequency ? calculateNextDate(date, frequency) : null;

  try {
    const numericAmount = parseFloat(amount);

    const existing = await Transaction.findOne({ _id: transactionId, userId });
    if (!existing) return res.status(404).json({ message: 'Transaction not found' });

    if (existing.isMirror) {
      return res.status(400).json({ message: 'Cannot edit mirrored transaction directly' });
    }

    if (existing.type === 'expense') {
      const oldBudget = await Budget.findOne({
        walletId: existing.walletId,
        userId,
        category: { $regex: new RegExp(`^${existing.category}$`, 'i') },
      });
      if (oldBudget) {
        oldBudget.spent = Math.max(0, oldBudget.spent - existing.amount);
        await oldBudget.save();
      }
    }

    const updatedFields = {
      category, amount: numericAmount, type, note, date, tags,
      walletId, toWalletId, recurring, frequency, nextDate
    };
    if (fileUrl) updatedFields.fileUrl = fileUrl;

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId },
      updatedFields,
      { new: true }
    );

    if (updatedTransaction.type === 'expense') {
      const newBudget = await Budget.findOne({
        walletId,
        userId,
        category: { $regex: new RegExp(`^${category}$`, 'i') },
      });
      if (newBudget) {
        newBudget.spent = parseFloat(newBudget.spent || 0) + numericAmount;
        await newBudget.save();
      }
    }

    if (updatedTransaction.type === 'transfer') {
      await Transaction.findOneAndUpdate({
        userId,
        type: 'transfer',
        isMirror: true,
        amount: existing.amount,
        date: existing.date,
        category: existing.category,
        walletId: existing.toWalletId,
        toWalletId: existing.walletId,
      }, {
        category, amount: numericAmount, note, date, tags,
        walletId: toWalletId, toWalletId: walletId,
        recurring, frequency, nextDate,
        ...(fileUrl && { fileUrl }),
      });
    }

    await logAudit({
      userId,
      walletId,
      action: 'update-transaction',
      details: { transactionId, category, amount, note }
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(400).json({ error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (transaction.type === 'transfer') {
      const mirrorTx = await Transaction.findOne({
        userId,
        type: 'transfer',
        isMirror: !transaction.isMirror,
        amount: transaction.amount,
        date: transaction.date,
        category: transaction.category,
        walletId: transaction.toWalletId,
        toWalletId: transaction.walletId,
      });
      if (mirrorTx) await mirrorTx.deleteOne();
    }

    if (transaction.type === 'expense') {
      const budget = await Budget.findOne({
        walletId: transaction.walletId,
        userId,
        category: { $regex: new RegExp(`^${transaction.category}$`, 'i') },
      });
      if (budget) {
        budget.spent = Math.max(0, parseFloat(budget.spent || 0) - parseFloat(transaction.amount));
        await budget.save();
      }
    }

    await transaction.deleteOne();

    await logAudit({
      userId,
      walletId: transaction.walletId,
      action: 'delete-transaction',
      details: {
        transactionId: transaction._id,
        amount: transaction.amount,
        category: transaction.category
      }
    });

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
